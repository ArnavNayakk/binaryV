import { useState, useEffect } from "react";

const symbols = [
  { label: "Bitcoin (BTC) / USDT", value: "BTCUSDT" },
  { label: "Ethereum (ETH) / USDT", value: "ETHUSDT" },
  { label: "BNB / USDT", value: "BNBUSDT" },
  { label: "Cardano (ADA) / USDT", value: "ADAUSDT" },
  { label: "Ripple (XRP) / USDT", value: "XRPUSDT" },
  { label: "Solana (SOL) / USDT", value: "SOLUSDT" },
  { label: "Dogecoin (DOGE) / USDT", value: "DOGEUSDT" },
  { label: "Polkadot (DOT) / USDT", value: "DOTUSDT" },
  { label: "Polygon (MATIC) / USDT", value: "MATICUSDT" },
  { label: "Litecoin (LTC) / USDT", value: "LTCUSDT" },
];

// === Helpers ===
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const intervalToMinutes = (interval) => {
  if (interval.endsWith("m")) return parseInt(interval.slice(0, -1), 10);
  if (interval.endsWith("h")) return parseInt(interval.slice(0, -1), 10) * 60;
  if (interval.endsWith("d")) return parseInt(interval.slice(0, -1), 10) * 1440;
  if (interval.endsWith("w")) return parseInt(interval.slice(0, -1), 10) * 10080;
  return 1;
};

const COEFFS = { A: 50, B: 6, C: 20, D: 1, minP: 60, maxP: 95 };

function computeFeatures(klines) {
  const returns = klines.map(
    (k) => ((parseFloat(k[4]) - parseFloat(k[1])) / parseFloat(k[1])) * 100
  );
  const n = returns.length;
  if (n < 2) return { vol_pct: 0.1, avgAbsReturn_pct: 0.05 };

  const mean = returns.reduce((a, b) => a + b, 0) / n;
  const avgAbsReturn_pct = returns.reduce((a, b) => a + Math.abs(b), 0) / n;
  const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1);
  const vol_pct = Math.sqrt(variance);
  return { vol_pct, avgAbsReturn_pct };
}

function predictPayout(klines, interval) {
  const { vol_pct, avgAbsReturn_pct } = computeFeatures(klines);
  const Tmin = intervalToMinutes(interval);
  const invVol = 1 / Math.max(1e-6, vol_pct);

  const B = interval === "1m" ? 0.5 * COEFFS.B : COEFFS.B;
  const C = interval === "1m" ? 0.5 * COEFFS.C : COEFFS.C;

  const raw = COEFFS.A + B * invVol + C * avgAbsReturn_pct + COEFFS.D * (1 / Tmin);

  const minP = interval === "1m" ? 75 : COEFFS.minP;
  const maxP = interval === "1m" ? 85 : COEFFS.maxP;

  return clamp(Math.round(raw), minP, maxP);
}

