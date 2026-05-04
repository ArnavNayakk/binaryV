import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Lottie from "lottie-react";
import cryptoLogos from "../../assets/cryptoLogos";
import api from "../../api/axiosClient";
import WalletNavlink from "../../components/Dashboard/WalletNavlink";
import successAnimation from "../../animations/success.json";
import errorAnimation from "../../animations/error.json";
import { useAuth } from "../../context/AuthContext";
import { usePayment } from "../../context/PaymentContext";
import { notifyError } from "../../lib/notify";
import { SOCKET_BASE_URL } from "../../config/api";

const DECIMAL_REGEX = /^[0-9]*\.?[0-9]*$/;

function sanitizeDecimalInput(raw) {
  if (raw === "" || raw === "." || DECIMAL_REGEX.test(raw)) {
    return raw;
  }
  return null;
}

function TransactionStepper({ status }) {
  const steps = [
    { label: "Initiated", key: "INITIATED" },
    { label: "Pending", key: "PENDING" },
    { label: "Processing", key: "SENDING" },
    { label: "Completed", key: "COMPLETED" },
  ];

  const getStepStatus = (stepKey) => {
    if (status === "FAILED" && stepKey === "PENDING") return "failed";
    if (stepKey === "COMPLETED" && status === "COMPLETED") return "completed";
    if (stepKey === status) return "active";
    const stepOrder = { INITIATED: 0, PENDING: 1, SENDING: 2, COMPLETED: 3 };
    return stepOrder[stepKey] < stepOrder[status] ? "completed" : "inactive";
  };

  return (
    <div className="w-full flex justify-between items-center mt-6 relative">
      {steps.map((step, idx) => {
        const stepState = getStepStatus(step.key);
        return (
          <div key={step.key} className="flex-1 flex flex-col items-center relative">
            {idx < steps.length - 1 && (
              <div className="ml-30 absolute top-2.5 left-1/2 w-full h-1 -translate-x-1/2 z-0 bg-gray-500">
                <div
                  className="h-1 transition-all duration-800"
                  style={{
                    width:
                      stepState === "completed" || stepState === "active"
                        ? "100%"
                        : "0%",
                    backgroundColor:
                      stepState === "failed"
                        ? "#f87171"
                        : stepState === "completed" || stepState === "active"
                          ? "#facc15"
                          : "transparent",
                  }}
                />
              </div>
            )}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center z-10 border-2 transition-colors duration-500 ${
                stepState === "completed"
                  ? "bg-green-500 border-green-500"
                  : stepState === "active"
                    ? "bg-green border-green"
                    : stepState === "failed"
                      ? "bg-red-500 border-red-500"
                      : "bg-gray-700 border-gray-500"
              }`}
            >
              {stepState === "completed" ? "✓" : stepState === "failed" ? "✕" : idx + 1}
            </div>
            <span
              className={`text-xs mt-2 text-center transition-colors duration-500 ${
                stepState === "completed"
                  ? "text-green-500"
                  : stepState === "active"
                    ? "text-yellow-400"
                    : stepState === "failed"
                      ? "text-red-500"
                      : "text-white/60"
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function CryptoWithdrawal() {
  const { crypto } = useParams();
  const { user } = useAuth();
  const { balances } = usePayment();
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [destinationAddress, setDestinationAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState(null);
  const [animationStatus, setAnimationStatus] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const found = cryptoLogos.find((item) => item.route.toLowerCase() === `/${crypto}`.toLowerCase());
    setSelectedCrypto(found || cryptoLogos[0]);
    setAmount("");
    setDestinationAddress("");
    setTxStatus(null);
    setAnimationStatus(null);
    setCopied(false);
  }, [crypto]);

  useEffect(() => {
    if (!user?._id) return undefined;

    const socket = io(SOCKET_BASE_URL, {
      withCredentials: true,
    });

    socket.on("transaction_update", (tx) => {
      const normalized = (tx.status || "").toUpperCase();
      const mapped =
        normalized === "FINISHED"
          ? "COMPLETED"
          : ["CREATING", "WAITING", "SENDING"].includes(normalized)
            ? "PENDING"
            : normalized;

      setTxStatus(mapped);

      if (mapped === "COMPLETED") {
        setAnimationStatus("success");
      } else if (mapped === "FAILED") {
        setAnimationStatus("fail");
      } else {
        setAnimationStatus(null);
      }
    });

    return () => {
      socket.off("transaction_update");
      socket.disconnect();
    };
  }, [user?._id]);

  const availableBalance = selectedCrypto
    ? Number(
        balances?.[selectedCrypto.symbol]?.available ||
          balances?.[selectedCrypto.COIN]?.available ||
          0
      )
    : 0;

  const predefinedAmounts = useMemo(() => {
    if (!selectedCrypto) return [];
    const min = Number(selectedCrypto.min || 0);
    const options = [min, min * 2, min * 5, min * 10]
      .filter((value) => value > 0)
      .map((value) => Number(value.toFixed(8)))
      .filter((value) => value <= availableBalance || availableBalance <= 0);
    return Array.from(new Set(options)).slice(0, 4);
  }, [availableBalance, selectedCrypto]);

  const handleWithdraw = async () => {
    if (!destinationAddress) return;
    const numeric = Number(amount);
    if (!Number.isFinite(numeric) || numeric <= 0) return;

    setLoading(true);
    setTxStatus("INITIATED");
    setAnimationStatus(null);

    try {
      const res = await api.post("/api/payment/withdraw", {
        currency: selectedCrypto.symbol,
        address: destinationAddress,
        amount: numeric,
      });

      setTxStatus("PENDING");
      return res.data;
    } catch (error) {
      let message =
        "Something went wrong while processing your withdrawal. Please try again.";

      const apiError = error?.response?.data;
      if (error.code === "ERR_NETWORK" || error.message?.includes("Network Error")) {
        message = "Network error - please check your internet connection and try again.";
      } else if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        message = "Request timed out - please try again shortly.";
      } else if (
        apiError?.code === "INSUFFICIENT_FUNDS" ||
        apiError?.message?.toLowerCase().includes("insufficient")
      ) {
        message = "You do not have enough balance for this withdrawal.";
      } else if (
        apiError?.code === "INVALID_ADDRESS" ||
        apiError?.message?.toLowerCase().includes("invalid address")
      ) {
        message = "The destination wallet address appears invalid. Please check it and try again.";
      } else if (apiError?.message) {
        message = apiError.message;
      } else if (error.message) {
        message = error.message;
      }

      notifyError(message);
      setTxStatus("FAILED");
      setAnimationStatus("fail");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!destinationAddress) return;
    navigator.clipboard.writeText(destinationAddress);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  if (!selectedCrypto) {
    return <div className="text-white text-center">Loading...</div>;
  }

  const logoPath = `/crypto-icons/${selectedCrypto.file}`;

  return (
    <div className="min-h-screen bg-gray-900">
      <WalletNavlink />

      <div className="max-w-5xl mx-auto mt-10 px-4 py-8">
        <div
          className="backdrop-blur-lg bg-white/5 rounded-2xl w-full space-y-6 text-white shadow-lg border border-white/10 overflow-hidden"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at top left, rgba(255,255,255,0.06), transparent 40%)",
          }}
        >
          {txStatus && <TransactionStepper status={txStatus} />}

          <div className="p-6 border-b border-white/10 flex items-center gap-4">
            <img
              src={logoPath}
              alt={selectedCrypto.name}
              className="w-12 h-12 object-contain rounded"
              loading="lazy"
            />
            <div>
              <h3 className="text-xl font-semibold">
                Withdraw {selectedCrypto.name}
              </h3>
              <p className="text-white/60 text-sm">
                Available Balance: {availableBalance} {selectedCrypto.symbol}
              </p>
            </div>
          </div>

          <div className="p-6 grid md:grid-cols-2 gap-6">
            <div className="bg-gray-800/60 rounded-xl border border-white/10 p-4">
              <h4 className="font-medium mb-2">Recipient Address</h4>

              {animationStatus === "success" ? (
                <div className="flex flex-col items-center justify-center">
                  <Lottie animationData={successAnimation} loop style={{ width: 200, height: 200 }} />
                  <p className="text-green-400 font-semibold mt-2 text-center">
                    Withdrawal Successful!
                  </p>
                </div>
              ) : animationStatus === "fail" ? (
                <div className="flex flex-col items-center justify-center">
                  <Lottie animationData={errorAnimation} loop style={{ width: 200, height: 200 }} />
                  <p className="text-red-400 font-semibold mt-2 text-center">
                    Withdrawal Failed!
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter recipient address"
                    className="flex-1 p-3 rounded bg-gray-700 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-green/60"
                    value={destinationAddress}
                    onChange={(e) => setDestinationAddress(e.target.value)}
                  />
                  <button
                    onClick={handleCopy}
                    className="px-3 py-2 bg-green rounded hover:bg-green/90 transition"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-gray-800/60 rounded-xl border border-white/10 p-4">
              <h4 className="font-medium mb-2">Amount</h4>
              <p className="text-white/60 text-sm mb-3">
                Suggested amounts are shown in {selectedCrypto.symbol}
              </p>

              <div className="flex gap-2 mb-3 flex-wrap">
                {predefinedAmounts.map((presetAmount) => (
                  <button
                    key={presetAmount}
                    onClick={() => setAmount(String(presetAmount))}
                    className={`px-3 py-2 rounded text-sm transition border ${
                      Number(amount) === presetAmount
                        ? "bg-green/20 text-green border-green/40"
                        : "bg-white/5 text-white/90 hover:bg-white/10 border-white/10"
                    }`}
                  >
                    {presetAmount} {selectedCrypto.symbol}
                  </button>
                ))}
              </div>

              <input
                type="text"
                inputMode="decimal"
                placeholder={`Enter amount (${selectedCrypto.symbol})`}
                className="w-full p-3 rounded bg-gray-700 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-green/60"
                value={amount}
                onChange={(e) => {
                  const next = sanitizeDecimalInput(e.target.value);
                  if (next !== null) setAmount(next);
                }}
                onBlur={() => {
                  if (amount && amount.endsWith(".")) setAmount(amount.slice(0, -1));
                }}
              />

              <button
                onClick={handleWithdraw}
                disabled={
                  loading ||
                  !destinationAddress ||
                  !amount ||
                  !Number.isFinite(Number(amount)) ||
                  Number(amount) <= 0
                }
                className="w-full mt-4 p-3 bg-green rounded hover:bg-green/90 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Withdraw"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
