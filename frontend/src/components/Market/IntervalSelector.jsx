import React, { useState } from "react";

const INTERVALS = [
  "1s", "1m", "3m", "5m", "15m", "30m",
  "1h", "2h", "4h", "6h", "8h", "12h",
  "1d", "3d", "1w", "1M"
];

const IntervalSelector = ({ interval, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute bottom-6 left-3 z-20">
      {/* Wrapper for relative positioning */}
      <div className="relative inline-block">
        {/* Square button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 bg-gradient-to-r from-blue-700 to-purple-700 
                     hover:from-blue-800 hover:to-purple-700 
                     bg-opacity-50 rounded-md mb-35 flex items-center justify-center 
                     text-white text-sm hover:bg-opacity-80 relative group"
        >
          {interval}

          {/* Tooltip */}
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs 
                           bg-gray-800 text-white px-2 py-1 rounded 
                           opacity-0 group-hover:opacity-100 transition-opacity">
            Intervals
          </span>
        </button>

        {/* Dropdown list */}
        {isOpen && (
          <div
            className="absolute left-0 bottom-full 
               bg-transparent rounded shadow-lg 
               max-h-60 overflow-y-auto"
          >
            <table className="bg-transparent border-collapse">
              <tbody>
                {INTERVALS.map((int) => (
                  <tr key={int}>
                    <td>
                      <button
                        onClick={() => {
                          onChange(int);
                          setIsOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm 
                  hover:bg-gray-700/50 rounded
                  ${interval === int
                            ? "bg-gray-700/70 text-green-400"
                            : "text-white"
                          }`}
                      >
                        {int}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}



      </div>
    </div>
  );
};

export default IntervalSelector;
