// components/Market/DemoBalanceBox.jsx
import React from "react";
import { useTrade } from "../../context/TradeContext";

const DemoBalanceBox = () => {
  const { demoBalance, resetDemoBalance } = useTrade();

  return (
    <div className="absolute top-3 right-30 z-30 bg-gray-800/90 text-white px-4 py-2 rounded-lg shadow-lg border border-gray-700 flex items-center gap-3">
      {/* Balance display */}
      <div>
        <span className="text-sm font-semibold">Demo Balance:</span>{" "}
        <span
          className={`font-bold ${
            demoBalance <= 0 ? "text-red-400" : "text-green-400"
          }`}
        >
          ${demoBalance.toFixed(2)}
        </span>
      </div>

      {/* ✅ Show reset button only when balance = 0 */}
      {demoBalance <= 0 && (
        <button
          onClick={() => resetDemoBalance(100000)} // same as your context default
          className="bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-1 text-xs rounded-md hover:from-blue-600 hover:to-indigo-700 transition"
        >
          Reset
        </button>
      )}
    </div>
  );
};

export default DemoBalanceBox;