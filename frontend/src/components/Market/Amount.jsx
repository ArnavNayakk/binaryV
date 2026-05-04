import React, { useEffect, useState } from "react";

// Tiered ladder helpers for +/- buttons
export const amountStepUp = (v) => {
  if (v < 100) return 100;
  if (v < 200) return 200;
  if (v < 500) return 500;
  if (v < 1000) return 1000;
  return v + 1000; // at/above 1000 → add 1000
};

export const amountStepDown = (v) => {
  if (v <= 100) return 100;

  // Above 1000: step down in thousands
  if (v > 1000) {
    const remainder = v % 1000;
    if (remainder !== 0) {
      // snap down to the nearest lower thousand
      const snapped = v - remainder;
      return Math.max(1000, snapped);
    }
    // exact thousand → subtract 1000
    return Math.max(1000, v - 1000);
  }

  // 1000 and below follow fine ladder
  if (v > 1000) return 1000; // safety
  if (v > 500) return 500;
  if (v > 200) return 200;
  return 100;
};

export default function Amount({
  value,
  onChange,
  min = 100,
  currency = "₹",
  className = ""
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const [prev, setPrev] = useState(value);

  useEffect(() => {
    if (!editing) setDraft(String(value));
  }, [value, editing]);

  const commit = () => {
    const num = parseInt((draft || "").replace(/\D/g, "") || "0", 10);
    const next = Math.max(min, num);
    onChange(next);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(String(prev));
    setEditing(false);
  };

  const startEdit = () => {
    setPrev(value);
    setDraft(String(value));
    setEditing(true);
    setTimeout(() => {
      const el = document.getElementById("amount-input");
      if (el) {
        el.focus();
        el.select();
      }
    }, 0);
  };

  if (!editing) {
    return (
      <button
        onClick={startEdit}
        className={[
          "group inline-flex items-center justify-center",
          "bg-slate-900/80 px-3 py-1.5 rounded-md border border-slate-600/50",
          "shadow-sm hover:shadow-md transition-all duration-150",
          "ring-0 focus:outline-none focus:ring-2 focus:ring-emerald-400/40",
          className
        ].join(" ")}
      >
        <span className="text-sm font-mono text-white">
          {currency} {value.toLocaleString("en-IN")}
        </span>
      </button>
    );
  }

  return (
    <div
      className={[
        "inline-flex items-center gap-1",
        "bg-slate-900/80 px-3 py-1.5 rounded-md border border-slate-600/50",
        "ring-2 ring-emerald-400/30 shadow-md",
        className
      ].join(" ")}
    >
      <span className="text-sm font-mono text-white">{currency}</span>
      <input
        id="amount-input"
        value={draft}
        onChange={(e) => {
          const onlyDigits = e.target.value.replace(/\D/g, "");
          setDraft(onlyDigits);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") cancel();
        }}
        onBlur={commit}
        inputMode="numeric"
        pattern="[0-9]*"
        className="w-28 bg-transparent outline-none text-sm font-mono text-white text-center placeholder-slate-400"
        placeholder={String(min)}
      />
    </div>
  );
}