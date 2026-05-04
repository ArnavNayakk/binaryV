import React, { useState, useRef, useEffect } from "react";

const IndicatorToggle = ({ toggles, onToggle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const indicators = [
    { key: "sma20", label: "SMA 20" },
    { key: "sma50", label: "SMA 50" },
    { key: "ema20", label: "EMA 20" },
    { key: "ema50", label: "EMA 50" },
    { key: "bb", label: "Bollinger Bands" },
    { key: "roc", label: "ROC" },
    { key: "vroc", label: "VROC" },
    { key: "volume", label: "Volume" },
    { key: "obv", label: "OBV" },
    { key: "rsi", label: "RSI" },
    { key: "macd", label: "MACD" },
    { key: "stoch", label: "Stochastic" },
    { key: "mfi", label: "MFI" },
  ];

  return (
    <div ref={menuRef} style={{ position: "absolute", top: 8, left: 8, zIndex: 60 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 bg-slate-800 text-white rounded shadow-lg hover:bg-slate-700 transition flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
        </svg>
        Indicators
      </button>

      {isOpen && (
        <div className="absolute top-12 left-0 bg-slate-800 text-white rounded shadow-2xl p-4 min-w-[240px] max-h-[400px] overflow-y-auto" style={{ zIndex: 70 }}>
          <div className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">
            Technical Indicators
          </div>
          <div className="space-y-2">
            {indicators.map((ind) => (
              <label key={ind.key} className="flex items-center gap-2 cursor-pointer hover:bg-slate-700 p-2 rounded transition">
                <input
                  type="checkbox"
                  checked={!!toggles[ind.key]}
                  onChange={(e) => onToggle?.(ind.key, e.target.checked)}
                  className="w-4 h-4 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm">{ind.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IndicatorToggle;
