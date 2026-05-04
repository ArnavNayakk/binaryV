import React, { useMemo, useState } from "react";

export default function TradingActivityHeatmap({
  activity = [],
  month,
  year,
  onDayClick,
}) {
  const [tooltip, setTooltip] = useState({
    show: false,
    x: 0,
    y: 0,
    text: "",
  });

  const activityMap = useMemo(() => {
    const map = new Map();
    activity.forEach((a) => map.set(a.date, a.sessions));
    return map;
  }, [activity]);

  const now = new Date();
  const curMonth = month ?? now.getMonth();
  const curYear = year ?? now.getFullYear();

  const first = new Date(curYear, curMonth, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(curYear, curMonth + 1, 0).getDate();

  const weeks = [];
  let row = new Array(7).fill(null);

  let d = 1;

  for (let i = 0; i < startDay; i++) row[i] = null;

  while (d <= daysInMonth) {
    const col = (startDay + d - 1) % 7;
    row[col] = d;

    if (col === 6 || d === daysInMonth) {
      weeks.push(row);
      row = new Array(7).fill(null);
    }
    d++;
  }

  const fmt = (y, m, d) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const getColor = (count) => {
    if (!count) return "bg-gray-800 border-gray-700 text-gray-500";
    if (count === 1)
      return "bg-green-900 border-green-900 text-green-300";
    if (count <= 3)
      return "bg-green-700 border-green-700 text-green-200";
    if (count <= 6)
      return "bg-green-500 border-green-500 text-white";
    return "bg-green-400 border-green-400 text-black";
  };

  const monthName = first.toLocaleString("default", { month: "long" });

  const showTip = (e, text) => {
    const r = e.currentTarget.getBoundingClientRect();
    setTooltip({
      show: true,
      x: r.left + r.width / 2,
      y: r.top - 10,
      text,
    });
  };

  const hideTip = () => setTooltip({ show: false });

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 shadow-xl backdrop-blur-lg">
      {/* HEADER */}
      <h3 className="text-s text-gray-400 mb-4">
        {monthName} {curYear} — Trading Activity
      </h3>

      {/* WEEK HEADER - FIXED WIDTH CELLS */}
      <div
        className="grid mb-2 gap-1"
        style={{
          gridTemplateColumns: "repeat(7, 45px)",
        }}
      >
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w) => (
          <div
            key={w}
            className="text-center text-xs text-gray-400"
            style={{ width: "45px" }}
          >
            {w}
          </div>
        ))}
      </div>

      {/* DATE GRID - FIXED WIDTH CELLS */}
      <div className="grid gap-1"
        style={{
          gridTemplateColumns: "repeat(7, 45px)",
        }}
      >
        {weeks.map((wk, i) =>
          wk.map((n, j) => {
            if (!n)
              return (
                <div
                  key={`${i}-${j}`}
                  className="w-[45px] h-[45px]"
                ></div>
              );

            const dateStr = fmt(curYear, curMonth, n);
            const count = activityMap.get(dateStr) || 0;

            return (
              <div
                key={`${i}-${j}`}
                onMouseEnter={(e) =>
                  showTip(
                    e,
                    `${monthName} ${n} — ${count} session${
                      count !== 1 ? "s" : ""
                    }`
                  )
                }
                onMouseLeave={hideTip}
                onClick={() => onDayClick && onDayClick(dateStr)}
                className={`
                  w-[45px] h-[45px] rounded-lg border flex items-center justify-center
                  transition-all duration-150 cursor-pointer hover:scale-110
                  ${getColor(count)}
                `}
              >
                <span className="text-sm select-none">{n}</span>
              </div>
            );
          })
        )}
      </div>

      {/* TOOLTIP */}
      {tooltip.show && (
        <div
          style={{
            position: "fixed",
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -110%)",
            zIndex: 10000,
          }}
          className="px-3 py-1 rounded-md text-xs bg-black/90 text-gray-200 border border-gray-700 shadow-lg"
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
