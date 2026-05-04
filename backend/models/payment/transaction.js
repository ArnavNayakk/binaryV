import mongoose from "mongoose";

// 🔹 Subschema for detailed fee structure
const feeSchema = new mongoose.Schema({
  currency: { type: String },
  depositFee: { type: mongoose.Decimal128, default: 0 },
  serviceFee: { type: mongoose.Decimal128, default: 0 },
  withdrawalFee: { type: mongoose.Decimal128, default: 0 },
}, { _id: false });

// 🔹 Main Transaction schema
const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  destinationAddress: {
    type: String,
    required: true, // deposit or withdrawal address
  },

  asset: {
    type: String,
    required: true, // e.g., "usdtmatic"
  },

  type: {
    type: String,
    enum: ["Deposit", "Withdrawal"],
    required: true,
  },

  status: {
    type: String,
    enum: [
      "PENDING", "COMPLETED", "FAILED", "CANCELLED",
      "CREATING", "WAITING", "SENDING", "FINISHED", "REJECTED"
    ],
    default: "PENDING",
  },

  transactionMode: {
    type: String,
    enum: ["upi", "netbanking", "card", "wallet", "crypto"],
    default: "crypto",
  },

  // 💰 Financial fields (NOWPayments compatible)
  priceAmount: { type: mongoose.Decimal128, default: 0 },    // Original fiat value
  priceCurrency: { type: String, default: "usd" },

  payAmount: { type: mongoose.Decimal128, default: 0 },      // Expected crypto payment
  payCurrency: { type: String },

  actuallyPaid: { type: mongoose.Decimal128, default: 0 },   // Amount user actually sent
  outcomeAmount: { type: mongoose.Decimal128, default: 0 },  // Amount you received after fees
  outcomeCurrency: { type: String },

  fee: { type: feeSchema, default: {} },                     // Detailed fee info

  confirmations: { type: Number, default: 0 },               // Blockchain confirmations

  metadata: { type: Object, default: {} },                   // invoice_id, payment_id, etc.

}, { timestamps: true });

// 🔹 Helpful indexes for performance and idempotency
transactionSchema.index({ userId: 1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ "metadata.payment_id": 1 }, { unique: true, sparse: true });

export default mongoose.model("Transaction", transactionSchema);








//This for fireblock

// import mongoose from "mongoose";

// const transactionSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   sourceWallet: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Wallet",
//     required: function() { return this.type === "Withdrawal"; }, // only for withdrawals
//   },
//   vaultAccountId: {
//     type: String, // optional, helps reconcile Fireblocks vaults
//   },
//   destinationAddress: {
//     type: String,
//     required: true,
//   },
//   asset: {
//     type: String,
//     required: true,
//   },
//   amount: {
//     type: mongoose.Decimal128,
//     required: true,
//   },
//   type: {
//     type: String,
//     enum: ["Deposit", "Withdrawal"],
//     required: true,
//   },
//   status: {
//     type: String,
//     enum: ["PENDING", "COMPLETED", "FAILED", "CANCELLED"],
//     default: "PENDING",
//   },
//   transactionMode: {
//     type: String,
//     enum: ['upi','netbanking','card','wallet','crypto'],
//     default: 'crypto',
//   },
//   fireblocksTxId: {
//     type: String,
//     unique: true,
//     sparse: true, // allows null for manually created transactions
//   },
//   fee: {
//     type: mongoose.Decimal128,
//     default: 0,
//   },
//   confirmations: {
//     type: Number,
//     default: 0,
//   },
//   metadata: {
//     type: Object,
//     default: {},
//   },
// }, { timestamps: true });

// // Unique index on Fireblocks transaction ID to ensure idempotency
// transactionSchema.index({ fireblocksTxId: 1 }, { unique: true, sparse: true });

// export default mongoose.model("Transaction", transactionSchema);
