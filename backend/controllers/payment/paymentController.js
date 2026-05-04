// crypto.controller.js
import axios from 'axios';
import speakeasy from 'speakeasy';
import { v4 as uuidv4 } from 'uuid';
import { createHmac } from 'crypto';
import Transaction from '../../models/payment/transaction.js';
import Wallet from '../../models/payment/wallet.js';
import mongoose from 'mongoose';
import createHttpError from 'http-errors';
import { getIO } from '../../socket.js';

// --- Configuration ---
const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const NOWPAYMENTS_EMAIL = process.env.NOWPAYMENTS_EMAIL;
const NOWPAYMENTS_PASSWORD = process.env.NOWPAYMENTS_PASSWORD;
const NOWPAYMENTS_IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;
const NOWPAYMENTS_DEPOSIT_IPN_URL = process.env.NOWPAYMENTS_DEPOSIT_IPN_URL;
const NOWPAYMENTS_WITHDRAW_IPN_URL = process.env.NOWPAYMENTS_WITHDRAW_IPN_URL;
const NOWPAYMENTS_API_BASE_URL = 'https://api.nowpayments.io/v1';
const NOWPAYMENTS_2FA_SECRET = process.env.NOWPAYMENTS_2FA_SECRET; // for 2FA (from google auth setup)

// --------------------------------------------------------
// --- Bearer Token Helper (auto-refresh) ---
// --------------------------------------------------------
let cachedToken = null;
let tokenExpiry = 0; // epoch ms

const fetchNowPaymentsToken = async () => {
  if (!NOWPAYMENTS_EMAIL || !NOWPAYMENTS_PASSWORD) {
    throw new Error('NOWPAYMENTS_EMAIL and NOWPAYMENTS_PASSWORD must be set in environment');
  }

  try {
    const resp = await axios.post(
      `${NOWPAYMENTS_API_BASE_URL}/auth`,
      { email: NOWPAYMENTS_EMAIL, password: NOWPAYMENTS_PASSWORD },
      {
        headers: {
          'x-api-key': NOWPAYMENTS_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    const token = resp.data?.token;
    if (!token) throw new Error('No token returned from NowPayments /auth');

    cachedToken = token;
    // token lifetime is not documented precisely; cache for ~23 hours
    tokenExpiry = Date.now() + 23 * 60 * 60 * 1000;
    return token;
  } catch (err) {
    console.error('Error fetching NowPayments token:', err.response?.data || err.message);
    throw err;
  }
};

const getNowPaymentsToken = async () => {
  if (!cachedToken || Date.now() >= tokenExpiry) {
    return fetchNowPaymentsToken();
  }
  return cachedToken;
};

// --------------------------------------------------------
// --- Utils ---
// --------------------------------------------------------
const toD128 = (v) => {
  if (v === null || v === undefined || v === '') return mongoose.Types.Decimal128.fromString('0');
  const s = String(v).replace(/,/g, '').trim();
  if (s === '' || /^NaN$/i.test(s)) return mongoose.Types.Decimal128.fromString('0');
  return mongoose.Types.Decimal128.fromString(s);
};

const decimal128ToNumber = (d) => {
  if (d === undefined || d === null) return 0;
  try {
    // Decimal128#toString returns canonical decimal string
    return parseFloat(d.toString());
  } catch {
    return 0;
  }
};

const safeParseFloat = (v, def = 0) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : def;
};

// HMAC verification (NOWPayments sends HMAC over sorted JSON)
const verifyHmacSignature = (data, signature, secret) => {
  try {
    const sorted = {};
    Object.keys(data || {})
      .sort()
      .forEach((k) => {
        sorted[k] = data[k];
      });
    const payload = JSON.stringify(sorted);
    const h = createHmac('sha512', secret);
    h.update(payload);
    const digest = h.digest('hex');
    return digest === signature;
  } catch (e) {
    console.error('HMAC verify error:', e.message);
    return false;
  }
};

// Map NP statuses → your schema enums (uppercased)
const mapStatus = (npStatus) => {
  if (!npStatus) return 'PENDING';
  const s = String(npStatus).toUpperCase();
  if (['CREATING', 'WAITING', 'SENDING', 'FINISHED', 'REJECTED'].includes(s)) return s;
  if (s === 'CONFIRMED' || s === 'COMPLETED' || s === 'FINISHED') return 'COMPLETED';
  if (s === 'FAILED' || s === 'EXPIRED' || s === 'CANCELLED') return 'FAILED';
  return s;
};

// Normalize fee object keys from provider & transaction
const normalizeFeeObj = (fee) => {
  if (!fee) return { depositFee: 0, serviceFee: 0, withdrawalFee: 0, currency: null };
  return {
    depositFee: safeParseFloat(fee.depositFee ?? fee.deposit_fee ?? fee.deposit ?? 0, 0),
    serviceFee: safeParseFloat(fee.serviceFee ?? fee.service_fee ?? fee.service ?? 0, 0),
    withdrawalFee: safeParseFloat(fee.withdrawalFee ?? fee.withdrawal_fee ?? fee.withdrawal ?? 0, 0),
    currency: fee.currency ?? null,
  };
};

// Compute net amount to credit to wallet for a deposit IPN.
// Priority: use outcome_amount if present (NP typically supplies net amount).
// Fallback: actually_paid - sum(fees) (defensive).
const computeNetCredit = (ipn = {}, transaction = {}) => {
  const outcome = ipn.outcome_amount ?? transaction.outcomeAmount ?? null;
  if (outcome !== null && outcome !== undefined && outcome !== '') {
    return safeParseFloat(outcome, 0);
  }
  const actuallyPaid = safeParseFloat(ipn.actually_paid ?? transaction.actuallyPaid ?? 0, 0);
  const fees = normalizeFeeObj(ipn.fee ?? transaction.fee ?? {});
  const totalFees = fees.depositFee + fees.serviceFee + fees.withdrawalFee;
  const net = actuallyPaid - totalFees;
  return Math.max(0, net);
};

// Helper: try to run an operation inside a transaction if possible; otherwise run fallback
const withSessionIfPossible = async (fn) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    const result = await fn(session);
    await session.commitTransaction();
    session.endSession();
    return result;
  } catch (err) {
    if (session) {
      try {
        await session.abortTransaction();
        session.endSession();
      } catch (e) {
        /* ignore */
      }
    }
    // rethrow to let caller fallback or handle
    throw err;
  }
};

