import React from "react";

const CandlestickLoader = () => {
  return (
    <div className="flex items-end justify-center gap-2 h-40">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`w-4 rounded-sm ${
            i % 2 === 0 ? "bg-green-500" : "bg-red-500"
          } animate-bounce`}
          style={{ animationDelay: `${i * 0.2}s`, height: `${40 + i * 20}px` }}
        ></div>
      ))}
    </div>
  );
};

export default CandlestickLoader;
