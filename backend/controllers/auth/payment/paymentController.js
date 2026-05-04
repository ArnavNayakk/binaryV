// crypto.controller.js (ESM Version)

// --- Imports ---
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { createHmac } from "crypto";
import Transaction from "../../../models/payment/transaction.js";
import Wallets from "../../../models/payment/wallet.js";

// --- Configuration ---
const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const NOWPAYMENTS_IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;
const NOWPAYMENTS_IPN_URL = process.env.NOWPAYMENTS_IPN_URL;
const NOWPAYMENTS_API_BASE_URL = "https://api.nowpayments.io/v1";

// --- Helper: HMAC Verification ---
const verifyHmacSignature = (data, signature, secret) => {
    const sortedData = {};
    Object.keys(data).sort().forEach(key => {
        sortedData[key] = data[key];
    });

    const sortedJsonString = JSON.stringify(sortedData);
    const hmac = createHmac("sha512", secret);
    hmac.update(sortedJsonString);

    return hmac.digest("hex") === signature;
};

// --------------------------------------------------------
// --- Generate Deposit Payment Request ---
// --------------------------------------------------------
export const generateDeposit = async (req, res) => {
    const { amount, asset } = req.body;
    const userId = req.user.id;

    if (!amount || !asset || !userId) {
        return res.status(400).json({
            message: "Missing required fields: amount, asset, or userId."
        });
    }

    const platformOrderId = `DEPOSIT-${userId}-${uuidv4()}`;
    const paymentPayload = {
        price_amount: parseFloat(amount).toFixed(2),
        price_currency: "usd",
        pay_currency: asset,
        order_id: platformOrderId,
        ipn_callback_url: NOWPAYMENTS_IPN_URL
    };

    try {
        const response = await axios.post(
            `${NOWPAYMENTS_API_BASE_URL}/payment`,
            paymentPayload,
            {
                headers: {
                    "x-api-key": NOWPAYMENTS_API_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        const paymentData = response.data;

        await Transaction.create({
            userId,
            destinationAddress: paymentData.pay_address,
            asset: paymentData.pay_currency,
            amount: paymentData.pay_amount,
            type: "Deposit",
            status: "PENDING",
            transactionMode: "crypto",
            metadata: {
                paymentId: paymentData.payment_id,
                orderId: platformOrderId
            }
        });

        await Wallets.findOneAndUpdate(
            { userId, asset: paymentData.pay_currency },
            {
                depositAddress: paymentData.pay_address,
                $inc: { pendingIncoming: paymentData.pay_amount }
            },
            { upsert: true, new: true }
        );

        return res.status(200).json({
            message: "Deposit address generated successfully.",
            data: {
                paymentId: paymentData.payment_id,
                payAddress: paymentData.pay_address,
                payAmount: paymentData.pay_amount,
                payCurrency: paymentData.pay_currency
            }
        });

    } catch (error) {
        console.error("NowPayments API Error:", error.response ? error.response.data : error.message);
        const errorMessage = error.response
            ? error.response.data.message || "Error creating payment via NowPayments."
            : "Internal Server Error.";

        return res.status(error.response ? error.response.status : 500).json({
            message: errorMessage
        });
    }
};

// --------------------------------------------------------
// --- Handle Deposit IPN Callback ---
// --------------------------------------------------------
export const handleDepositIpn = async (req, res) => {
    const signature = req.headers["x-nowpayments-sig"];
    const paymentUpdate = req.body;
    const { payment_id, payment_status, actually_paid, order_id } = paymentUpdate;

    try {
        if (!verifyHmacSignature(paymentUpdate, signature, NOWPAYMENTS_IPN_SECRET)) {
            console.warn(`IPN Verification Failed for payment ${payment_id}`);
            return res.status(401).send("Invalid Signature");
        }

        const transaction = await Transaction.findOne({ "metadata.paymentId": payment_id });
        if (!transaction) {
            console.warn(`Transaction not found for paymentId: ${payment_id}`);
            return res.status(200).send("Transaction not found.");
        }

        if (transaction.status === "COMPLETED") {
            return res.status(200).send("Status already updated.");
        }

        const wallet = await Wallets.findOne({
            userId: transaction.userId,
            asset: transaction.asset
        });

        if (payment_status === "finished") {
            transaction.status = "COMPLETED";
            transaction.amount = actually_paid || transaction.amount;
            await transaction.save();

            if (wallet) {
                wallet.balance = (
                    parseFloat(wallet.balance || 0) +
                    parseFloat(actually_paid)
                ).toFixed(8);

                wallet.pendingIncoming = (
                    parseFloat(wallet.pendingIncoming || 0) -
                    parseFloat(actually_paid)
                ).toFixed(8);

                await wallet.save();
            }

            console.log(`Deposit ${order_id} FINISHED. Credited ${actually_paid}.`);

        } else if (payment_status === "failed" || payment_status === "expired") {
            transaction.status = "FAILED";
            await transaction.save();

            if (wallet) {
                wallet.pendingIncoming = (
                    parseFloat(wallet.pendingIncoming || 0) -
                    parseFloat(transaction.amount)
                ).toFixed(8);

                await wallet.save();
            }

            console.log(`Deposit ${order_id} ${payment_status.toUpperCase()}.`);
        }

        return res.status(200).send("IPN processed.");

    } catch (error) {
        console.error("Deposit IPN Processing Error:", error);
        return res.status(200).send("Internal error during IPN processing.");
    }
};

// --------------------------------------------------------
// --- Create Withdrawal ---
// --------------------------------------------------------
export const createWithdrawal = async (req, res) => {
    const { amount, currency, address } = req.body;
    const userId = req.user.id;
    const withdrawalAmount = parseFloat(amount);

    if (!currency || !address || isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
        return res.status(400).json({
            message: "Invalid withdrawal amount, currency, or wallet address."
        });
    }

    const platformPayoutId = `WITHDRAW-${userId}-${uuidv4()}`;

    try {
        const wallet = await Wallets.findOne({ userId, asset: currency });

        wallet.balance = (parseFloat(wallet.balance) - withdrawalAmount).toFixed(8);
        wallet.pendingOutgoing = (parseFloat(wallet.pendingOutgoing || 0) + withdrawalAmount).toFixed(8);
        await wallet.save();

        await Transaction.create({
            userId,
            destinationAddress: address,
            asset: currency,
            amount: withdrawalAmount,
            type: "Withdrawal",
            status: "PENDING",
            transactionMode: "crypto",
            metadata: { platformPayoutId }
        });

        const payoutPayload = {
            withdrawals: [
                {
                    address,
                    currency,
                    amount: withdrawalAmount,
                    ipn_callback_url: NOWPAYMENTS_IPN_URL
                }
            ]
        };

        const response = await axios.post(
            "https://payouts.nowpayments.io/v1/payout",
            payoutPayload,
            {
                headers: {
                    "x-api-key": NOWPAYMENTS_API_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        const payoutData = response.data;

        return res.status(200).json({
            message: "Withdrawal request submitted successfully.",
            data: {
                payoutId: payoutData.id || platformPayoutId,
                status: payoutData.status || "processing"
            }
        });

    } catch (error) {
        console.error(
            "NowPayments Payout API Error:",
            error.response?.data || error.message
        );

        const wallet = await Wallets.findOne({ userId, asset: currency });
        if (wallet) {
            wallet.balance = (parseFloat(wallet.balance || 0) + withdrawalAmount).toFixed(8);
            wallet.pendingOutgoing = (parseFloat(wallet.pendingOutgoing || 0) - withdrawalAmount).toFixed(8);
            await wallet.save();
        }

        const errorMessage =
            error.response?.data?.message ||
            "Error processing withdrawal via NowPayments. Funds have been refunded.";

        return res.status(error.response?.status || 500).json({
            message: errorMessage
        });
    }
};

// --------------------------------------------------------
// --- Handle Withdrawal IPN Callback ---
// --------------------------------------------------------
export const handleWithdrawalIpn = async (req, res) => {
    const signature = req.headers["x-nowpayments-sig"];
    const payoutUpdate = req.body;
    const { payout_id, status, amount, id: platformPayoutId } = payoutUpdate;

    try {
        if (!verifyHmacSignature(payoutUpdate, signature, NOWPAYMENTS_IPN_SECRET)) {
            console.warn(`Withdrawal IPN verification failed for payout ${payout_id}`);
            return res.status(401).send("Invalid Signature");
        }

        const transaction = await Transaction.findOne({ "metadata.platformPayoutId": platformPayoutId });
        if (!transaction) {
            console.warn(`Withdrawal transaction not found for payoutId: ${platformPayoutId}`);
            return res.status(200).send("Transaction not found.");
        }

        const wallet = await Wallets.findOne({
            userId: transaction.userId,
            asset: transaction.asset
        });

        if (status === "finished") {
            transaction.status = "COMPLETED";
            await transaction.save();

            if (wallet) {
                wallet.pendingOutgoing = (
                    parseFloat(wallet.pendingOutgoing || 0) -
                    parseFloat(transaction.amount)
                ).toFixed(8);
                await wallet.save();
            }

            console.log(`Withdrawal ${platformPayoutId} COMPLETED. Amount: ${transaction.amount}`);

        } else if (status === "failed" || status === "expired") {
            transaction.status = "FAILED";
            await transaction.save();

            if (wallet) {
                wallet.balance = (
                    parseFloat(wallet.balance || 0) +
                    parseFloat(transaction.amount)
                ).toFixed(8);

                wallet.pendingOutgoing = (
                    parseFloat(wallet.pendingOutgoing || 0) -
                    parseFloat(transaction.amount)
                ).toFixed(8);

                await wallet.save();
            }

            console.log(`Withdrawal ${platformPayoutId} ${status.toUpperCase()}. Refunded amount.`);
        }

        return res.status(200).send("Withdrawal IPN processed.");

    } catch (error) {
        console.error("Withdrawal IPN processing error:", error);
        return res.status(200).send("Internal error during IPN processing.");
    }
};

// --------------------------------------------------------
// --- Export All Controllers (ESM) ---
// --------------------------------------------------------
export default {
    generateDeposit,
    handleDepositIpn,
    createWithdrawal,
    handleWithdrawalIpn
};
