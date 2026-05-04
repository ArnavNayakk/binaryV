import React from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import WalletNavlink from "../../components/Dashboard/WalletNavlink";

function Tournaments() {
  return (
    <div className="relative min-h-screen bg-gray-900 overflow-hidden">
      {/* Nav */}
      <div className="relative z-10">
        <WalletNavlink />
      </div>

      {/* Background overlay for glassy effect */}
      <div className="absolute inset-0  backdrop-blur-md z-0"></div>

      {/* Main Content */}
      <div className="relative z-20 items-center mt-50 px-6 text-center min-h-[calc(100vh-0px)]">
        <div>
          <h1 className="text-6xl md:text-8xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-green-200 to-green-400 animate-shine shadow-lg">
            Coming Soon...
          </h1>
          <p className="mt-6 text-gray-200 text-lg md:text-xl">
            Our website is launching soon. Stay tuned!
          </p>

          <div className="flex justify-center mt-8 space-x-6 text-green-400">
            <a href="#" className="hover:text-white transition-transform transform hover:scale-125">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="hover:text-white transition-transform transform hover:scale-125">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="hover:text-white transition-transform transform hover:scale-125">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes shine {
            0% { background-position: -500% 0; }
            100% { background-position: 500% 0; }
          }
          .animate-shine {
            background-size: 200% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: shine 2.5s linear infinite;
          }
        `}
      </style>
    </div>
  );
}

export default Tournaments;
