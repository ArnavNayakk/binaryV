import React from "react";

const PageLoader = () => {
  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex justify-center items-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-400 border-t-transparent"></div>
    </div>
  );
};

export default PageLoader;
