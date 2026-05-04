import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import WalletNavlink from "../../components/Dashboard/WalletNavlink";
import TradingActivityHeatmap from "../../components/Analystics/TradingActivityHeatmap";

function Analytics() {
  const [data] = useState([
    { date: "Oct 12", profit: 200 },
    { date: "Oct 20", profit: 450 },
    { date: "Oct 30", profit: 900 },
    { date: "Nov 11", profit: 1100 },
  ]);

  const performanceData = [
    { date: "Oct 12", wins: 2, losses: 1 },
    { date: "Oct 20", wins: 5, losses: 3 },
    { date: "Oct 30", wins: 8, losses: 5 },
    { date: "Nov 11", wins: 12, losses: 8 },
  ];

  const pieData = [
    { name: "BRL/USD", value: 40 },
    { name: "USD/BOT", value: 19 },
    { name: "USD/INR", value: 14 },
    { name: "USD/PXR", value: 14 },
    { name: "USD/ARS", value: 13 },
  ];

  const COLORS = ["#34d399", "#059669", "#10b981", "#047857", "#065f46"];

  const barData = [
    { name: "BRL/USD", profit: 2400 },
    { name: "USD/BOT", profit: 1398 },
    { name: "USD/INR", profit: 9800 },
    { name: "USD/PXR", profit: 3908 },
    { name: "USD/ARS", profit: 4800 },
  ];

  const stackedAreaData = [
    { date: "Oct 12", "BRL/USD": 200, "USD/INR": 150, "USD/BOT": 100 },
    { date: "Oct 20", "BRL/USD": 300, "USD/INR": 250, "USD/BOT": 180 },
    { date: "Oct 30", "BRL/USD": 400, "USD/INR": 300, "USD/BOT": 220 },
    { date: "Nov 11", "BRL/USD": 500, "USD/INR": 350, "USD/BOT": 260 },
  ];

  const [tradingActivity, setTradingActivity] = useState([
    { date: "2024-11-01", sessions: 0 },
    { date: "2024-11-02", sessions: 1 },
    { date: "2024-11-03", sessions: 3 },
    { date: "2024-11-04", sessions: 0 },
    { date: "2024-11-05", sessions: 2 },
    { date: "2024-11-06", sessions: 0 },
    { date: "2024-11-07", sessions: 7 },
    { date: "2024-11-11", sessions: 4 },
    { date: "2024-11-21", sessions: 1 },
  ]);

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const handleDayClick = (dateStr) => {
    setTradingActivity((prev) => {
      const idx = prev.findIndex((p) => p.date === dateStr);

      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], sessions: copy[idx].sessions + 1 };
        return copy;
      } else {
        return [...prev, { date: dateStr, sessions: 1 }];
      }
    });
  };

  const prevMonth = () => {
    const d = new Date(selectedYear, selectedMonth - 1, 1);
    setSelectedMonth(d.getMonth());
    setSelectedYear(d.getFullYear());
  };

  const nextMonth = () => {
    const d = new Date(selectedYear, selectedMonth + 1, 1);
    setSelectedMonth(d.getMonth());
    setSelectedYear(d.getFullYear());
  };

  // 🔥 NEW — Helper to get data for any month/year
  const getMonthData = (year, month) => {
    return tradingActivity.filter((d) => {
      const dt = new Date(d.date + "T00:00:00");
      return dt.getMonth() === month && dt.getFullYear() === year;
    });
  };

  // 🔥 NEW — create 3 months: prev, current, next
  const prevDate = new Date(selectedYear, selectedMonth - 1, 1);
  const nextDate = new Date(selectedYear, selectedMonth + 1, 1);

  const threeMonths = [
    { month: prevDate.getMonth(), year: prevDate.getFullYear() },
    { month: selectedMonth, year: selectedYear },
    { month: nextDate.getMonth(), year: nextDate.getFullYear() },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white p-6">
      <div className="relative z-10">
        <WalletNavlink />
      </div>

      <div className="max-w-7xl mt-8 mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-gray-400">Welcome back, Arnav Nayak</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-green-500/10 text-green-400 text-sm px-3 py-1 rounded-full animate-pulse">
              ● Live Market
            </div>
            <div className="bg-gray-800/60 backdrop-blur-lg px-4 py-2 rounded-2xl shadow-md">
              <p className="text-sm text-gray-400">Demo Balance</p>
              <h2 className="text-xl font-semibold text-green-400">$9,998.93</h2>
            </div>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            ["Trades Count", "42"],
            ["Trades Profit", "$2,456"],
            ["Profitable Trades", "73%"],
            ["Average Profit", "$58"],
            ["Net Turnover", "$9,800"],
            ["Hedged Trades", "$300"],
          ].map(([title, value], i) => (
            <div
              key={i}
              className="bg-gray-800/30 border border-gray-700/40 rounded-2xl p-4 text-center hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 backdrop-blur-md"
            >
              <p className="text-gray-400 text-sm">{title}</p>
              <p className="text-2xl font-semibold text-green-400 mt-1">{value}</p>
            </div>
          ))}
        </div>

        {/* PERFORMANCE TREND */}
        <div className="bg-gray-800/40 backdrop-blur-lg rounded-2xl p-4 border border-gray-700/50">
          <h3 className="text-lg font-semibold mb-4">Performance: Wins vs Losses</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={performanceData}>
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ background: "#1f2937", border: "none" }} />
              <Legend />
              <Line type="monotone" dataKey="wins" stroke="#34d399" strokeWidth={3} />
              <Line type="monotone" dataKey="losses" stroke="#ef4444" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

                {/* STATS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LINE CHART */}
          <div className="col-span-2 bg-gray-800/40 backdrop-blur-lg rounded-2xl p-4 border border-gray-700/50">
            <h3 className="text-lg font-semibold mb-4">
              Statistics of Profitable Trades
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data}>
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ background: "#1f2937", border: "none" }} />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#00FF87"
                  strokeWidth={3}
                  dot={false}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* PIE CHART */}
          <div className="bg-gray-800/40 backdrop-blur-lg rounded-2xl p-4 border border-gray-700/50">
            <h3 className="text-lg font-semibold mb-4">
              Top 5 Profitable Instruments
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} label>
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* STACKED AREA CHART */}
        <div className="bg-gray-800/40 backdrop-blur-lg rounded-2xl p-4 border border-gray-700/50">
          <h3 className="text-lg font-semibold mb-4">Profit Composition</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stackedAreaData}>
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="BRL/USD"
                stackId="1"
                stroke="#34d399"
                fill="#34d39940"
              />
              <Area
                type="monotone"
                dataKey="USD/INR"
                stackId="1"
                stroke="#3b82f6"
                fill="#3b82f640"
              />
              <Area
                type="monotone"
                dataKey="USD/BOT"
                stackId="1"
                stroke="#fbbf24"
                fill="#fbbf2440"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* MAIN 3-MONTH HEATMAP SECTION */}
        <div className="bg-gray-900/40 backdrop-blur-lg rounded-2xl p-6 border border-gray-800 shadow-lg shadow-black/40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">
              Trading Session Heatmap
            </h3>

            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="px-3 py-1 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300"
              >
                ← Prev
              </button>

              <select
                className="bg-gray-800 px-3 py-1 rounded-md text-sm text-gray-300"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i} value={i}>
                    {new Date(0, i).toLocaleString("default", { month: "long" })}
                  </option>
                ))}
              </select>

              <select
                className="bg-gray-800 px-3 py-1 rounded-md text-sm text-gray-300"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {Array.from({ length: 5 }).map((_, i) => {
                  const yr = today.getFullYear() - 2 + i;
                  return (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  );
                })}
              </select>

              <button
                onClick={nextMonth}
                className="px-3 py-1 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300"
              >
                Next →
              </button>
            </div>
          </div>

          {/* 🔥 NEW — SHOW 3 MONTHS IN A ROW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {threeMonths.map((m, i) => (
              <TradingActivityHeatmap
                key={i}
                activity={getMonthData(m.year, m.month)}
                month={m.month}
                year={m.year}
                onDayClick={handleDayClick}
              />
            ))}
          </div>
        </div>

        {/* BAR CHART */}
        <div className="bg-gray-800/40 backdrop-blur-lg rounded-2xl p-4 border border-gray-700/50">
          <h3 className="text-lg font-semibold mb-4">Profit & Loss by Instruments</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ background: "#1f2937", border: "none" }} />
              <Legend />
              <Bar dataKey="profit" fill="#10b981" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* TRADER BEHAVIOR CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            ["Avg Duration", "5m 24s"],
            ["Most Traded Pair", "USD/INR"],
            ["Risk Per Trade", "3%"],
            ["Avg ROI", "18%"],
          ].map(([title, value], i) => (
            <div
              key={i}
              className="bg-gray-800/30 p-4 rounded-xl text-center border border-gray-700/40 hover:border-green-400/30 transition-all"
            >
              <p className="text-sm text-gray-400">{title}</p>
              <p className="text-xl font-semibold text-green-400">{value}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500 mt-6 text-right">
          Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}

export default Analytics;
