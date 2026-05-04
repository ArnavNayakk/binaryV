import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axiosClient";

const formatAmount = (amount, asset) => {
  const numeric = Number(amount?.$numberDecimal ?? amount ?? 0);
  return `${numeric.toFixed(4)} ${asset || ""}`.trim();
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const TransactionDetails = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/payment/transactionHistory?limit=10");
        setTransactions(res?.data?.transactions || []);
      } catch (error) {
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    if (filter === "All") return transactions;
    return transactions.filter((transaction) => transaction.type === filter);
  }, [filter, transactions]);

  return (
    <div className="p-6 bg-gray-800 text-white overflow-hidden rounded-xl max-h-120 shadow-md w-full">
      <h2 className="text-xl font-bold mb-4 text-green">Transaction History</h2>

      <div className="flex gap-3 mb-4 flex-wrap">
        {["All", "Deposit", "Withdrawal"].map((option) => (
          <button
            key={option}
            onClick={() => setFilter(option)}
            className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer ${
              filter === option
                ? "bg-green/80 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto scrollbar-hide h-100 max-h-100">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-700 text-left sticky top-0 text-sm font-semibold">
              <th className="p-3">Date</th>
              <th className="p-3">Type</th>
              <th className="p-3">Asset</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-3 text-gray-300" colSpan={5}>
                  Loading recent transactions...
                </td>
              </tr>
            ) : filteredTransactions.length === 0 ? (
              <tr>
                <td className="p-3 text-gray-300" colSpan={5}>
                  No transactions found.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => (
                <tr key={tx._id} className="border-b text-xs md:text-sm">
                  <td className="p-3">{formatDate(tx.createdAt)}</td>
                  <td
                    className={`p-3 font-medium ${
                      tx.type === "Deposit" ? "text-green" : "text-red-500"
                    }`}
                  >
                    {tx.type}
                  </td>
                  <td className="p-3">{tx.asset}</td>
                  <td className="p-3">{formatAmount(tx.payAmount, tx.asset)}</td>
                  <td
                    className={`p-3 ${
                      tx.status === "COMPLETED" || tx.status === "Completed"
                        ? "text-green"
                        : tx.status === "PENDING" || tx.status === "Pending"
                        ? "text-yellow-600"
                        : "text-red-500"
                    }`}
                  >
                    {tx.status}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionDetails;
