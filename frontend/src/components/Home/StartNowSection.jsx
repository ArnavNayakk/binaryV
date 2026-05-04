import React from 'react';
import assets from "../../assets/assets";

const StartNowSection = () => {
    return (
    <section className="bg-[#0B0F1A] text-white min-h-screen flex flex-col md:flex-row items-center justify-center px-6 md:px-16">
      
      {/* Left Side: Image */}
      <div className="flex-1 flex justify-center relative mb-10 md:mb-0">
        <img
          src={assets.future}
          alt="Trader"
          className="max-w-[90%] md:max-w-[80%] object-contain"
        />
      </div>

      {/* Right Side: Text Content */}
      <div className="flex-1 flex flex-col justify-center text-center md:text-left max-w-xl">
        <p className="text-[#38D300] text-sm md:text-base mb-2">
          Unlock Your Trading Potential
        </p>

        <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
          Revolutionize Your <br />
          Financial Future <br />
          with Our Binary
        </h1>

        <p className="text-gray-300 text-sm md:text-base mb-3">
          Experience the Seamless Convergence of Advanced Technology and 
          User-Friendly Design for Maximum
        </p>

        <p className="text-gray-400 text-sm md:text-base mb-6">
          Elevate Your Trading Game with Our Cutting-Edge Platform, Offering 
          Live Data, Instant Payouts, and an Intuitive Interface. Unlock Your 
          Financial Freedom Today
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button className="bg-[#38D300]  text-white px-6 py-3 rounded-full font-semibold transition">
            Start Now
          </button>
          <button className="bg-white hover:bg-gray-100 text-black px-6 py-3 rounded-full font-semibold transition">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
};

export default StartNowSection;