// =================== Component ===================
const SymbolSelector = ({ onChange, interval = "1m" , onPayoutDataUpdate }) => {
  const [open, setOpen] = useState(false);
  const [tabs, setTabs] = useState([symbols[0]]);
  const [active, setActive] = useState(symbols[0]);
  const [tabData, setTabData] = useState({});

  const fetchSymbolData = async (symbol) => {
    try {
      const res1 = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
      const data1 = await res1.json();

      const res1m = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&limit=30`
      );
      const klines1m = await res1m.json();
      const return1m = predictPayout(klines1m, "1m");

      const res5m = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=5m&limit=30`
      );
      const klines5m = await res5m.json();
      const return5m = predictPayout(klines5m, "5m");

      setTabData((prev) => ({
        ...prev,
        [symbol]: {
          price: parseFloat(data1.lastPrice),
          change24h: parseFloat(data1.priceChangePercent),
          return1m,
          return5m,
        },
      }));
    } catch (err) {
      console.warn("Failed to fetch symbol data:", err);
    }
  };
  
   useEffect(() => {
    if (onPayoutDataUpdate) {
      onPayoutDataUpdate(tabData);
    }
  }, [tabData, onPayoutDataUpdate]);

  useEffect(() => {
    tabs.forEach((t) => fetchSymbolData(t.value));
    const intervalId = setInterval(() => {
      tabs.forEach((t) => fetchSymbolData(t.value));
    }, 10000);
    return () => clearInterval(intervalId);
  }, [tabs]);

  const handleTabClick = (s) => {
    setActive(s);
    onChange(s.value);
  };

  const handleSelect = (s) => {
    if (!tabs.find((t) => t.value === s.value)) setTabs([...tabs, s]);
    setActive(s);
    onChange(s.value);
    setOpen(false);
    fetchSymbolData(s.value);
  };

  const handleCloseTab = (s) => {
    const filtered = tabs.filter((t) => t.value !== s.value);
    setTabs(filtered);
    if (active.value === s.value) {
      const next = filtered.length > 0 ? filtered[filtered.length - 1] : symbols[0];
      setActive(next);
      onChange(next.value);
    }
  };

  return (
    <div className="
      /* Mobile: Top left with responsive spacing */
      absolute top-2 left-2 z-20
      /* Desktop: Original position */
      lg:top-3 lg:left-3
    ">
      <div className="flex items-start">
        {/* Fixed + button */}
        <button
          onClick={() => {
            setOpen(!open);
            symbols.forEach((s) => fetchSymbolData(s.value));
          }}
          className="
            /* Mobile: Smaller button */
            flex-shrink-0 w-8 h-8 text-sm
            /* Desktop: Original size */
            lg:w-10 lg:h-10 lg:text-lg
            bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg text-white font-bold flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-md border border-blue-400/30
          "
        >
          +
        </button>

        {/* Tabs attached to the right of button */}
        <div className="
          flex space-x-1 ml-1 overflow-x-auto scrollbar-hide
          /* Mobile: Smaller spacing and margin */
          lg:space-x-2 lg:ml-2
          /* Dynamic max width based on screen size */
          max-w-[calc(100vw-120px)] sm:max-w-[calc(100vw-140px)] lg:max-w-[calc(100vw-80px)]
        ">
          {tabs.map((s) => (
            <div
              key={s.value}
              className={`
                flex-shrink-0 group relative rounded-lg cursor-pointer backdrop-blur-md border transition-all duration-200
                /* Mobile: Smaller padding and text */
                px-2 py-1 text-xs
                /* Desktop: Original padding and text */
                lg:px-4 lg:py-2 lg:text-sm
                ${
                  active.value === s.value
                    ? "bg-blue-500/20 border-blue-400/50 text-white shadow-lg shadow-blue-500/20"
                    : "bg-black/30 border-gray-600/30 text-gray-300 hover:bg-gray-700/40 hover:border-gray-500/50"
                }
              `}
            >
              <div onClick={() => handleTabClick(s)} className="min-w-0">
                <div className="font-semibold">{s.label.split(" ")[0]}</div>
                {tabData[s.value] && (
                  <div className="
                    flex items-center space-x-1 mt-1
                    /* Mobile: Smaller spacing and text */
                    text-xs lg:space-x-2 lg:text-xs
                  ">
                    <span className="text-gray-300 truncate">
                      ${tabData[s.value].price?.toFixed(tabData[s.value].price >= 1 ? 2 : 6)}
                    </span>
                    <span
                      className={`font-medium ${
                        (tabData[s.value].change24h ?? 0) >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {(tabData[s.value].change24h ?? 0) >= 0 ? "+" : ""}
                      {tabData[s.value].change24h?.toFixed(2)}%
                    </span>
                    <span className="text-green-400 font-medium">{tabData[s.value].return1m}%</span>
                  </div>
                )}
              </div>

              {tabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseTab(s);
                  }}
                  className="
                    absolute -top-1 -right-1 rounded-full bg-red-500/80 hover:bg-red-500 text-white text-xs flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100
                    /* Mobile: Smaller close button */
                    w-4 h-4 text-xs
                    /* Desktop: Original size */
                    lg:w-5 lg:h-5
                  "
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dropdown table - Responsive width */}
      {open && (
        <div className="
          absolute top-10 left-0 bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-gray-600/30 rounded-2xl shadow-2xl overflow-hidden
          /* Mobile: Responsive width */
          w-[95vw] max-w-[400px]
          /* Tablet: Medium width */
          sm:w-[500px] sm:max-w-[500px]
          /* Desktop: Original width */
          lg:w-[600px] lg:max-w-[600px]
        ">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-4 py-3 border-b border-gray-600/30">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold text-lg">Select Trading Pair</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Table container */}
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50 sticky top-0">
                <tr>
                  <th className="text-left px-2 py-3 text-gray-300 font-medium text-xs lg:px-4 lg:text-sm">Symbol</th>
                  <th className="text-right px-2 py-3 text-gray-300 font-medium text-xs lg:px-4 lg:text-sm">Price</th>
                  <th className="text-right px-2 py-3 text-gray-300 font-medium text-xs lg:px-4 lg:text-sm">24h Change</th>
                  <th className="text-right px-2 py-3 text-gray-300 font-medium text-xs lg:px-4 lg:text-sm">1m Payout</th>
                  <th className="text-right px-2 py-3 text-gray-300 font-medium text-xs lg:px-4 lg:text-sm">5m Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/30">
                {symbols.map((s, index) => (
                  <tr
                    key={s.value}
                    className={`cursor-pointer transition-all duration-150 hover:bg-blue-500/10 ${
                      active.value === s.value
                        ? "bg-blue-500/20 border-l-2 border-blue-400"
                        : "hover:bg-gray-700/30"
                    }`}
                    onClick={() => handleSelect(s)}
                  >
                    <td className="px-2 py-3 lg:px-4">
                      <div className="flex items-center space-x-2 lg:space-x-3">
                        <div
                          className={`
                            w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                            lg:w-8 lg:h-8 lg:text-xs
                            ${
                              index % 3 === 0
                                ? "bg-orange-500/20 text-orange-400"
                                : index % 3 === 1
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-purple-500/20 text-purple-400"
                            }
                          `}
                        >
                          {s.label.split(" ")[0].charAt(0)}
                        </div>
                        <div>
                          <div className="text-white font-medium text-sm lg:text-base">{s.label.split(" ")[0]}</div>
                          <div className="text-gray-400 text-xs">{s.label.split(" / ")[1]}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-right lg:px-4">
                      <span className="text-white font-mono text-sm">
                        {tabData[s.value]?.price
                          ? `$${tabData[s.value].price.toFixed(tabData[s.value].price >= 1 ? 2 : 6)}`
                          : <div className="w-12 h-4 bg-gray-700/50 rounded animate-pulse lg:w-16"></div>}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-right lg:px-4">
                      {tabData[s.value]?.change24h !== undefined ? (
                        <div
                          className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium lg:px-2 lg:py-1 ${
                            (tabData[s.value]?.change24h ?? 0) >= 0
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {(tabData[s.value].change24h ?? 0) >= 0 ? "↗" : "↘"}
                          {Math.abs(tabData[s.value].change24h).toFixed(2)}%
                        </div>
                      ) : (
                        <div className="w-12 h-4 bg-gray-700/50 rounded animate-pulse lg:w-16"></div>
                      )}
                    </td>
                    <td className="px-2 py-3 text-right lg:px-4">
                      {tabData[s.value]?.return1m ? (
                        <div className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 lg:px-2 lg:py-1">
                          {tabData[s.value].return1m}%
                        </div>
                      ) : (
                        <div className="w-10 h-4 bg-gray-700/50 rounded animate-pulse lg:w-12"></div>
                      )}
                    </td>
                    <td className="px-2 py-3 text-right lg:px-4">
                      {tabData[s.value]?.return5m ? (
                        <div className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 lg:px-2 lg:py-1">
                          {tabData[s.value].return5m}%
                        </div>
                      ) : (
                        <div className="w-10 h-4 bg-gray-700/50 rounded animate-pulse lg:w-12"></div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="bg-gray-800/30 px-4 py-3 border-t border-gray-600/30">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Real-time market data from Binance</span>
              <span className="hidden sm:block">Updated every 10 seconds</span>
            </div>
          </div>
        </div>
      )}

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default SymbolSelector;
