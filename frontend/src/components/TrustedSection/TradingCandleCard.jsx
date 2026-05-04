import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";

// Sample bar data: value + type (green/red)
const data = [
  { name: "1", value: 40, type: "green" },
  { name: "2", value: 30, type: "green" },
  { name: "3", value: 25, type: "red" },
  { name: "4", value: 50, type: "green" },
  { name: "5", value: 35, type: "green" },
  { name: "6", value: 20, type: "red" },
  { name: "7", value: 55, type: "green" },
  { name: "8", value: 45, type: "green" },
  { name: "9", value: 15, type: "red" },
  { name: "10", value: 60, type: "green" },
];

export default function TradingCandleCard() {
  return (
    <div
      className=" w-full h-full bg-white rounded-2xl shadow-md border border-gray-100 p-4 flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          📊
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Market Sentiment</h3>
          <p className="text-sm text-gray-500">
            Block-style candles showing bullish (green) and bearish (red) bars.
          </p>
        </div>
      </div>

      {/* Block Candles */}
      <div className="w-full h-40 sm:h-48 lg:h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="name" hide />
            <YAxis hide />
            <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #e5e7eb" }} />
            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
              isAnimationActive={true}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.type === "green" ? "#38D300" : "#ef4444"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
