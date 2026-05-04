import express from "express";
import {
    generateDeposit,
    createWithdrawal,

    calculateUserBalance,
    getTransactionHistory,
    handleDepositIpn,
    handleWithdrawalIpn
} from "../controllers/payment/paymentController.js";

import authUser from "../middleware/auth.js";

const TransactionRouter = express.Router();

// ------------------ CRYPTO PAYMENTS ------------------
TransactionRouter.post("/deposit-address", authUser, generateDeposit);
TransactionRouter.post("/withdraw", authUser, createWithdrawal);


//---------------
TransactionRouter.get("/balance", authUser, calculateUserBalance);

// ------------------ USER TRANSACTION HISTORY ------------------
TransactionRouter.get("/transactionHistory", authUser, getTransactionHistory);


// ------------------ IPN WEBHOOKS ------------------
TransactionRouter.post("/deposit-webhook", handleDepositIpn);
TransactionRouter.post("/withdraw-webhook", handleWithdrawalIpn);

export default TransactionRouter;
