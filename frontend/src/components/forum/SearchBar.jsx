import React from "react";
import { FiSearch } from "react-icons/fi";

const SearchBar = () => {
  return (
    <div className="relative">
      <FiSearch className="absolute left-3 top-3 text-gray-400" />
      <input
        type="text"
        placeholder="Search posts…"
        className="bg-gray-800 pl-10 pr-4 py-2 rounded-lg outline-none"
      />
    </div>
  );
};

export default SearchBar;
