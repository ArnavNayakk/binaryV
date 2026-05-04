import React, { useState, useEffect, useRef } from "react";
import TimeGridControl from "./TimeGridControl";
import Amount, { amountStepUp, amountStepDown } from "./Amount";

import {
  ChevronDown,
  Plus,
  Minus,
  ShoppingCart,
  RefreshCw,
  Timer,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Wallet,
  Activity,
  Target,
  Zap,
  X
} from "lucide-react";
import { useTrade } from "../../context/TradeContext";
import { useNavigate } from "react-router-dom";
import { Howl, Howler } from 'howler';

const SYMBOL_META = {
  BTCUSDT: { name: "Bitcoin", icon: "BTC", color: "from-orange-400 to-orange-600" },
  ETHUSDT: { name: "Ethereum", icon: "ETH", color: "from-blue-400 to-blue-600" },
  BNBUSDT: { name: "BNB", icon: "BNB", color: "from-yellow-400 to-yellow-600" },
  ADAUSDT: { name: "Cardano", icon: "ADA", color: "from-blue-300 to-blue-500" },
  XRPUSDT: { name: "Ripple", icon: "XRP", color: "from-indigo-400 to-indigo-600" },
  SOLUSDT: { name: "Solana", icon: "SOL", color: "from-purple-400 to-purple-600" },
  DOGEUSDT: { name: "Dogecoin", icon: "DOGE", color: "from-yellow-300 to-yellow-500" },
  DOTUSDT: { name: "Polkadot", icon: "DOT", color: "from-pink-400 to-pink-600" },
  MATICUSDT: { name: "Polygon", icon: "MATIC", color: "from-purple-300 to-purple-500" },
  LTCUSDT: { name: "Litecoin", icon: "LTC", color: "from-gray-300 to-gray-500" },
};

const tradeExecuteSound = new Howl({ src: ['/sounds/execute.wav'], preload: true, html5: true });
const tradeWinSound = new Howl({ src: ['/sounds/win.wav'], preload: true, html5: true });
const tradeLoseSound = new Howl({ src: ['/sounds/lose.wav'], preload: true, html5: true });

const safeNumber = (value) => {
  if (value === null || value === undefined || value === "" || isNaN(value)) {
    return "—";
  }
  return Number(value).toLocaleString("en-IN");
};


