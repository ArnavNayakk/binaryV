import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import QRCode from "react-qr-code";
import { io } from "socket.io-client";
import Lottie from "lottie-react";
import { toast } from "react-hot-toast";
import cryptoLogos from "../../assets/cryptoLogos";
import api from "../../api/axiosClient";
import WalletNavlink from "../../components/Dashboard/WalletNavlink";
import successAnimation from "../../animations/success.json";
import errorAnimation from "../../animations/error.json";
import { useAuth } from "../../context/AuthContext";
import { SOCKET_BASE_URL } from "../../config/api";

const DECIMAL_REGEX = /^[0-9]*\.?[0-9]*$/;

function sanitizeDecimalInput(raw) {
  if (raw === "" || raw === "." || DECIMAL_REGEX.test(raw)) {
    if (raw.startsWith("0") && raw.length > 1 && raw[1] !== ".") {
      return String(Number(raw));
    }
    return raw;
  }
  return null;
}

function TransactionStepper({ status }) {
  const steps = [
    { label: "Initiated", key: "INITIATED" },
    { label: "Generate Address", key: "GENERATING_ADDRESS" },
    { label: "Pending", key: "PENDING" },
    { label: "Completed", key: "COMPLETED" },
  ];

  const getStepStatus = (stepKey) => {
    if (status === "FAILED" && stepKey === "PENDING") return "failed";
    if (stepKey === "COMPLETED" && status === "COMPLETED") return "completed";
    if (stepKey === status) return "active";
    const stepOrder = { INITIATED: 0, GENERATING_ADDRESS: 1, PENDING: 2, COMPLETED: 3 };
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
                          ? "#2cfa15"
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
                    ? "bg-white border-blue-100"
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

export default function CryptoDeposit() {
  const { crypto } = useParams();
  const { user } = useAuth();
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [amount, setAmount] = useState("");
  const [depositAddress, setDepositAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [txStatus, setTxStatus] = useState(null);
  const [animationStatus, setAnimationStatus] = useState(null);
  const [qrTimeLeft, setQrTimeLeft] = useState(0);
  const [amountError, setAmountError] = useState("");

  const predefinedAmounts = useMemo(() => {
    if (!selectedCrypto) return [];
    const min = Number(selectedCrypto.min || 0);
    const options = [min, min * 2, min * 5, min * 10]
      .filter((value) => value > 0)
      .map((value) => Number(value.toFixed(8)));
    return Array.from(new Set(options)).slice(0, 4);
  }, [selectedCrypto]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (qrTimeLeft <= 0) return undefined;
    const timer = window.setInterval(() => {
      setQrTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [qrTimeLeft]);

  useEffect(() => {
    const found = cryptoLogos.find((item) => item.route.toLowerCase() === `/${crypto}`.toLowerCase());
    setSelectedCrypto(found || cryptoLogos[0]);
    setAmount("");
    setDepositAddress("");
    setTxStatus(null);
    setCopied(false);
    setQrTimeLeft(0);
    setAnimationStatus(null);
    setAmountError("");
  }, [crypto]);

  useEffect(() => {
    if (!user?._id) return undefined;

    const socket = io(SOCKET_BASE_URL, {
      withCredentials: true,
    });

    socket.on("transaction_update", (tx) => {
      const nextStatus = tx?.status || null;
      setTxStatus(nextStatus);

      if (nextStatus === "COMPLETED") {
        setAnimationStatus("success");
      } else if (nextStatus === "FAILED") {
        setAnimationStatus("fail");
      }
    });

    return () => socket.disconnect();
  }, [user?._id]);

  const handleDeposit = async () => {
    if (!selectedCrypto) return;
    const numeric = Number(amount);

    if (!Number.isFinite(numeric) || numeric <= 0) {
      setAmountError("Please enter a valid amount");
      return;
    }

    setAmountError("");
    setLoading(true);
    setCopied(false);
    setTxStatus("INITIATED");
    setAnimationStatus(null);

    try {
      setTxStatus("GENERATING_ADDRESS");
      const res = await api.post("/api/payment/deposit-address", {
        asset: selectedCrypto.symbol,
        amount: numeric,
      });

      setDepositAddress(res.data?.data?.payAddress || "");
      setTxStatus("PENDING");
      setQrTimeLeft(15 * 60);
    } catch (error) {
      let message =
        "Something went wrong while generating your deposit address. Please try again.";

      const apiError = error?.response?.data;
      if (error.code === "ERR_NETWORK" || error.message?.includes("Network Error")) {
        message = "Network error - please check your internet connection and try again.";
      } else if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        message = "Request timed out - please try again.";
      } else if (apiError?.message) {
        message = apiError.message;
      } else if (error.message) {
        message = error.message;
      }

      toast.error(message, {
        style: {
          background: "rgba(17,24,39,0.95)",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.1)",
        },
      });

      setTxStatus("FAILED");
      setAnimationStatus("fail");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!depositAddress) return;
    navigator.clipboard.writeText(depositAddress);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  if (!selectedCrypto) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white/80">Loading crypto info...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <WalletNavlink />
      <main className="max-w-5xl mx-auto mt-10 px-4 py-8">
        <section
          className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-0 overflow-hidden"
          style={{ backgroundImage: "radial-gradient(ellipse at top left, rgba(255,255,255,0.06), transparent 40%)" }}
        >
          {txStatus && <TransactionStepper status={txStatus} />}
          <header className="flex items-center gap-4 p-6 border-b border-white/10">
            <img
              src={`/crypto-icons/${selectedCrypto.file}`}
              alt={selectedCrypto.name}
              className="w-12 h-12 object-contain rounded"
            />
            <div>
              <h1 className="text-white text-xl font-semibold">Deposit {selectedCrypto.name}</h1>
              <p className="text-white/60 text-sm">
                Suggested amounts are shown in {selectedCrypto.symbol} for this network
              </p>
            </div>
          </header>

          <div className="grid md:grid-cols-2 gap-6 p-6">
            <div className="rounded-xl bg-gray-800/60 border border-white/10 p-4">
              <h3 className="text-white font-medium mb-3">Enter amount</h3>

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
                className={`w-full p-3 rounded text-white placeholder-white/50 outline-none transition ${
                  amountError
                    ? "bg-gray-700 border border-red-500 focus:ring-2 focus:ring-red-500"
                    : "bg-gray-700 border border-white/10 focus:ring-2 focus:ring-green/60"
                }`}
                value={amount}
                onChange={(e) => {
                  const next = sanitizeDecimalInput(e.target.value);
                  if (next !== null) setAmount(next);
                  if (amountError) setAmountError("");
                }}
                onBlur={() => {
                  if (amount && amount.endsWith(".")) setAmount(amount.slice(0, -1));
                }}
              />

              {amountError && <p className="text-red-400 text-xs mt-2">{amountError}</p>}

              <button
                onClick={handleDeposit}
                disabled={loading || !amount || !Number.isFinite(Number(amount)) || Number(amount) <= 0}
                className="w-full mt-4 p-3 rounded font-semibold transition bg-green hover:bg-green/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Generating address..." : "Generate deposit address"}
              </button>
            </div>

            <div className="rounded-xl bg-gray-800/60 border border-white/10 p-4">
              <h3 className="text-white font-medium mb-3">Address and QR</h3>

              {animationStatus === "success" ? (
                <div className="flex flex-col items-center justify-center">
                  <Lottie animationData={successAnimation} loop style={{ width: 200, height: 200 }} />
                  <p className="text-green-400 font-semibold mt-2 text-center">Payment Successful!</p>
                </div>
              ) : animationStatus === "fail" ? (
                <div className="flex flex-col items-center justify-center">
                  <Lottie animationData={errorAnimation} loop style={{ width: 200, height: 200 }} />
                  <p className="text-red-400 font-semibold mt-2 text-center">Payment Failed!</p>
                </div>
              ) : depositAddress ? (
                <>
                  <p className="text-white/70 text-xs mb-2">Deposit address</p>
                  <p className="break-all text-white font-mono text-sm bg-black/30 rounded p-3 border border-white/10">
                    {depositAddress}
                  </p>

                  <div className="flex flex-col items-center py-4">
                    <div className="rounded-lg p-3 bg-gray-900 border border-white/10 mb-2">
                      <QRCode value={depositAddress} size={164} bgColor="#111827" fgColor="#FFFFFF" />
                    </div>

                    {qrTimeLeft > 0 ? (
                      <p className="text-yellow-400 font-mono text-lg">QR expires in: {formatTime(qrTimeLeft)}</p>
                    ) : (
                      <p className="text-red-500 font-semibold text-lg">QR Code Expired</p>
                    )}
                  </div>

                  <p className="text-white/80 text-sm text-center mt-2">
                    Deposit <span className="font-semibold">{amount || 0}</span>{" "}
                    <span className="font-semibold">{selectedCrypto.symbol}</span> via{" "}
                    <span className="font-semibold">{selectedCrypto.name}</span>
                  </p>

                  <button
                    onClick={handleCopy}
                    disabled={qrTimeLeft <= 0}
                    className="w-full mt-4 px-4 py-2 rounded bg-white/10 hover:bg-white/20 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {copied ? "Copied!" : "Copy address"}
                  </button>
                </>
              ) : (
                <div className="h-full min-h-48 flex items-center justify-center">
                  <p className="text-white/60 text-sm">
                    Generate a deposit address to view QR and copy controls
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
