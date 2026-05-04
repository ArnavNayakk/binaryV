import {
  Activity,
  ArrowRight,
  BarChart2,
  Bell,
  Calendar,
  PieChart,
  Search,
  TrendingUp,
} from "lucide-react";
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import TradingCandleCard from "../TrustedSection/TradingCandleCard";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

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
  { name: "11", value: 55, type: "red" },
  { name: "12", value: 45, type: "green" },
  { name: "13", value: 15, type: "red" },
  { name: "14", value: 60, type: "green" },
];

const sampleReports = [
  {
    id: 1,
    title: "Weekly Macro Outlook: Fed, Inflation & Rates",
    summary:
      "What to expect from the Fed meeting next week — scenarios, market implications, and trade ideas.",
    date: "Sep 25, 2025",
    author: "Market Team",
    body: "Detailed analysis exploring three scenarios: hawkish, neutral, dovish. Impact on USD, rates, and equities. Includes model probabilities and risk checklist.",
  },
  {
    id: 2,
    title: "Commodities Watch: Oil & Metals",
    summary:
      "Supply disruptions and demand outlook across crude and base metals.",
    date: "Sep 24, 2025",
    author: "Commodities Desk",
    body: "Summary of OPEC+ decisions, inventories, and how industrial demand is shaping metal prices. Provides a long/short table with stops.",
  },
  {
    id: 3,
    title: "Tech Sector Heatmap & Crowding",
    summary:
      "Which stocks are most overbought, and where institutional flows are concentrated.",
    date: "Sep 23, 2025",
    author: "Equity Strategy",
    body: "An overview of sector rotation, top movers, and a watchlist for mean-reversion setups.",
  },
];

const marketSnapshot = {
  indices: [
    { name: "S&P 500", value: "4,523.12", change: "+0.78%" },
    { name: "Nifty 50", value: "23,410", change: "-0.12%" },
    { name: "Nikkei 225", value: "38,123", change: "+1.02%" },
  ],
  fx: [
    { name: "USD/INR", value: "83.10", change: "+0.10%" },
    { name: "EUR/USD", value: "1.08", change: "-0.20%" },
  ],
  vix: "16.5",
};