// --------------------------------------------------------
// --- Generate Deposit Payment Request ---
// --------------------------------------------------------
export const generateDeposit = async (req, res) => {
  const { amount, asset } = req.body;
  const userId = req.user.id;
  console.log("this is userId", userId);

  if (!amount || !asset || !userId) {
    return res.status(400).json({ message: 'Missing required fields: amount, asset, or userId.' });
  }

  const platformOrderId = `DEPOSIT-${userId}-${uuidv4()}`;
  const paymentPayload = {
    price_amount: parseFloat(amount), // fiat amount (USD)
    price_currency: 'usd',
    pay_currency: asset,
    order_id: platformOrderId,
    ipn_callback_url: NOWPAYMENTS_DEPOSIT_IPN_URL,
  };

  try {
    // Create payment via NowPayments
    const response = await axios.post(`${NOWPAYMENTS_API_BASE_URL}/payment`, paymentPayload, {
      headers: {
        'x-api-key': NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    const p = response.data;

    // Save transaction record
    await Transaction.create({
      userId,
      destinationAddress: p.pay_address,
      asset: p.pay_currency, // e.g. "usdtmatic"
      type: 'Deposit',
      status: 'PENDING',
      transactionMode: 'crypto',

      // known financials
      priceAmount: toD128(p.price_amount), // USD requested
      priceCurrency: p.price_currency || 'usd',
      payAmount: toD128(p.pay_amount), // expected crypto
      payCurrency: p.pay_currency,

      // to be updated later via IPN
      actuallyPaid: toD128(0),
      outcomeAmount: toD128(0),
      outcomeCurrency: p.pay_currency,

      fee: {
        currency: p.pay_currency,
        depositFee: toD128(0),
        serviceFee: toD128(0),
        withdrawalFee: toD128(0),
      },

      metadata: {
        payment_id: p.payment_id,
        order_id: platformOrderId,
        purchase_id: p.purchase_id || null,
        network: p.network || null,
        pay_address: p.pay_address || null,
      },
    });

    // Update or create user wallet atomically
    const walletUpdate = {
      $inc: {
        pendingIncoming: mongoose.Types.Decimal128.fromString(
          String(safeParseFloat(p.pay_amount ?? 0, 0))
        ),
      },
      $setOnInsert: {
        userId,
        asset: p.pay_currency,
        depositAddress: p.pay_address, // only on first creation
      },
    };

    try {
      await withSessionIfPossible(async (session) => {
        await Wallet.findOneAndUpdate(
          { userId, asset: p.pay_currency },
          walletUpdate,
          { upsert: true, new: true, session }
        );
      });
    } catch (err) {
      // Fallback without session
      await Wallet.findOneAndUpdate(
        { userId, asset: p.pay_currency },
        walletUpdate,
        { upsert: true, new: true }
      );
    }

    // Success response
    return res.status(200).json({
      message: 'Deposit address generated successfully.',
      data: {
        paymentId: p.payment_id,
        orderId: platformOrderId,
        payAddress: p.pay_address,
        payAmount: p.pay_amount,
        payCurrency: p.pay_currency,
        priceAmount: p.price_amount,
        priceCurrency: p.price_currency,
        status: 'PENDING',
      },
    });
  } catch (error) {
    console.error('NowPayments API Error (payment):', error.response ? error.response.data : error.message);
    const errorMessage =
      error.response?.data?.message || 'Error creating payment via NowPayments.';
    return res.status(error.response ? error.response.status : 500).json({ message: errorMessage });
  }
};


// --------------------------------------------------------
// --- Handle Deposit IPN Callback ---
// --------------------------------------------------------
export const handleDepositIpn = async (req, res) => {
  const signature = req.headers['x-nowpayments-sig'];
  const ipn = req.body || {};

  console.log('This is the deposit detail', ipn);

  const {
    payment_id,
    order_id,
    payment_status,
    actually_paid,
    price_amount,
    price_currency,
    pay_amount,
    pay_currency,
    outcome_amount,
    outcome_currency,
    fee = {},
    confirmations,
    updated_at,
  } = ipn;

  try {
    // 1) Verify signature
    if (!verifyHmacSignature(ipn, signature, NOWPAYMENTS_IPN_SECRET)) {
      console.warn(`IPN Verification Failed for payment ${payment_id}`);
      return res.status(401).send('Invalid Signature');
    }

    // 2) Find transaction by metadata
    let transaction =
      (await Transaction.findOne({ 'metadata.payment_id': payment_id })) ||
      (await Transaction.findOne({ 'metadata.order_id': order_id }));

    if (!transaction) {
      console.warn(`Transaction not found for paymentId: ${payment_id}`);
      return res.status(200).send('Transaction not found.');
    }

    // 3) Map status
    const mapped = mapStatus(payment_status);

    // 4) Update core fields (financials & fee)
    const updateSet = {
      status: mapped,
      priceAmount: toD128(price_amount ?? transaction.priceAmount),
      priceCurrency: price_currency || transaction.priceCurrency,
      payAmount: toD128(pay_amount ?? transaction.payAmount),
      payCurrency: pay_currency || transaction.payCurrency,
      actuallyPaid: toD128(actually_paid ?? transaction.actuallyPaid),
      outcomeAmount: toD128(outcome_amount ?? transaction.outcomeAmount),
      outcomeCurrency: outcome_currency || transaction.outcomeCurrency,
      confirmations: confirmations ?? transaction.confirmations,
      'fee.currency': fee?.currency || transaction.fee?.currency || transaction.asset,
      'fee.depositFee': toD128(fee?.depositFee ?? fee?.deposit_fee ?? transaction.fee?.depositFee ?? 0),
      'fee.serviceFee': toD128(fee?.serviceFee ?? fee?.service_fee ?? transaction.fee?.serviceFee ?? 0),
      'fee.withdrawalFee': toD128(fee?.withdrawalFee ?? fee?.withdrawal_fee ?? transaction.fee?.withdrawalFee ?? 0),
      'metadata.updated_at': updated_at || new Date().toISOString(),
    };

    await Transaction.updateOne({ _id: transaction._id }, { $set: updateSet });

    // refresh transaction
    transaction = await Transaction.findById(transaction._id);

    // 5) Wallet updates + socket events
    const wallet = await Wallet.findOne({ userId: transaction.userId, asset: transaction.asset });

    let io;
    try {
      io = getIO();
    } catch {
      /* no-op if socket not started */
    }

    if (mapped === 'COMPLETED' || mapped === 'FINISHED') {
      // compute credit deterministically
      const credit = computeNetCredit(ipn, transaction); // number

      // expected payAmount to reduce pendingIncoming by (use transaction.payAmount)
      const expectedPay = safeParseFloat(pay_amount ?? (transaction.payAmount?.toString?.() ?? 0), 0);

      // Persist wallet changes atomically where possible: add credit to balance, reduce pendingIncoming by expected
      try {
        await withSessionIfPossible(async (session) => {
          // ensure wallet exists
          let w = await Wallet.findOne({ userId: transaction.userId, asset: transaction.asset }).session(session);
          if (!w) {
            // create new wallet doc
            w = await Wallet.create([{
              userId: transaction.userId,
              asset: transaction.asset,
              balance: toD128(0),
              pendingIncoming: toD128(0),
              pendingOutgoing: toD128(0),
              depositAddress: transaction.metadata?.pay_address ?? null,
            }], { session });
            w = w[0];
          }
          // update numbers using Decimal128 increments
          const incOps = {};
          if (credit !== 0) incOps.balance = mongoose.Types.Decimal128.fromString(String(credit));
          if (expectedPay !== 0) incOps.pendingIncoming = mongoose.Types.Decimal128.fromString(String(-expectedPay));

          // If no incOps (both zero) skip
          if (Object.keys(incOps).length) {
            await Wallet.findOneAndUpdate(
              { userId: transaction.userId, asset: transaction.asset },
              { $inc: incOps },
              { new: true, session }
            );
          }
        });
      } catch (err) {
        // fallback without transaction - best-effort atomic using findOneAndUpdate
        const incOps = {};
        if (credit !== 0) incOps.balance = mongoose.Types.Decimal128.fromString(String(credit));
        if (expectedPay !== 0) incOps.pendingIncoming = mongoose.Types.Decimal128.fromString(String(-expectedPay));
        if (Object.keys(incOps).length) {
          await Wallet.findOneAndUpdate(
            { userId: transaction.userId, asset: transaction.asset },
            { $inc: incOps },
            { upsert: true, new: true }
          );
        }
      }

      console.log(`Deposit ${order_id || payment_id} FINISHED. Credited ${credit}.`);

      if (io) {
        io.to(transaction.userId.toString()).emit('transaction_update', {
          type: 'deposit',
          payment_id,
          order_id,
          status: 'COMPLETED',
          asset: transaction.asset,
          payAmount: pay_amount,
          actuallyPaid: actually_paid,
          outcomeAmount: outcome_amount,
          fee,
          timestamp: new Date().toISOString(),
        });
      }
    } else if (mapped === 'FAILED' || mapped === 'REJECTED') {
      // rollback pendingIncoming (idempotent)
      const rollbackAmount = safeParseFloat(pay_amount ?? (transaction.payAmount?.toString?.() ?? 0), 0);
      if (rollbackAmount !== 0) {
        try {
          await withSessionIfPossible(async (session) => {
            const w = await Wallet.findOne({ userId: transaction.userId, asset: transaction.asset }).session(session);
            if (!w) return;
            // reduce pendingIncoming by rollbackAmount but never below 0
            const currentPending = decimal128ToNumber(w.pendingIncoming);
            const newPending = Math.max(0, currentPending - rollbackAmount);
            await Wallet.updateOne(
              { _id: w._id },
              { $set: { pendingIncoming: mongoose.Types.Decimal128.fromString(String(newPending)) } },
              { session }
            );
          });
        } catch (err) {
          // fallback
          const w = await Wallet.findOne({ userId: transaction.userId, asset: transaction.asset });
          if (w) {
            const currentPending = decimal128ToNumber(w.pendingIncoming);
            const newPending = Math.max(0, currentPending - rollbackAmount);
            w.pendingIncoming = mongoose.Types.Decimal128.fromString(String(newPending));
            await w.save();
          }
        }
      }

      console.log(`Deposit ${order_id || payment_id} ${String(payment_status).toUpperCase()}.`);

      if (io) {
        io.to(transaction.userId.toString()).emit('transaction_update', {
          type: 'deposit',
          payment_id,
          order_id,
          status: 'FAILED',
          asset: transaction.asset,
          payAmount: pay_amount,
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      // intermediate statuses: mirror to sockets
      if (io) {
        io.to(transaction.userId.toString()).emit('transaction_update', {
          type: 'deposit',
          payment_id,
          order_id,
          status: mapStatus(payment_status),
          asset: transaction.asset,
          payAmount: pay_amount,
          timestamp: new Date().toISOString(),
        });
      }
    }

    return res.status(200).send('IPN processed.');
  } catch (error) {
    console.error('Deposit IPN Processing Error:', error);
    return res.status(200).send('Internal error during IPN processing.');
  }
};

// --------------------------------------------------------
// --- Create Withdrawal ---
// --------------------------------------------------------
export const createWithdrawal = async (req, res) => {
  const { amount, currency, address } = req.body;
  console.log("this is with balance", amount);
  const userId = req.user.id;
  const withdrawalAmount = parseFloat(amount);
  console.log("This is user currency", currency);
  if (!currency || !address || isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
    return res.status(400).json({ message: 'Invalid withdrawal amount, currency, or wallet address.' });
  }

  const platformPayoutId = `WITHDRAW-${userId}-${uuidv4()}`;

  // Load wallet and check balance + reserve atomically
  try {
    // Try to reserve funds with an atomic check: balance >= amount then $inc
    // We assume wallet.balance stores the free/available funds (i.e., already net of prior reservations).
    const reservation = await Wallet.findOneAndUpdate(
      {
        userId,
        asset: currency,
        balance: { $gte: mongoose.Types.Decimal128.fromString(String(withdrawalAmount)) },
      },
      {
        $inc: {
          balance: mongoose.Types.Decimal128.fromString(String(-withdrawalAmount)),
          pendingOutgoing: mongoose.Types.Decimal128.fromString(String(withdrawalAmount)),
        },
      },
      { new: true }
    );

    if (!reservation) {
      return res.status(403).json({ message: 'Insufficient balance for withdrawal.' });
    }
  } catch (err) {
    console.error('Error reserving withdrawal funds:', err);
    return res.status(500).json({ message: 'Error reserving withdrawal funds.' });
  }

  // Record transaction aligned to schema
  const tx = await Transaction.create({
    userId,
    destinationAddress: address,
    asset: currency,
    type: 'Withdrawal',
    status: 'PENDING',
    transactionMode: 'crypto',

    priceAmount: toD128(0),
    priceCurrency: 'usd',
    payAmount: toD128(withdrawalAmount),
    payCurrency: currency,
    actuallyPaid: toD128(0),
    outcomeAmount: toD128(0),
    outcomeCurrency: currency,

    fee: {
      currency,
      depositFee: toD128(0),
      serviceFee: toD128(0),
      withdrawalFee: toD128(0),
    },

    metadata: { platformPayoutId },
  });

  const payoutPayload = {
    ipn_callback_url: NOWPAYMENTS_WITHDRAW_IPN_URL,
    withdrawals: [
      {
        address,
        currency,
        amount: withdrawalAmount,
        unique_external_id: platformPayoutId,
        ipn_callback_url: NOWPAYMENTS_WITHDRAW_IPN_URL,
      },
    ],
  };

  try {
    const token = await getNowPaymentsToken();

    // Send payout
    const payoutResp = await axios.post(`${NOWPAYMENTS_API_BASE_URL}/payout`, payoutPayload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-api-key': NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    const payoutData = payoutResp.data;
    const batchId = payoutData?.id ?? null;
    const internalWithdrawalId = payoutData?.withdrawals?.[0]?.id ?? null; // NowPayments internal id
    const initialStatus = payoutData?.withdrawals?.[0]?.status || payoutData?.status || 'processing';

    // store identifiers (keep consistent keys)
    if (internalWithdrawalId || batchId) {
      await Transaction.updateOne(
        { _id: tx._id },
        {
          $set: {
            'metadata.providerWithdrawalId': internalWithdrawalId ?? batchId,
            'metadata.payout_batch_id': batchId ?? null,
          },
        }
      );
    }

    // Generate 2FA code and verify payout (NowPayments requires verify)
    if (batchId) {
      const verificationCode = speakeasy.totp({ secret: NOWPAYMENTS_2FA_SECRET, encoding: 'base32' });

      try {
        const verifyRes = await axios.post(
          `${NOWPAYMENTS_API_BASE_URL}/payout/${batchId}/verify`,
          { verification_code: verificationCode },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'x-api-key': NOWPAYMENTS_API_KEY,
              'Content-Type': 'application/json',
            },
          }
        );
        console.log('2FA verification response:', verifyRes.data);
      } catch (verifyErr) {
        console.error('2FA verification failed:', verifyErr.response?.data || verifyErr.message);
        // If verification fails, we should refund the reserved funds
        try {
          await Wallet.findOneAndUpdate(
            { userId, asset: currency },
            {
              $inc: {
                balance: mongoose.Types.Decimal128.fromString(String(withdrawalAmount)),
                pendingOutgoing: mongoose.Types.Decimal128.fromString(String(-withdrawalAmount)),
              },
            }
          );
        } catch (refundErr) {
          console.error('Failed to refund after 2FA failure:', refundErr);
        }

        return res.status(500).json({
          message: 'Withdrawal 2FA verification failed.',
          error: verifyErr.response?.data || verifyErr.message,
        });
      }
    }

    return res.status(200).json({
      message: 'Withdrawal request submitted successfully with 2FA verification.',
      data: {
        payoutId: batchId || platformPayoutId,
        status: String(initialStatus).toUpperCase(),
        currency,
        address,
        amount: withdrawalAmount,
        platformPayoutId,
        raw: payoutData,
      },
    });
  } catch (error) {
    console.error('NowPayments Payout API Error:', error.response?.data || error.message);

    // Refund reservation on failure
    try {
      await Wallet.findOneAndUpdate(
        { userId, asset: currency },
        {
          $inc: {
            balance: mongoose.Types.Decimal128.fromString(String(withdrawalAmount)),
            pendingOutgoing: mongoose.Types.Decimal128.fromString(String(-withdrawalAmount)),
          },
        }
      );
    } catch (refundErr) {
      console.error('Failed to refund after payout error:', refundErr);
    }

    const errorMessage = error.response?.data?.message || 'Error processing withdrawal via NowPayments.';
    return res.status(error.response?.status || 500).json({ message: errorMessage, raw: error.response?.data });
  }
};

// --------------------------------------------------------
// --- Handle Withdrawal IPN Callback ---
// --------------------------------------------------------
export const handleWithdrawalIpn = async (req, res) => {
  const signature = req.headers['x-nowpayments-sig'];
  const payoutUpdate = req.body || {};

  console.log('this is withdraw ipn response', payoutUpdate);

  const npBatchId = payoutUpdate?.id; // top-level id
  const status = payoutUpdate?.status; // e.g., 'finished', 'failed', 'rejected', 'expired', etc.

  console.log('Withdrawal IPN batch id:', npBatchId);

  try {
    // 1) verify IPN signature
    if (!verifyHmacSignature(payoutUpdate, signature, NOWPAYMENTS_IPN_SECRET)) {
      console.warn(`Withdrawal IPN verification failed for payout ${npBatchId}`);
      return res.status(401).send('Invalid Signature');
    }

    // 2) try to find matching transaction
    let transaction = null;

    if (Array.isArray(payoutUpdate.withdrawals)) {
      for (const w of payoutUpdate.withdrawals) {
        const uid = w?.unique_external_id || w?.external_id;
        if (uid) {
          transaction = await Transaction.findOne({ 'metadata.platformPayoutId': uid });
          if (transaction) break;
        }
      }
    }

    // Fallback: match providerWithdrawalId or batch id
    if (!transaction && npBatchId) {
      transaction =
        (await Transaction.findOne({ 'metadata.providerWithdrawalId': npBatchId })) ||
        (await Transaction.findOne({ 'metadata.payment_Id': npBatchId })) ||
        (await Transaction.findOne({ _id: npBatchId }));
    }

    if (!transaction) {
      console.warn(`Withdrawal transaction not found for payout: ${npBatchId}`);
      return res.status(200).send('Transaction not found.');
    }

    // Avoid double-processing
    const currentStatus = String(transaction.status || '').toUpperCase();
    if (['COMPLETED', 'FAILED'].includes(currentStatus)) {
      return res.status(200).send('Status already final.');
    }

    const wallet = await Wallet.findOne({ userId: transaction.userId, asset: transaction.asset });

    let io;
    try {
      io = getIO();
    } catch {
      /* ignore */
    }

    // txnAmount: canonical amount requested to withdraw
    const txnAmount = safeParseFloat(transaction.payAmount?.toString?.() ?? transaction.amount ?? 0, 0);
    const mapped = mapStatus(status);

    if (mapped === 'COMPLETED') {
      transaction.status = 'COMPLETED';
      // Optionally store outcome amounts/fees if NP includes them
      if (payoutUpdate?.fee) {
        const feeNorm = normalizeFeeObj(payoutUpdate.fee);
        transaction.fee = {
          currency: feeNorm.currency ?? transaction.asset,
          depositFee: toD128(feeNorm.depositFee),
          serviceFee: toD128(feeNorm.serviceFee),
          withdrawalFee: toD128(feeNorm.withdrawalFee),
        };
      }
      await transaction.save();

      if (wallet) {
        // deduct pendingOutgoing by txnAmount (idempotently)
        const currentPending = decimal128ToNumber(wallet.pendingOutgoing);
        const newPending = Math.max(0, currentPending - txnAmount);
        wallet.pendingOutgoing = mongoose.Types.Decimal128.fromString(String(newPending));
        await wallet.save();
      }

      if (io) {
        io.to(transaction.userId.toString()).emit('transaction_update', {
          type: 'withdrawal',
          payout_batch_id: npBatchId,
          platformPayoutId: transaction.metadata?.platformPayoutId,
          status: 'COMPLETED',
          amount: txnAmount,
          asset: transaction.asset,
          txId: transaction._id,
          timestamp: new Date().toISOString(),
        });
      }
    } else if (mapped === 'FAILED' || mapped === 'REJECTED') {
      transaction.status = 'FAILED';
      await transaction.save();

      if (wallet) {
        // refund: add back to balance and reduce pendingOutgoing, idempotent
        const currentPending = decimal128ToNumber(wallet.pendingOutgoing);
        const toRefund = Math.min(currentPending, txnAmount);
        if (toRefund > 0) {
          await Wallet.findOneAndUpdate(
            { _id: wallet._id },
            {
              $inc: {
                balance: mongoose.Types.Decimal128.fromString(String(toRefund)),
                pendingOutgoing: mongoose.Types.Decimal128.fromString(String(-toRefund)),
              },
            }
          );
        }
      }

      if (io) {
        io.to(transaction.userId.toString()).emit('transaction_update', {
          type: 'withdrawal',
          payout_batch_id: npBatchId,
          platformPayoutId: transaction.metadata?.platformPayoutId,
          status: 'FAILED',
          amount: txnAmount,
          asset: transaction.asset,
          txId: transaction._id,
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      // other intermediate statuses: update transaction.status and notify
      transaction.status = mapped;
      await transaction.save();

      if (io) {
        io.to(transaction.userId.toString()).emit('transaction_update', {
          type: 'withdrawal',
          payout_batch_id: npBatchId,
          platformPayoutId: transaction.metadata?.platformPayoutId,
          status: transaction.status,
          amount: txnAmount,
          asset: transaction.asset,
          txId: transaction._id,
          timestamp: new Date().toISOString(),
        });
      }
    }

    return res.status(200).send('Withdrawal IPN processed.');
  } catch (error) {
    console.error('Withdrawal IPN processing error:', error);
    return res.status(200).send('Internal error during IPN processing.');
  }
};

// --------------------------------------------------------
// --- User Total Balance ---
// --------------------------------------------------------

/**
 * Calculate user's balances across all assets
 * @param {ObjectId} userId - MongoDB ObjectId of the user
 * @returns {Object} { totalBalanceByAsset, totalAvailable, totalWithPending }
 *
 * NOTE: This function assumes `wallet.balance` stores *available/free* funds (i.e. already reduced for pendingOutgoing),
 * and `pendingOutgoing` stores reserved amounts. `pendingIncoming` are future expected credits.
 *
 * totalAvailable = sum of available (wallet.balance)
 * totalWithPending = sum of (available + pendingOutgoing + pendingIncoming) — i.e. gross exposure/ownership
 */
export const calculateUserBalance = async (req, res) => {
  console.log("this is backend balance");

  try {
    // Use authenticated user ID if available, otherwise a fallback
    const userId = req.user?.id || '64f0c9b2e1a4f123456789ab';

    // Get all wallets for this user
    const userWallets = await Wallet.find({ userId });

    if (!userWallets.length) {
      // ✅ Always send a response to frontend
      return res.json({
        balances: {
          totalBalanceByAsset: {},
          totalAvailable: 0,
          totalWithPending: 0,
        },
        totalBalanceUSD: 0,
      });
    }

    // Track totals
    const totalBalanceByAsset = {};
    let totalAvailable = 0;
    let totalWithPending = 0;

    userWallets.forEach((w) => {
      const balance = decimal128ToNumber(w.balance);
      const pendingOut = decimal128ToNumber(w.pendingOutgoing);
      const pendingIn = decimal128ToNumber(w.pendingIncoming);

      const available = balance;
      const total = balance + pendingOut + pendingIn;

      totalBalanceByAsset[w.asset] = {
        balance,
        pendingIncoming: pendingIn,
        pendingOutgoing: pendingOut,
        available,
        total,
      };

      totalAvailable += available;
      totalWithPending += total;
    });

    console.log("this is backend balance", totalAvailable);

    // ✅ Send response in a shape the frontend expects:
    // - `balances` is an object keyed by asset (each value has pendingIncoming, etc.)
    return res.json({
      balances: totalBalanceByAsset,
      totalBalanceUSD: totalAvailable, // displayed as available balance
      totalAvailable,
      totalWithPending,
    });

  } catch (err) {
    console.error("Error calculating user balance:", err);
    return res.status(500).json({ error: "Failed to calculate user balance" });
  }
};


// --------------------------------------------------------
// --- User Transaction history ---
// --------------------------------------------------------
export const getTransactionHistory = async (req, res, next) => {
  try {
    const userId = req.user?.id || '64f0c9b2e1a4f123456789ab'; // fallback for testing
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw createHttpError(400, 'Invalid user ID');
    }

    const { page = 1, limit = 20, asset, type, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filters = { userId };

    if (asset) filters.asset = asset;
    if (type) filters.type = type;
    if (status) filters.status = status;

    const [transactions, total] = await Promise.all([
      Transaction.find(filters).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      Transaction.countDocuments(filters),
    ]);

    // Decimal128 will be strings in JSON; frontend can render as-is or format
    return res.status(200).json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Error fetching transaction history:', err);
    next(createHttpError(500, 'Failed to fetch transaction history'));
  }
};
