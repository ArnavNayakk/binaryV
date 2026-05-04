import React, { useEffect, useState } from "react";
import WalletNavlink from "../../components/Dashboard/WalletNavlink";
import api from "../../api/axiosClient";
import cryptoLogos from "../../assets/cryptoLogos";

function TransactionHistory() {
  const [transactionsData, setTransactionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 20;

  // Fetch transactions
  const getTransactionHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/payment/transactionHistory");
      console.log("Transaction history response:", res);
      setTransactionData(res?.data?.transactions || []);
    } catch (err) {
      console.error("Fetch transaction history error:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Failed to fetch transaction history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTransactionHistory();
  }, []);

  // Helpers
  const formatAmount = (amount, decimals = 8) => {
    if (!amount) return (0).toFixed(decimals);
    if (typeof amount === "object" && amount.$numberDecimal) {
      return parseFloat(amount.$numberDecimal).toFixed(decimals);
    }
    return parseFloat(amount).toFixed(decimals);
  };

  const formatDateToIST = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "text-yellow-400";
      case "completed":
      case "complete":
        return "text-green-400";
      case "fail":
      case "failed":
        return "text-red-500";
      default:
        return "text-gray-300";
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "deposit":
        return "text-green-400";
      case "withdrawal":
        return "text-red-500";
      default:
        return "text-gray-300";
    }
  };

  // Pagination
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactionsData.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(transactionsData.length / transactionsPerPage);

  return (
    <div className="p-6 min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 relative">
      <WalletNavlink />

      <div className="mt-6 p-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
        {loading && <p className="text-blue-400 animate-pulse">Loading transactions...</p>}
        {error && <p className="text-red-500 font-medium">{error}</p>}
        {!loading && !error && transactionsData.length === 0 && (
          <p className="text-gray-300">No transactions found.</p>
        )}

        {!loading && transactionsData.length > 0 && (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto rounded-lg">
              <table className="min-w-full text-sm border border-white/20 divide-y divide-white/20">
                <thead className="bg-white/10">
                  <tr>
                    {[
                      "Transaction ID",
                      "Date & Time (IST)",
                      "Status",
                      "Type",
                      "Payment System",
                      "Amount",
                      "Destination",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="py-2 px-3 text-left text-gray-200 font-medium uppercase tracking-wider text-xs"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {currentTransactions.map((item) => (
                    <tr
                      key={item._id}
                      onClick={() => setExpandedRowId(item._id)}
                      className="cursor-pointer hover:bg-white/10 text-sm transition-all duration-150 h-12"
                    >
                      <td className="px-3 truncate max-w-[120px]">
                        {item.metadata?.payment_id || item.metadata?.platformPayoutId || item._id}
                      </td>
                      <td className="px-3 truncate">{formatDateToIST(item.createdAt)}</td>
                      <td className={`px-3 capitalize truncate ${getStatusColor(item.status)}`}>
                        {item.status || "-"}
                      </td>
                      <td className={`px-3 truncate ${getTypeColor(item.type)}`}>{item.type || "-"}</td>
                      <td className="px-3 truncate">{item.transactionMode || "-"}</td>
                      <td className="px-3 truncate text-green-400">
                        {formatAmount(item.payAmount)} {item.asset || ""}
                      </td>
                      <td className="px-3 truncate max-w-[150px]">{item.destinationAddress || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-3">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-full md:w-auto px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 disabled:opacity-50 transition"
              >
                Previous
              </button>

              <div className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm">
                Page {currentPage} of {totalPages}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-full md:w-auto px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 disabled:opacity-50 transition"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {/* Expanded Details Modal */}
      {expandedRowId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
          <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 text-white rounded-2xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeIn">
            <button
              onClick={() => setExpandedRowId(null)}
              className="absolute top-4 right-4 text-gray-300 hover:text-white transition"
            >
              ✕
            </button>

            {(() => {
              const item = transactionsData.find((t) => t._id === expandedRowId);
              if (!item) return null;

              // Parse decimals safely
              const parseDecimal = (value) => {
                if (!value) return 0;
                if (typeof value === "object" && value.$numberDecimal) {
                  return parseFloat(value.$numberDecimal);
                }
                return parseFloat(value);
              };

              const serviceFee = parseDecimal(item.fee?.serviceFee);
              const networkFee = parseDecimal(
                item.fee?.depositFee || item.fee?.withdrawalFee
              );

              // Network fee now includes service fee
              const totalNetworkFee = serviceFee + networkFee;

              const logo = cryptoLogos[item.asset?.toLowerCase()] || "";

              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    {logo && (
                      <img
                        src={logo}
                        alt={item.asset}
                        className="w-10 h-10 rounded-full border border-white/20"
                      />
                    )}
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-wide text-white">
                      Transaction Details
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 shadow-sm">
                      <p className="text-sm text-gray-300">Transaction ID</p>
                      <p className="font-semibold break-all">
                        {item.metadata?.payment_id || item._id}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 shadow-sm">
                      <p className="text-sm text-gray-300">Date & Time (IST)</p>
                      <p className="font-semibold">{formatDateToIST(item.createdAt)}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 shadow-sm">
                      <p className="text-sm text-gray-300">Status</p>
                      <p className={`font-semibold ${getStatusColor(item.status)}`}>{item.status}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 shadow-sm">
                      <p className="text-sm text-gray-300">Type</p>
                      <p className={`font-semibold ${getTypeColor(item.type)}`}>{item.type}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 shadow-sm">
                      <p className="text-sm text-gray-300">Payment System</p>
                      <p className="font-semibold">{item.transactionMode || "-"}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 shadow-sm">
                      <p className="text-sm text-gray-300">Amount</p>
                      <p className="font-semibold text-green-400">
                        {formatAmount(item.payAmount)} {item.asset || ""}
                      </p>
                    </div>

                    {/* Network Fee (Service Fee + Network Fee) */}
                    {item.type?.toLowerCase() === "deposit" && (
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10 shadow-sm">
                        <p className="text-sm text-gray-300">Network Fee (incl. Service Fee)</p>
                        <p className="font-semibold text-red-400">
                          {formatAmount(totalNetworkFee, 2)}
                        </p>
                      </div>
                    )}

                    <div className="sm:col-span-2 p-4 rounded-xl bg-white/5 border border-white/10 shadow-sm">
                      <p className="text-sm text-gray-300">Destination Address</p>
                      <p className="font-semibold break-all">{item.destinationAddress || "-"}</p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionHistory;
