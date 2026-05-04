import React, { useMemo, useState } from "react";
import { useTrade } from "../context/TradeContext";
import WalletNavlink from "../components/Dashboard/WalletNavlink";

// Helpers
const statusColor = (status) => {
  switch ((status || "").toUpperCase()) {
    case "WON": return "text-green-400";
    case "LOST": return "text-red-500";
    case "ACTIVE":
    case "PENDING":
    case "OPEN": return "text-yellow-400";
    default: return "text-gray-300";
  }
};

const directionColor = (dir) => {
  switch ((dir || "").toUpperCase()) {
    case "UP": return "text-green-400";
    case "DOWN": return "text-red-500";
    default: return "text-gray-300";
  }
};

const modeClasses = (mode) =>
  (mode || "").toUpperCase() === "DEMO"
    ? "bg-sky-500/15 text-sky-300 border border-sky-400/20"
    : "bg-emerald-500/15 text-emerald-300 border border-emerald-400/20";

const rupee = (n) => {
  const v = Number(n);
  if (Number.isNaN(v)) return "0 ₹";
  return `${v.toLocaleString()} ₹`;
};

// ⭐ NEW: Convert any date to IST (India time)
const toIST = (time) => {
  if (!time) return "-";
  const date = new Date(time);
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: false,
  });
};

