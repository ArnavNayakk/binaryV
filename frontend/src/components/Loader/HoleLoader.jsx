import React from "react";
import "./HoleLoader.css";

const HoleLoader = () => {
  return (
    <div className="hole">
      {Array.from({ length: 10 }).map((_, index) => (
        <i key={index}></i>
      ))}
    </div>
  );
};

export default HoleLoader;