const Insights = () => {
  const [activeReport, setActiveReport] = useState(sampleReports[0].id);
  const [assetFilter, setAssetFilter] = useState("all");
  const navigate = useNavigate();
  const contentRef = useRef([]);

  const filteredReports = sampleReports.filter((r) => {
    if (assetFilter === "all") return true;
    if (assetFilter === "equities")
      return (
        r.title.toLowerCase().includes("tech") ||
        r.title.toLowerCase().includes("equity")
      );
    if (assetFilter === "commodities")
      return (
        r.title.toLowerCase().includes("commodities") ||
        r.title.toLowerCase().includes("oil")
      );
    return true;
  });
  return (
    <section className="min-h-screen px-12 pt-16 text-white">
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Header Text */}
        <div>
          <h1 className="text-3xl font-semibold">
            Market Insights & <span className="text-green">Analysis</span>
          </h1>
          <p className="text-sm text-gray-400">
            Daily macro, sector rotation, trade ideas and live market snapshots.
          </p>
        </div>
        {/* Search Button and Subscribe Button */}
        <div className="flex gap-2">
          {/* Search box */}
          <div className="relative flex items-center bg-gray-800 px-3 py-2 rounded-md">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports, tickers or topics"
              className="outline-none px-1"
            />
          </div>
          {/* Subscribe Button */}
          <button className="flex items-center gap-2 px-2 rounded-md text-dark bg-green hover:scale-102 cursor-pointer duration-200">
            Subscribe <Bell className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Top Snapshot + Filter */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="col-span-1 lg:col-span-2 bg-gray-800 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-semibold">Market Snapshot</h3>
            <div className="flex gap-2 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Activity />
                Live
              </span>
              <span className="flex items-center gap-1">
                <BarChart2 />
                1D
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp />
                1W
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Indices */}
            <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-4 rounded-lg">
              <h1 className="text-gray-300">Indices</h1>
              <ul className="mt-3 space-y-2">
                {marketSnapshot.indices.map((i) => (
                  <li key={i.name} className="flex justify-between">
                    <span className="text-sm">{i.name}</span>
                    <span className="text-sm font-medium">{i.value}</span>
                    <span className="text-green text-xs">{i.change}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* FX */}
            <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-4 rounded-lg">
              <h1 className="text-gray-300">FX</h1>
              <ul className="mt-3 space-y-2">
                {marketSnapshot.fx.map((i) => (
                  <li key={i.name} className="flex justify-between">
                    <span className="text-sm">{i.name}</span>
                    <span className="text-sm font-medium">{i.value}</span>
                    <span className="text-red-400 text-xs">{i.change}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* VIX */}
            <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-4 rounded-lg flex flex-col justify-between">
              <div>
                <h1 className="text-gray-300">Volatility (VIX)</h1>
                <p className="text-2xl font-bold mt-2">{marketSnapshot.vix}</p>
              </div>
              <div className="text-xs text-gray-400">Updated: Sep 25, 2025</div>
            </div>
          </div>

          {/* Placeholder Chart Area */}
          <div className="mt-4 w-full h-40 lg:h-66 border border-gray-600 flex justify-center items-center rounded-md text-white">
            {/* Interactive chart */}
            <div className="w-full px-4 h-38 lg:h-50 flex flex-col items-center">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "10px",
                      border: "1px solid #e5e7eb",
                    }}
                  />
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
              <div className="text-xs mt-2">
                Price trend (placeholder) — integrate your chart library here.
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <aside className="space-y-4 w-full col-span-1">
          {/* Filter */}
          <div className="bg-gray-800 rounded-2xl p-4 space-y-2 lg:space-y-4">
            <h3 className="font-semibold">Filter</h3>
            <div className="mt-3 flex flex-col gap-2 border rounded-md">
              <select
                value={assetFilter}
                onChange={(e) => setAssetFilter(e.target.value)}
                className="p-2 rounded-md text-sm bg-gray-700"
              >
                <option value="all">All assets</option>
                <option value="equities">Equities</option>
                <option value="commodities">Commodities</option>
                <option value="fx">FX</option>
              </select>
            </div>
            <label className="flex items-center text-sm gap-2">
              <input type="checkbox" /> Show Premium only
            </label>
            <button
              onClick={() => navigate(`/login`)}
              className="w-full bg-green flex justify-center items-center py-2 rounded-md gap-2 font-semibold text-dark cursor-pointer hover:bg-green/80"
            >
              Create Alert
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          {/* Upcoming Events */}
          <div className="bg-gray-800 rounded-2xl p-4">
            <h4 className="font-semibold">Upcoming Events</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-300">
              <li className="flex justify-between">
                <span>US CPI</span>
                <span>Sep 30</span>
              </li>
              <li className="flex justify-between">
                <span>RBI Policy</span>
                <span>Oct 4</span>
              </li>
              <li className="flex justify-between">
                <span>Company Earnings (AAPL)</span>
                <span>Oct 28</span>
              </li>
            </ul>
          </div>
          {/* Sentiment box */}
          <div className="bg-gray-800 rounded-2xl p-4 text-sm">
            <h4 className="font-semibold">Sentiment</h4>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="p-3 rounded-md bg-gray-900 text-center">
                <div className="text-xs">Retail Net Long</div>
                <div className="font-bold">+12%</div>
              </div>
              <div className="p-3 rounded-md bg-gray-900 text-center">
                <div className="text-xs">ETF Flows (7d)</div>
                <div className="font-bold">-0.6B</div>
              </div>
            </div>
          </div>
        </aside>
      </section>

      {/* Reports + Signals area */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-1 lg:col-span-2 bg-gray-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Latest Reports</h3>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <PieChart className="w-4 h-4" /> Reports
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" /> Archive
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {filteredReports.map((r) => (
              <article key={r.id} className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{r.title}</h4>
                    <div className="text-xs text-gray-400">
                      {r.author} • {r.date}
                    </div>
                    <p className="text-sm mt-2 text-gray-300">{r.summary}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <button
                      onClick={() => setActiveReport(r.id)}
                      className="text-gray-300 text-sm font-medium cursor-pointer"
                    >
                      Read
                    </button>
                    <button className="text-green text-xs mt-2 cursor-pointer">
                      Share
                    </button>
                  </div>
                </div>

                {/* Expandable body */}
                {activeReport === r.id && (
                  <div className="mt-3 text-sm text-gray-300 border-t border-gray-700 pt-3">
                    {r.body}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>

        {/* Right: Signals / Trade ideas */}
        <aside className="space-y-4 w-full col-span-1">
          <div className="bg-gray-800 rounded-2xl p-4">
            <h4 className="font-semibold">Top Trade Ideas</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex justify-between items-start gap-2">
                <div>
                  <div className="font-semibold">Long Gold vs USD</div>
                  <div className="text-gray-400 text-xs">
                    Rationale: Inflation hedge, technical breakout
                  </div>
                </div>
                <div className="text-xs text-gray-300">Risk: Medium</div>
              </li>
              <li className="flex justify-between items-start gap-2">
                <div>
                  <div className="font-semibold">Short Overheated Tech ETF</div>
                  <div className="text-gray-400 text-xs">
                    Rationale: Valuation stretch, crowded flows
                  </div>
                </div>
                <div className="text-xs text-gray-300">Risk: High</div>
              </li>
            </ul>
          </div>

          <div className="bg-gray-800 rounded-2xl p-4">
            <h4 className="font-semibold">Market Tools</h4>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <button className="w-full rounded-md p-2 bg-gray-900 text-sm flex items-center justify-between">
                Open Heatmap <ArrowRight className="w-4 h-4" />
              </button>
              <button className="w-full rounded-md p-2 bg-gray-900 text-sm flex items-center justify-between">
                Yield Curve Viewer <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>
      </section>

      {/* Footer CTA */}
      <footer className="mt-8 bg-gradient-to-r from-gray-700 to-gray-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h4 className="font-semibold">Want deeper research?</h4>
          <p className="text-sm text-gray-400">
            Upgrade to Premium for proprietary models, expanded data and analyst
            calls.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <button className="px-4 py-2 rounded-md bg-green text-dark font-semibold">
            Go Premium
          </button>
          <button className="px-4 py-2 rounded-md border border-gray-700">
            Contact Sales
          </button>
        </div>
      </footer>
    </section>
  );
};

export default Insights;
