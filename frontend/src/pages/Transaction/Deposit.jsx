import React from "react";
import { useNavigate } from "react-router-dom";
import WalletNavlink from "../../components/Dashboard/WalletNavlink";
import CryptoNetwork from "../../components/Payment/CryptoNetwork";
import {
  FaUniversity,
  FaWallet,
  FaMobileAlt,
  FaCreditCard,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaShieldAlt,
} from "react-icons/fa";

const ePaymentMethods = [
  {
    id: "upi",
    name: "UPI Transfer",
    status: "Available",
    statusTone: "green",
    note: "Instant confirmation for supported banks",
    eta: "Usually under 2 min",
    icon: FaMobileAlt,
    action: "Continue with UPI",
  },
  {
    id: "card",
    name: "Debit / Credit Card",
    status: "Coming soon",
    statusTone: "amber",
    note: "Visa, Mastercard and domestic cards",
    eta: "Planned for next release",
    icon: FaCreditCard,
    action: "Not available yet",
  },
  {
    id: "netbanking",
    name: "Net Banking",
    status: "Available",
    statusTone: "green",
    note: "Best for larger top-ups from bank accounts",
    eta: "Usually 2-5 min",
    icon: FaUniversity,
    action: "Continue with bank",
  },
  {
    id: "wallets",
    name: "E-Wallets",
    status: "Temporarily unavailable",
    statusTone: "red",
    note: "Provider maintenance may affect availability",
    eta: "Please check again later",
    icon: FaWallet,
    action: "Unavailable",
  },
];

const depositHighlights = [
  {
    label: "Min deposit",
    value: "$10",
    icon: FaCheckCircle,
  },
  {
    label: "Processing",
    value: "Instant to 5 min",
    icon: FaClock,
  },
  {
    label: "Safety",
    value: "Encrypted payment flow",
    icon: FaShieldAlt,
  },
];

const toneClasses = {
  green: "border-green-500/30 bg-green-500/10 text-green-300",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  red: "border-red-500/30 bg-red-500/10 text-red-300",
};

export default function Deposit() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <WalletNavlink />

      {/* Scrolling Info Message */}
      <div className="relative overflow-hidden bg-gradient-to-r mt-3 from-green-500 h-10 to-emerald-600 text-white mx-3 lg:mx-1 p-2 rounded mb-6 text-sm">
        <div
          className="absolute whitespace-nowrap animate-marquee text-red-500"
          style={{ willChange: "transform" }}
        >
          Some options may not be available at times, due to maintenance on the
          side of the financial providers, or other reasons. Please watch for
          updates, and consider using the other available variants.
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* E-payments */}
        <div>
          <h2 className="text-lg font-semibold mb-4">E-payments</h2>
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-700 bg-gray-800/70 p-4 shadow-lg shadow-black/20">
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-xl bg-green-500/15 p-2 text-green-400">
                  <FaShieldAlt />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Fast and secure deposit methods
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-gray-400">
                    Choose a supported e-payment method to add funds quickly.
                    Method availability may vary based on provider status and
                    region.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {ePaymentMethods.map((method) => {
                const Icon = method.icon;
                const isInteractive = method.status === "Available";

                return (
                  <div
                    key={method.id}
                    className="rounded-2xl border border-gray-700 bg-gray-800/60 p-4 shadow-md shadow-black/10 transition duration-300 hover:border-green-500/30 hover:bg-gray-800"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-gray-700/70 p-3 text-lg text-green-400">
                          <Icon />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white">
                            {method.name}
                          </h3>
                          <p className="mt-1 text-xs text-gray-400">
                            {method.note}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${toneClasses[method.statusTone]}`}
                      >
                        {method.status}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <p className="text-xs text-gray-500">{method.eta}</p>
                      <button
                        type="button"
                        disabled={!isInteractive}
                        className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${isInteractive
                            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                            : "cursor-not-allowed bg-gray-700 text-gray-400"
                          }`}
                      >
                        {method.action}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl border border-gray-700 bg-gray-800/70 p-4">
              <h3 className="text-sm font-semibold text-white">
                Deposit overview
              </h3>
              <div className="mt-4 grid gap-3">
                {depositHighlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 rounded-xl bg-gray-900/60 px-3 py-3"
                    >
                      <div className="rounded-lg bg-green-500/15 p-2 text-green-400">
                        <Icon />
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">
                          {item.label}
                        </p>
                        <p className="text-sm font-medium text-white">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>


            </div>
          </div>
        </div>

        {/* Cryptocurrencies */}
        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Cryptocurrencies</h2>
          <CryptoNetwork type="deposit" />
        </div>
      </div>

      {/* Tailwind Custom Animation */}
      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          .animate-marquee {
            animation: marquee 25s linear infinite;
          }
        `}
      </style>
    </div>
  );
}
