import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import api from "../api/axiosClient";
import { SOCKET_BASE_URL } from "../config/api";
import { notifyError } from "../lib/notify";
import { useAuth } from "./AuthContext";

const TradeContext = createContext();
export const useTrade = () => useContext(TradeContext);

const getDemoTradesKey = (userId) => `demoTrades:${userId}`;
const createTradeIdempotencyKey = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `trade-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const loadDemoTrades = (userId) => {
  if (typeof window === "undefined" || !userId) return [];
  try {
    const raw = window.localStorage.getItem(getDemoTradesKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveDemoTrades = (userId, trades) => {
  if (typeof window === "undefined" || !userId) return;
  window.localStorage.setItem(getDemoTradesKey(userId), JSON.stringify(trades));
};

const normalizeTrade = (trade) => {
  const id = trade.tradeId || trade.id || trade._id;
  const expiryTime = trade.expiryTime || trade.endTime || null;
  const openingPrice = trade.openingPrice ?? trade.entryPrice ?? null;
  const payout = trade.payoutAmount ?? trade.payout ?? 0;

  return {
    id,
    assets: trade.assets || trade.symbol || "-",
    symbol: trade.symbol || trade.assets || "-",
    direction: trade.direction,
    investment: Number(trade.investment || 0),
    payout: Number(payout || 0),
    entryPrice: openingPrice === null ? null : Number(openingPrice),
    closingPrice:
      trade.closingPrice === null || trade.closingPrice === undefined
        ? null
        : Number(trade.closingPrice),
    startTime: trade.startTime || null,
    expiryTime,
    endTime: expiryTime,
    status: trade.status || "ACTIVE",
    mode: (trade.mode || trade.tradeMode || "REAL").toUpperCase(),
    remaining: expiryTime
      ? Math.max(0, Math.round((new Date(expiryTime).getTime() - Date.now()) / 1000))
      : Number(trade.remaining || 0),
  };
};

export const TradeProvider = ({ children }) => {
  const { user } = useAuth();
  const [trades, setTrades] = useState([]);
  const [demoBalance, setDemoBalance] = useState(100000);
  const [isTradeAllowed, setIsTradeAllowed] = useState(true);
  const [tradeMode, setTradeMode] = useState(() => {
    if (typeof window === "undefined") return "DEMO";
    return window.localStorage.getItem("tradeMode") || "DEMO";
  });

  const timersRef = useRef({});
  const playedTradesRef = useRef(new Set());
  const socketRef = useRef(null);

  const upsertTrade = (incomingTrade) => {
    const normalizedTrade = normalizeTrade(incomingTrade);
    setTrades((prev) => {
      const next = prev.filter((trade) => trade.id !== normalizedTrade.id);
      return [normalizedTrade, ...next];
    });
  };

  const persistDemoTrades = useCallback((nextTrades) => {
    if (!user?._id) return;
    const demoTrades = nextTrades.filter((trade) => trade.mode === "DEMO");
    saveDemoTrades(user._id, demoTrades);
  }, [user?._id]);

  const executeTrade = (payload) => {
    if (tradeMode === "DEMO") return demoTrading(payload);
    return realTrading(payload);
  };

  useEffect(() => {
    if (demoBalance <= 0) {
      setDemoBalance(0);
      setIsTradeAllowed(false);
    } else {
      setIsTradeAllowed(true);
    }
  }, [demoBalance]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("tradeMode", tradeMode);
  }, [tradeMode]);

  const demoTrading = ({ symbol, direction, investment, durationSeconds, duration, price, payoutPercentage }) => {
    const durationSec = Number(durationSeconds || duration || 0);

    if (!isTradeAllowed || demoBalance <= 0) {
      notifyError("Your demo balance is exhausted. Reset it before placing another demo trade.");
      return;
    }

    if (investment > demoBalance) {
      notifyError("Insufficient demo balance for this trade.");
      return;
    }

    const id = Date.now().toString();
    const expiryTime = new Date(Date.now() + durationSec * 1000).toISOString();
    const payout = investment + (investment * Number(payoutPercentage || 65)) / 100;

    const trade = normalizeTrade({
      id,
      symbol,
      direction,
      investment,
      payout,
      entryPrice: price,
      startTime: new Date().toISOString(),
      expiryTime,
      status: "ACTIVE",
      mode: "DEMO",
      remaining: durationSec,
    });

    setDemoBalance((prev) => Math.max(prev - investment, 0));
    setTrades((prev) => {
      const nextTrades = [trade, ...prev];
      persistDemoTrades(nextTrades);
      return nextTrades;
    });

    timersRef.current[id] = window.setTimeout(() => {
      const didWin = Math.random() >= 0.5;
      setTrades((prev) => {
        const nextTrades = prev.map((currentTrade) =>
          currentTrade.id === id
            ? {
                ...currentTrade,
                status: didWin ? "WON" : "LOST",
                payout: didWin ? payout : 0,
                closingPrice: currentTrade.entryPrice,
                remaining: 0,
              }
            : currentTrade
        );
        persistDemoTrades(nextTrades);
        return nextTrades;
      });

      if (didWin) {
        setDemoBalance((prev) => prev + payout);
      }

      delete timersRef.current[id];
    }, durationSec * 1000);
  };

  const fetchTradeHistory = useCallback(async () => {
    if (!user?._id) {
      setTrades([]);
      return;
    }

    try {
      const res = await api.get("/api/trades/tradeHistory");
      const realTrades = (res.data.trades || []).map(normalizeTrade);
      const demoTrades = loadDemoTrades(user._id).map(normalizeTrade);
      const merged = [...realTrades, ...demoTrades].sort(
        (a, b) => new Date(b.startTime || b.expiryTime || 0).getTime() - new Date(a.startTime || a.expiryTime || 0).getTime()
      );
      setTrades(merged);
    } catch (err) {
      console.error("Failed to fetch trade history:", err);
    }
  }, [user?._id]);

  const realTrading = async (payload) => {
    try {
      const idempotencyKey = createTradeIdempotencyKey();
      const res = await api.post("/api/trades/trade", payload, {
        headers: {
          "X-Idempotency-Key": idempotencyKey,
        },
      });
      if (res?.data?.trade) {
        upsertTrade({ ...res.data.trade, mode: "REAL" });
      }
      await fetchTradeHistory();
      return res.data;
    } catch (err) {
      console.error("Trade Error:", err);
      notifyError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Trade could not be placed."
      );
      throw err;
    }
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTrades((prev) =>
        prev.map((trade) =>
          trade.status === "ACTIVE"
            ? { ...trade, remaining: Math.max(0, trade.remaining - 1) }
            : trade
        )
      );
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchTradeHistory();
  }, [fetchTradeHistory, tradeMode]);

  useEffect(() => {
    if (tradeMode !== "REAL" || !user?._id) return undefined;

    socketRef.current = io(SOCKET_BASE_URL, {
      withCredentials: true,
    });

    socketRef.current.on("trade:placed", upsertTrade);
    socketRef.current.on("trade:closed", upsertTrade);

    return () => {
      socketRef.current?.off("trade:placed", upsertTrade);
      socketRef.current?.off("trade:closed", upsertTrade);
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [tradeMode, user?._id]);

  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach((timerId) => window.clearTimeout(timerId));
    };
  }, []);

  return (
    <TradeContext.Provider
      value={{
        trades,
        demoTrading,
        RealTrading: realTrading,
        demoBalance,
        fetchTradeHistory,
        playedTradesRef,
        tradeMode,
        setTradeMode,
        executeTrade,
      }}
    >
      {children}
    </TradeContext.Provider>
  );
};