const Trade = () => {
  const { trades = [] } = useTrade();
// console.log("this is trade History..", trades);
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 20;
  const totalPages = Math.max(1, Math.ceil(trades.length / perPage));

  const pageSlice = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return trades.slice(start, start + perPage);
  }, [trades, currentPage]);

  // Expanded modal
  const [expandedId, setExpandedId] = useState(null);
  const expandedItem = useMemo(
    () => trades.find((t) => t.id === expandedId),
    [trades, expandedId]
  );

  // Table headers
  const headers = [
    { key: "id", label: "Trade ID", align: "left", className: "max-w-[160px]" },
    { key: "assets", label: "Assets", align: "left" },
    { key: "mode", label: "Mode", align: "left" },
    { key: "direction", label: "Direction", align: "left" },
    { key: "investment", label: "Investment", align: "right" },
    { key: "payout", label: "Payout", align: "right" },
    { key: "entryPrice", label: "Entry Price", align: "right" },
    { key: "endTime", label: "End Time (IST)", align: "left" },
    { key: "status", label: "Status", align: "left" },
  ];

  const goPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="p-6 min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 relative">
      <WalletNavlink />
      <div className="mt-6 p-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">

        {trades.length === 0 ? (
          <p className="text-gray-300">No trades found.</p>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto rounded-lg">
              <table className="min-w-full text-sm border border-white/20 divide-y divide-white/20">
                <thead className="bg-white/10">
                  <tr>
                    {headers.map((h) => (
                      <th
                        key={h.key}
                        className={`py-2 px-3 text-gray-200 font-medium uppercase tracking-wider text-xs ${h.align === "right" ? "text-right" : "text-left"
                          } ${h.className || ""}`}
                      >
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/20">
                  {pageSlice.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => setExpandedId(t.id)}
                      className="cursor-pointer hover:bg-white/10 text-sm transition-all duration-150 h-12"
                    >
                      <td className="px-3 truncate max-w-[160px]">{t.id}</td>
                      <td className="px-3 truncate">{t.assets ?? t.symbol ?? "-"}</td>
                      <td className="px-3 truncate">
                        <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${modeClasses(t.mode)}`}>
                          {t.mode || "REAL"}
                        </span>
                      </td>

                      <td className={`px-3 truncate font-medium ${directionColor(t.direction)}`}>
                        {t.direction || "-"}
                      </td>

                      <td className="px-3 truncate text-right text-green-400">
                        {rupee(t.investment)}
                      </td>

                      <td className="px-3 truncate text-right">
                        {rupee(t.payout)}
                      </td>

                      <td className="px-3 truncate text-right">
                        {t.entryPrice ?? "-"}
                      </td>

                      {/* ⭐ IST time */}
                      <td className="px-3 truncate">{toIST(t.expiryTime)}</td>

                      <td className={`px-3 truncate font-semibold ${statusColor(t.status)}`}>
                        {t.status || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {pageSlice.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setExpandedId(t.id)}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 shadow-md cursor-pointer hover:bg-white/10 transition"
                >
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-400">ID</p>
                    <p className="font-semibold truncate max-w-[160px]">{t.id}</p>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-gray-400">Assets</p>
                    <p className="font-semibold">{t.assets ?? t.symbol ?? "-"}</p>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-gray-400">Mode</p>
                    <p className={`rounded-full px-2 py-1 text-xs font-semibold ${modeClasses(t.mode)}`}>
                      {t.mode || "REAL"}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-gray-400">Direction</p>
                    <p className={`font-semibold ${directionColor(t.direction)}`}>
                      {t.direction || "-"}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-gray-400">Investment</p>
                    <p className="font-semibold text-green-400">{rupee(t.investment)}</p>
                  </div>

                  {/* ⭐ IST time */}
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-gray-400">End Time (IST)</p>
                    <p className="font-semibold">{toIST(t.expiryTime)}</p>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-gray-400">Status</p>
                    <p className={`font-semibold ${statusColor(t.status)}`}>{t.status || "-"}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center mt-4 gap-3">
              <div className="flex items-center gap-3 md:hidden">
                <button
                  onClick={goPrev}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                  className="h-10 w-10 inline-flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 disabled:opacity-50 transition"
                >
                  &lt;
                </button>

                <div className="px-3 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm">
                  Page {currentPage} of {totalPages}
                </div>

                <button
                  onClick={goNext}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                  className="h-10 w-10 inline-flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 disabled:opacity-50 transition"
                >
                  &gt;
                </button>
              </div>

              <div className="hidden md:flex items-center justify-center gap-3">
                <button
                  onClick={goPrev}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 disabled:opacity-50 transition"
                >
                  Previous
                </button>

                <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm">
                  Page {currentPage} of {totalPages}
                </div>

                <button
                  onClick={goNext}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 disabled:opacity-50 transition"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Expanded Row Modal */}
      {expandedItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
          <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 text-white rounded-2xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <button
              onClick={() => setExpandedId(null)}
              className="absolute top-4 right-4 text-gray-300 hover:text-white transition"
            >
              ✕
            </button>

            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-wide text-white mb-4">
                Trade Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 shadow-sm">
                  <p className="text-sm text-gray-300">Trade ID</p>
                  <p className="font-semibold break-all">{expandedItem.id}</p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 shadow-sm">
                  <p className="text-sm text-gray-300">Assets</p>
                  <p className="font-semibold">{expandedItem.assets ?? expandedItem.symbol ?? "-"}</p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 shadow-sm">
                  <p className="text-sm text-gray-300">Direction</p>
                  <p className={`font-semibold ${directionColor(expandedItem.direction)}`}>
                    {expandedItem.direction || "-"}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 shadow-sm">
                  <p className="text-sm text-gray-300">Trade Mode</p>
                  <p className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${modeClasses(expandedItem.mode)}`}>
                    {expandedItem.mode || "REAL"}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 shadow-sm">
                  <p className="text-sm text-gray-300">Investment</p>
                  <p className="font-semibold text-green-400">{rupee(expandedItem.investment)}</p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 shadow-sm">
                  <p className="text-sm text-gray-300">Entry Price</p>
                  <p className="font-semibold">{expandedItem.entryPrice ?? "-"}</p>
                </div>

                {/* ⭐ NEW — CLOSE PRICE */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 shadow-sm">
                  <p className="text-sm text-gray-300">Close Price</p>
                  <p className="font-semibold">{expandedItem.closingPrice ?? "-"}</p>
                </div>

                {/* ⭐ NEW — ENTRY TIME (IST) */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 shadow-sm">
                  <p className="text-sm text-gray-300">Entry Time (IST)</p>
                  <p className="font-semibold">{toIST(expandedItem.startTime)}</p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 shadow-sm">
                  <p className="text-sm text-gray-300">End Time (IST)</p>
                  <p className="font-semibold">{toIST(expandedItem.expiryTime)}</p>
                </div>

                <div className="sm:col-span-2 p-4 rounded-xl bg-white/5 border border-white/10 shadow-sm">
                  <p className="text-sm text-gray-300">Status</p>
                  <p className={`font-semibold ${statusColor(expandedItem.status)}`}>
                    {expandedItem.status || "-"}
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Trade;
