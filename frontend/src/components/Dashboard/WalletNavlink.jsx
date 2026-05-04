import React, { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { usePayment } from "../../context/PaymentContext";
import { FaWallet, FaPiggyBank, FaChartLine, FaCoins } from "react-icons/fa";

const fmtUSD = (v = 0) => {
  const num = isNaN(Number(v)) ? 0 : Number(v);
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(num);
  } catch {
    return `${num.toFixed(2)} USD`;
  }
};

function WalletNavlink() {
  const navigate = useNavigate();
  const location = useLocation();
  const { balances, totalBalanceUSD, loading } = usePayment();

  const base = useMemo(
    () => (Number.isFinite(totalBalanceUSD) ? totalBalanceUSD : 0),
    [totalBalanceUSD]
  );

  const totalPending = useMemo(() => {
    return Object.values(balances || {}).reduce(
      (sum, w) => sum + (w.pendingIncoming || 0),
      0
    );
  }, [balances]);

  const totalInvested = useMemo(() => base * 0.7, [base]);
  const totalProfit = useMemo(() => base * 0.15, [base]);

  const navItems = useMemo(
    () => [
      { name: "Deposit", route: "/dashboard/portfolio/deposit" },
      { name: "Withdrawal", route: "/dashboard/portfolio/withdrawal" },
      { name: "Transactions", route: "/dashboard/portfolio/transactions" },
      { name: "Trades", route: "/dashboard/portfolio/trades" },
      { name: "Account", route: "/dashboard/portfolio/account" },
      { name: "Market", route: "/dashboard/portfolio/market" },
      { name: "Tournaments", route: "/dashboard/portfolio/tournaments" },
      { name: "Analytics", route: "/dashboard/portfolio/analytics" },
    ],
    []
  );

  const balanceCards = useMemo(
    () => [
      {
        title: "Available Balance",
        value: base,
        icon: <FaWallet aria-hidden="true" />,
      },
      {
        title: "Pending Deposits",
        value: totalPending,
        icon: <FaPiggyBank aria-hidden="true" />,
      },
      {
        title: "Invested",
        value: totalInvested,
        icon: <FaCoins aria-hidden="true" />,
      },
      {
        title: "Profit",
        value: totalProfit,
        icon: <FaChartLine aria-hidden="true" />,
      },
    ],
    [base, totalPending, totalInvested, totalProfit]
  );

  const isActive = (route) =>
    location.pathname === route || location.pathname.startsWith(route + "/");

  return (
    <section
      className="w-full bg-gray-900/70 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 sm:p-5 md:p-6 shadow-md shadow-black/40"
      aria-label="Wallet navigation and balances"
    >
      <div className="flex flex-col xl:flex-row justify-between gap-4 xl:gap-6">

        {/* Navigation Buttons */}
        <nav className="flex flex-wrap items-center gap-2 sm:gap-3 justify-center xl:justify-start">
          {navItems.map((item) => {
            const active = isActive(item.route);
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.route)}
                className={`px-3 sm:px-5 py-2.5 rounded-xl text-sm md:text-base font-medium transition-all duration-300
                  ${
                    active
                      ? "bg-green-500/20 text-green-400 border border-green-500/40 shadow-inner"
                      : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/60 hover:text-green-300"
                  }`}
              >
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Wallet Summary Cards */}
        <div className="grid w-full sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {balanceCards.map((card) => (
            <article
              key={card.title}
              className="flex items-center gap-4 flex-wrap bg-gray-800/50 backdrop-blur-md border border-gray-700/60 rounded-xl p-3 sm:p-4 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300"
            >
              <div className="text-2xl sm:text-3xl text-green-400">
                {card.icon}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400">{card.title}</p>

                {loading ? (
                  <div className="mt-1 h-5 w-24 rounded bg-white/20 animate-pulse" />
                ) : (
                  <p className="text-base sm:text-lg font-semibold text-green-400 break-words leading-tight min-w-0">
                    {fmtUSD(card.value)}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WalletNavlink;