const TradingSidebar = ({
  symbol,
  onSwitch,
  onTradeHover,
  selectedInterval = "1m",
  symbolPayoutData = {},
  isMobileOpen = false,
  onMobileClose = () => { },
  isLandscapeMode = false,
  isCompact = false
}) => {
  const [timeMinutes, setTimeMinutes] = useState(1);
  const [timeSeconds, setTimeSeconds] = useState(0);
  const [investment, setInvestment] = useState(10000);
  const [price, setPrice] = useState(null);
  const [displayPayout, setDisplayPayout] = useState(85);
  const [tick, setTick] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const { trades, demoTrading, RealTrading, playedTradesRef, tradeMode, setTradeMode, executeTrade } = useTrade();
  const isMountedRef = useRef(true);

  // ---------- Trade Window Bridge (safe/no-op if chart absent) ----------
  const publishTradeWindow = (secs) => {
    try {
      const s = Math.max(1, Number(secs || 1));
      window.tradeWindow = window.tradeWindow || {};
      window.tradeWindow.durationSec = s;
      if (window.tradeWindow.onSidebarDurationChange) {
        window.tradeWindow.onSidebarDurationChange(s);
      }
    } catch { }
  };

  const applyDurationFromChart = useRef((secs) => {
    const s = Math.max(1, Math.round(secs || 1));
    setTimeMinutes(Math.floor(s / 60));
    setTimeSeconds(s % 60);
  });

  useEffect(() => {
    window.tradeWindow = window.tradeWindow || {};
    window.tradeWindow.applyDurationFromChart = (secs) => applyDurationFromChart.current(secs);
    // publish initial on mount
    publishTradeWindow(timeMinutes * 60 + timeSeconds);
    return () => {
      if (window.tradeWindow) delete window.tradeWindow.applyDurationFromChart;
    };
  }, []);

  useEffect(() => {
    const durationSec = timeMinutes * 60 + timeSeconds;
    publishTradeWindow(durationSec);

    // Show guide lines when duration changes
    if (window.tradeGuides?.show) {
      window.tradeGuides.show(durationSec);
    }
  }, [timeMinutes, timeSeconds]);
  // ---------------------------------------------------------------------

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      Howler.stop();
    };
  }, []);

  useEffect(() => {
    if (!isMountedRef.current) return;
    trades.forEach(trade => {
      if (trade.status !== "ACTIVE" && !playedTradesRef.current.has(trade.id)) {
        if (trade.status === "WON") { tradeWinSound.stop(); tradeWinSound.play(); }
        if (trade.status === "LOST") { tradeLoseSound.stop(); tradeLoseSound.play(); }
        playedTradesRef.current.add(trade.id);
      }
    });
  }, [trades, playedTradesRef]);

  const getDynamicPayout = () => {
    const currentSymbolData = symbolPayoutData[symbol];
    if (!currentSymbolData) return 85;
    switch (selectedInterval) {
      case '1s': return currentSymbolData.return1m || 85;
      case '1m': return currentSymbolData.return1m || 85;
      case '3m': return currentSymbolData.return1m || 85;
      case '5m': return currentSymbolData.return5m || 87;
      case '15m': return currentSymbolData.return5m || 87;
      case '30m': return currentSymbolData.return5m || 87;
      case '1h': return currentSymbolData.return5m || 87;
      case '2h': return currentSymbolData.return5m || 87;
      case '4h': return currentSymbolData.return5m || 87;
      case '6h': return currentSymbolData.return5m || 87;
      case '8h': return currentSymbolData.return5m || 87;
      case '12h': return currentSymbolData.return5m || 87;
      case '1d': return currentSymbolData.return5m || 87;
      case '3d': return currentSymbolData.return5m || 87;
      case '1w': return currentSymbolData.return5m || 87;
      case '1M': return currentSymbolData.return5m || 87;
      default: return 85;
    }
  };

  const currentPayout = getDynamicPayout();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayPayout(currentPayout);
    }, 100);
    return () => clearTimeout(timer);
  }, [currentPayout]);

  const payoutPercentage = displayPayout;
  const potentialPayout = Math.round((investment * payoutPercentage) / 100);
  const totalReturn = investment + potentialPayout;

  useEffect(() => {
    const interval = setInterval(() => setTick((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const increaseTime = () => {
    if (timeSeconds < 59) setTimeSeconds(timeSeconds + 1);
    else { setTimeSeconds(0); setTimeMinutes(timeMinutes + 1); }
  };

  const decreaseTime = () => {
    if (timeSeconds > 0) setTimeSeconds(timeSeconds - 1);
    else if (timeMinutes > 0) { setTimeSeconds(59); setTimeMinutes(timeMinutes - 1); }
  };

  const fetchPrice = async () => {
    if (!symbol) return;
    try {
      const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
      const data = await res.json();
      if (data?.price) {
        setPrice(parseFloat(data.price).toFixed(2));
        window.latestPrice = {
          ...window.latestPrice,
          [symbol]: parseFloat(data.price),
        };
      }
    } catch (err) {
      console.error("Error fetching price:", err);
    }
  };

  useEffect(() => {
    if (!symbol) return;
    fetchPrice();
    const interval = setInterval(fetchPrice, 5000);
    return () => clearInterval(interval);
  }, [symbol]);

  const handleRefreshClick = async () => {
    if (refreshing) return;
    setRefreshing(true);
    await fetchPrice();
    setRefreshing(false);
  };

  const meta = SYMBOL_META[symbol] || {
    name: symbol,
    icon: symbol?.slice(0, 3) || "?",
    color: "from-gray-400 to-gray-600",
  };


  const handleTrade = (direction) => {
    tradeExecuteSound.stop();
    tradeExecuteSound.play();

    const durationSec = timeMinutes * 60 + timeSeconds;

    const payload = {
         symbol,
      direction,
      investment,
      duration: durationSec,
      durationSeconds: durationSec,
      price,
      payoutPercentage: displayPayout,
      asset: "usdtmatic",
    };

    executeTrade(payload);

    if (onMobileClose) onMobileClose();
  };

  const getStatusBadgeClasses = (trade) => {
    const isActive = trade.remaining > 0 && trade.status === "ACTIVE";
    if (isActive) return "bg-blue-500/20 text-blue-300";
    if (trade.status === "WON") return "bg-green-500/20 text-green-300";
    return "bg-red-500/20 text-red-300";
  };

  const getPayoutClasses = (trade, candleColor) => {
    const isActive = trade.remaining > 0 && trade.status === "ACTIVE";
    if (isActive) return candleColor === "green" ? "text-green-400" : "text-red-400";
    return trade.status === "WON" ? "text-green-400" : "text-red-400";
  };

  const getDisplayPayoutValue = (trade) => {
    const isActive = trade.remaining > 0 && trade.status === "ACTIVE";
    if (isActive) return trade.payout;
    return trade.status === "WON" ? trade.payout : 0;
  };

  const getModeClasses = (mode) =>
    mode === "DEMO"
      ? "bg-sky-500/15 text-sky-300 border border-sky-400/20"
      : "bg-emerald-500/15 text-emerald-300 border border-emerald-400/20";

  // Ultra-compact layout for mobile landscape
  if (isLandscapeMode && isCompact) {
    return (
      <div className="static w-56 h-screen bg-gradient-to-b from-slate-900 to-slate-950 border-l border-slate-700/50 backdrop-blur-sm text-white shadow-xl flex flex-col overflow-hidden">
        <div className="flex-shrink-0 p-1.5 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className={`w-4 h-4 bg-gradient-to-br ${meta.color} rounded flex items-center justify-center text-white text-xs font-bold`}>
                {meta.icon.charAt(0)}
              </div>
              <div>
                <h3 className="text-xs font-semibold leading-none">{meta.name.slice(0, 6)}</h3>
                <div className="text-xs font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent leading-none">
                  ${price ? parseFloat(price).toFixed(0) : "---"}
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => navigate(`/dashboard/portfolio/deposit`)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 p-1 rounded text-xs font-bold"
              >
                <DollarSign className="w-2.5 h-2.5" />
              </button>
              <button
                onClick={() => navigate(`/dashboard/portfolio/withdrawal`)}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 p-1 rounded text-xs font-bold"
              >
                <Wallet className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 p-1.5">
          <div className="grid grid-cols-2 gap-1.5 mb-1.5">
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Timer className="w-2 h-2 text-blue-400" />
                <span className="text-xs font-semibold text-slate-300">Time</span>
              </div>
              {/* Keep the compact counter UI as-is for this ultra-compact variant */}
              <div className="flex items-center justify-between bg-slate-800/60 rounded p-0.5 border border-slate-600/30">
                <button
                  onClick={decreaseTime}
                  className="w-4 h-4 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center"
                >
                  <Minus size={6} className="text-slate-300" />
                </button>
                <div className="bg-slate-900/70 px-1 py-0.5 rounded text-xs font-mono text-white">
                  {timeMinutes.toString().padStart(2, "0")}:{timeSeconds.toString().padStart(2, "0")}
                </div>
                <button
                  onClick={increaseTime}
                  className="w-4 h-4 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center"
                >
                  <Plus size={6} className="text-slate-300" />
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1 mb-1">
                <DollarSign className="w-2 h-2 text-green-400" />
                <span className="text-xs font-semibold text-slate-300">Amount</span>
              </div>
              <div className="flex items-center justify-between bg-slate-800/60 rounded p-0.5 border border-slate-600/30">
                <button
                  onClick={() => setInvestment(Math.max(1000, investment - 1000))}
                  className="w-4 h-4 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center"
                >
                  <Minus size={6} className="text-slate-300" />
                </button>
                <div className="bg-slate-900/70 px-1 py-0.5 rounded text-xs font-mono text-white">
                  ₹{Math.round(investment / 1000)}K
                </div>
                <button
                  onClick={() => setInvestment(investment + 1000)}
                  className="w-4 h-4 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center"
                >
                  <Plus size={6} className="text-slate-300" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded p-1.5 border border-slate-600/40 mb-1.5">
            <div className="flex items-center justify-between text-center">
              <div>
                <div className="text-xs text-slate-400">Profit</div>
                <div className="text-xs font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  +₹{Math.round(potentialPayout / 1000)}K
                </div>
              </div>
              <div>
                <span className="text-xs bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-full font-medium">
                  {payoutPercentage}%
                </span>
              </div>
              <div>
                <div className="text-xs text-slate-400">Return</div>
                <div className="text-xs font-bold text-white">₹{Math.round(totalReturn / 1000)}K</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => handleTrade("UP")}
              onMouseEnter={() => onTradeHover && onTradeHover('UP')}
              onMouseLeave={() => onTradeHover && onTradeHover(null)}
              className="bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 hover:from-green-600 hover:via-green-700 hover:to-emerald-700 py-1.5 rounded font-bold text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-center justify-center gap-1">
                <TrendingUp className="w-2.5 h-2.5" />
                <span className="text-xs">UP</span>
              </div>
            </button>
            <button
              onClick={() => handleTrade("DOWN")}
              onMouseEnter={() => onTradeHover && onTradeHover('DOWN')}
              onMouseLeave={() => onTradeHover && onTradeHover(null)}
              className="bg-gradient-to-r from-red-500 via-red-600 to-rose-600 hover:from-red-600 hover:via-red-700 hover:to-rose-700 py-1.5 rounded font-bold text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-center justify-center gap-1">
                <TrendingDown className="w-2.5 h-2.5" />
                <span className="text-xs">DOWN</span>
              </div>
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden p-1.5">
          <div className="bg-slate-800/30 rounded h-full flex flex-col border border-slate-600/30">
            <div className="flex items-center justify-between p-1.5 border-b border-slate-600/30 flex-shrink-0">
              <div className="flex items-center gap-1">
                <Clock className="w-2 h-2 text-blue-400" />
                <span className="text-xs font-semibold">Trades</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="bg-blue-500 text-xs px-1 py-0.5 rounded-full font-bold">
                  {trades.length}
                </div>
                <button
                  onClick={() => navigate("/dashboard/trade")}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                >
                  All
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-1.5">
              {trades.length === 0 ? (
                <div className="text-center text-slate-400 py-2">
                  <ShoppingCart size={16} className="mx-auto mb-1 opacity-50" />
                  <p className="text-xs">No trades</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {trades.slice(0, 4).map((trade) => {
                    const candleColor = window.latestCandleColor || "green";
                    const isActive = trade.remaining > 0 && trade.status === "ACTIVE";
                    const badgeClasses = getStatusBadgeClasses(trade);
                    const payoutClasses = getPayoutClasses(trade, candleColor);
                    const payoutValue = getDisplayPayoutValue(trade);
                    return (
                      <div
                        key={trade.id}
                        className="bg-slate-800/50 border border-slate-600/40 rounded p-1 hover:bg-slate-700/50 transition-colors"
                      >
                        <div className="flex justify-between items-center mb-0.5">
                          <div className="flex items-center gap-1">
                            <div className={`w-1 h-1 rounded-full ${trade.direction === "UP" ? "bg-green-400" : "bg-red-400"}`} />
                            <span className="text-xs font-medium">{trade.symbol}</span>
                          </div>
                          <span className={`text-xs px-1 py-0.5 rounded font-medium ${badgeClasses}`}>
                            {isActive ? `${trade.remaining}s` : trade.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400">
                            {trade.direction} • ₹{Math.round(trade.investment / 1000)}K
                          </span>
                          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${getModeClasses(trade.mode)}`}>
                            {trade.mode || "REAL"}
                          </span>
                        </div>
                        <div className="flex justify-end items-center mt-0.5">
                          <span className={`text-xs font-bold ${payoutClasses}`}>
                            ₹{Math.round(payoutValue / 1000)}K
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default layout
  return (
    <div className={`
      bg-gradient-to-b from-slate-900 to-slate-950 
      border-l border-slate-700/50 backdrop-blur-sm
      text-white shadow-xl flex flex-col
      ${isLandscapeMode
        ? `static translate-x-0 h-full z-auto w-64`
        : `
          fixed top-0 right-0 h-full w-80 z-50 transform transition-transform duration-300
          ${isMobileOpen ? 'translate-x-0' : 'translate-x-full'}
          lg:static lg:translate-x-0 lg:w-64 lg:h-full lg:z-auto
        `
      }
      xl:w-64
    `}>
      {!isLandscapeMode && (
        <button
          onClick={onMobileClose}
          className="absolute top-4 right-4 w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center lg:hidden"
        >
          <X size={16} />
        </button>
      )}

      <div className={`p-4 border-b border-slate-700/30 ${isLandscapeMode ? 'mt-0' : 'mt-8 lg:mt-0'}`}>
        <div className="flex gap-2 mb-3">
          <button onClick={() => navigate(`/dashboard/portfolio/deposit`)} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200 shadow-md hover:shadow-lg">
            <DollarSign className="w-3 h-3 inline mr-1" />
            Fund
          </button>
          <button onClick={() => navigate(`/dashboard/portfolio/withdrawal`)} className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200 shadow-md hover:shadow-lg">
            <Wallet className="w-3 h-3 inline mr-1" />
            Withdraw
          </button>
        </div>

        <div className="flex justify-between bg-slate-800/60 p-2 rounded-lg mb-3">
          <button
            onClick={() => setTradeMode("DEMO")}
            className={`flex-1 py-1 rounded-md font-bold text-sm ${tradeMode === "DEMO"
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-slate-300"
              }`}
          >
            DEMO
          </button>

          <button
            onClick={() => setTradeMode("REAL")}
            className={`flex-1 py-1 rounded-md font-bold text-sm ml-2 ${tradeMode === "REAL"
                ? "bg-green-600 text-white"
                : "bg-slate-700 text-slate-300"
              }`}
          >
            REAL
          </button>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-2.5 border border-slate-600/30">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 bg-gradient-to-br ${meta.color} rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                {meta.icon}
              </div>
              <div>
                <h3 className="text-sm font-semibold">{meta.name}</h3>
                <p className="text-xs text-slate-400">Spot Trading</p>
              </div>
            </div>
            <button
              onClick={handleRefreshClick}
              className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-60"
              disabled={refreshing}
            >
              <RefreshCw size={12} className={`text-slate-400 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Activity className="w-3 h-3 text-emerald-400" />
              <span className="text-xs text-slate-400 uppercase tracking-wide">Live Price</span>
            </div>
            <div className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              ${price || "---"}
            </div>
          </div>
        </div>
      </div>

      <div className="px-3 py-2 space-y-3 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Timer className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Duration</span>
          </div>
          {/* Swapped: Quotex-style dropdown control, preserves duration semantics */}
          <TimeGridControl
            valueSeconds={timeMinutes * 60 + timeSeconds}
            onChangeSeconds={(s) => {
              setTimeMinutes(Math.floor(s / 60));
              setTimeSeconds(s % 60);
            }}
            selectedInterval={selectedInterval}
            symbol={symbol}
            stepSeconds={1}          // change to 10/15 to show 07:10 / 07:25 pattern
            gridCols={3}
            gridRows={5}
            compact={false}
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <DollarSign className="w-3.5 h-3.5 text-green-400" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Amount</span>
          </div>

          <div className="flex items-center justify-between bg-slate-800/60 rounded-lg p-1.5 border border-slate-600/30">
            <button
              onClick={() => setInvestment(amountStepDown(investment))}
              className="w-7 h-7 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 rounded-md flex items-center justify-center transition-colors"
            >
              <Minus size={12} className="text-slate-300" />
            </button>

            <Amount value={investment} onChange={setInvestment} min={100} currency="₹" />

            <button
              onClick={() => setInvestment(amountStepUp(investment))}
              className="w-7 h-7 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 rounded-md flex items-center justify-center transition-colors"
            >
              <Plus size={12} className="text-slate-300" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-3 pb-2 flex-shrink-0">
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-lg p-2.5 border border-slate-600/40 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <Target className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Payout</span>
            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-medium">
              {selectedInterval}
            </span>
          </div>

          <div className="flex items-center justify-between text-center">
            <div className="flex-1">
              <div className="text-xs text-slate-400">Profit</div>
              <div className="text-sm font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent transition-all duration-300">
                +₹{potentialPayout.toLocaleString("en-IN")}
              </div>
            </div>
            <div className="px-2">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-slate-400">Return</div>
              <div className="text-sm font-bold text-white transition-all duration-300">₹{totalReturn.toLocaleString("en-IN")}</div>
            </div>
          </div>

          <div className="text-center mt-1.5">
            <div className="text-xs text-slate-500">
              <span className="text-green-400 transition-all duration-300">{payoutPercentage}%</span> • <span className="text-red-400">Risk applies</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-3 pb-3 space-y-1.5 flex-shrink-0">
        <button
          onClick={() => handleTrade("UP")}
          onMouseEnter={() => onTradeHover && onTradeHover('UP')}
          onMouseLeave={() => onTradeHover && onTradeHover(null)}
          className="w-full bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 hover:from-green-600 hover:via-green-700 hover:to-emerald-700 py-2.5 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
        >
          <div className="flex items-center justify-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>UP</span>
          </div>
        </button>
        <button
          onClick={() => handleTrade("DOWN")}
          onMouseEnter={() => onTradeHover && onTradeHover('DOWN')}
          onMouseLeave={() => onTradeHover && onTradeHover(null)}
          className="w-full bg-gradient-to-r from-red-500 via-red-600 to-rose-600 hover:from-red-600 hover:via-red-700 hover:to-rose-700 py-2.5 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
        >
          <div className="flex items-center justify-center gap-2">
            <TrendingDown className="w-4 h-4" />
            <span>DOWN</span>
          </div>
        </button>
      </div>

      <div className="flex-1 px-3 pb-3 min-h-0 overflow-hidden">
        <div className="bg-slate-800/30 rounded-xl h-full flex flex-col border border-slate-600/30">
          <div className="flex items-center justify-between p-2.5 border-b border-slate-600/30 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-sm font-semibold">Recent Trades</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-blue-500 text-xs px-2 py-0.5 rounded-full font-bold">
                {trades.length}
              </div>
              <button
                onClick={() => navigate("/dashboard/trade")}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                View All →
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5">
            {trades.length === 0 ? (
              <div className="text-center text-slate-400 py-6">
                <ShoppingCart size={28} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No trades yet</p>
                <p className="text-xs text-slate-500 mt-1">Start your first trade above</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {trades.slice(0, 4).map((trade) => {
                  const candleColor = window.latestCandleColor || "green";
                  const isActive = trade.remaining > 0 && trade.status === "ACTIVE";
                  const badgeClasses = getStatusBadgeClasses(trade);
                  const payoutClasses = getPayoutClasses(trade, candleColor);
                  const payoutValue = getDisplayPayoutValue(trade);
                  return (
                    <div
                      key={trade.id}
                      className="bg-slate-800/50 border border-slate-600/40 rounded-lg p-2.5 hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${trade.direction === "UP" ? "bg-green-400" : "bg-red-400"}`} />
                          <span className="text-sm font-medium">{trade.symbol}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeClasses}`}>
                          {isActive ? `${trade.remaining}s` : trade.status}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">
                          {trade.direction} • ₹{safeNumber(trade.investment)}
                        </span>

                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getModeClasses(trade.mode)}`}>
                          {trade.mode || "REAL"}
                        </span>
                      </div>

                      <div className="mt-1 flex justify-end">
                        <span className={`text-sm font-bold ${payoutClasses}`}>
                          ₹{safeNumber(payoutValue)}
                        </span>
                      </div>
                    </div>
                  );

                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingSidebar;
