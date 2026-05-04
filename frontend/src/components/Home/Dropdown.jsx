import React, { useEffect, useRef, useState } from "react";

const Dropdown = ({ label, icon: Icon, options, value, onChange }) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  // If search is active, filter by it
  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (opt) => {
    onChange(opt); // update selected value
    setSearch(""); // clear search after selection
    setOpen(false); // close dropdown
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Input Field */}
      <div className="">
        <Icon className="absolute top-4 left-1 text-gray-500 text-xl" />
        <input
          type="text"
          value={search !== "" ? search : value || ""}
          required
          onChange={(e) => {
            setSearch(e.target.value);
            if (e.target.value === "") {
              onChange(""); // clears selected value
            }
          }}
          onFocus={() => setOpen(true)}
          placeholder=" "
          className="peer w-full px-4 pl-8 pt-3.5 pb-2 rounded-lg  border border-gray-700 text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <label
          className="pointer-events-none peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 absolute left-8 top-3.5 text-gray-400  transition-all
                          peer-placeholder-shown:top-3.5  peer-placeholder-shown:text-gray-500
                          peer-focus:-top-3 bg-[#090e14] peer-focus:text-green-500"
        >
          {label}
        </label>
      </div>

      {/* Dropdown Menu */}
      {open && (
        <ul className="absolute z-10 mt-1 w-full max-h-40 overflow-y-auto bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, index) => (
              <li
                key={index}
                onClick={() => handleSelect(opt)}
                className="px-4 py-2 text-gray-200 hover:bg-gray-700 cursor-pointer"
              >
                {opt}
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-gray-400">No results</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
