import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DrawingToolbar = ({ plugin }) => {
  const [activeMode, setActiveMode] = useState(null);
  const [color, setColor] = useState("#60a5fa");
  const [style, setStyle] = useState("solid");
  const [isOpen, setIsOpen] = useState(false);

  const handleMode = (mode) => {
    if (!plugin) return;
    const newMode = mode === activeMode ? null : mode;
    plugin.setMode(newMode);
    setActiveMode(newMode);
    setIsOpen(false);
  };

  const handleColorChange = (e) => {
  const newColor = e.target.value;
  setColor(newColor);

  plugin?.setStyleOptions?.({
    color: newColor,
    style,
    gradientTopColor: newColor + "33",     // 20% opacity
    gradientBottomColor: newColor + "00",  // transparent
  });
};


  const handleStyleChange = (e) => {
    const newStyle = e.target.value;
    setStyle(newStyle);
    plugin?.setStyleOptions?.({ color, style: newStyle });
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        plugin?.setMode(null);
        setActiveMode(null);
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [plugin]);

  if (!plugin) return null;

  const tools = [
    { mode: "line", label: "Trend Line", icon: "✏️" },
    { mode: "angle", label: "Trend Angle", icon: "📐" },
    { mode: "ray", label: "Ray Line", icon: "➖" },
    { mode: "horizontal", label: "Horizontal Line", icon: "⎯" },
    { mode: "vertical", label: "Vertical Line", icon: "|" },
    { mode: "extended", label: "Extended Line", icon: "↔" },
    { mode: "crossline", label: "Cross Line", icon: "✚" },
    { mode: "rectangle", label: "Rectangle", icon: "▭" },
    { mode: "parallel", label: "Parallel Channel", icon: "📏" },
    { mode: "disjoint", label: "Disjoint Channel", icon: "🟧" },
    { mode: "pitchfork", label: "Pitchfork", icon: "⚒️" },
    { mode: "pitchfan", label: "Pitch Fan", icon: "🪭" },
    { mode: "triangle", label: "Triangle", icon: "🔺" },
    { mode: "arc", label: "Arc Line", icon: "⭕" },
    { mode: "cyclic", label: "Cyclic Lines", icon: "🔁" },
    { mode: "curve", label: "Curve Line", icon: "🌈" },
    { mode: "flat_zone", label: "Flat Top/Bottom", icon: "▤" },


  ];

  return (
    <>
      {/* 🖊 Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-15 right-30 z-[2100]
        bg-gray-800/40 hover:bg-gray-700/50 text-white font-medium px-4 py-2 rounded-lg 
        backdrop-blur-md border border-gray-600/50 shadow-lg flex items-center gap-2 transition-all"
      >
        🖊 Drawing Tools
      </button>

      {/* 📜 Sliding Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="absolute top-28 right-8 z-[2050] w-64 
            bg-gray-900/50 backdrop-blur-lg border border-gray-700/60 rounded-2xl shadow-2xl 
            p-4 flex flex-col gap-3 text-white"
          >
            <h3 className="text-sm font-semibold tracking-wide text-gray-200">
              🧭 Drawing Tools
            </h3>

            {/* Tool Buttons */}
            <div className="flex flex-col gap-1 max-h-[55vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {tools.map((tool) => (
                <button
                  key={tool.mode}
                  onClick={() => handleMode(tool.mode)}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all 
                    ${
                      activeMode === tool.mode
                        ? "bg-blue-600/80 text-white"
                        : "bg-gray-800/40 hover:bg-gray-700/60 text-gray-200"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{tool.icon}</span>
                    <span>{tool.label}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="border-t border-gray-700/50 my-2"></div>

            {/* 🎨 Style + Color */}
            <div className="flex items-center justify-between gap-3">
              <input
                type="color"
                value={color}
                onChange={handleColorChange}
                title="Change Line Color"
                className="w-7 h-7 cursor-pointer rounded border border-gray-600 bg-transparent"
              />

              <select
                value={style}
                onChange={handleStyleChange}
                title="Line Style"
                className="text-xs bg-gray-800/60 text-white rounded px-2 py-1 outline-none cursor-pointer"
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </select>
            </div>

            {/* 🧹 Clear + ❌ Exit */}
            <div className="flex justify-between pt-2">
              <button
                onClick={() => {
                  plugin.clear();
                  setActiveMode(null);
                  setIsOpen(false);
                }}
                className="bg-red-600/80 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded transition"
              >
                🧹 Clear
              </button>

              <button
                onClick={() => {
                  plugin.setMode(null);
                  setActiveMode(null);
                  setIsOpen(false);
                }}
                className="bg-gray-700/70 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded transition"
              >
                ❌ Exit
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DrawingToolbar;
