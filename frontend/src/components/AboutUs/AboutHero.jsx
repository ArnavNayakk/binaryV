import React from "react";
import assets from "../../assets/assets";
import { useNavigate } from "react-router-dom";

const AboutHero = ({ aboutData }) => {
  if (!aboutData) {
    return <div>Loading....</div>;
  }
  const navigate = useNavigate();
  return (
    <section className="bg-black text-white px-6 md:px-16 py-16 flex flex-col md:flex-row items-center justify-between">
      {/* Left Content */}
      <div className="md:w-1/2 text-center md:text-left space-y-6">
        <h1 className="text-4xl md:text-5xl font-extrabold">About us</h1>
        <p className="text-gray-300 leading-relaxed">
          {aboutData?.description}
        </p>

        <div className="flex items-center gap-4 justify-center md:justify-start">
          <button
            onClick={() => navigate("/dashboard/markets")}
            className="px-6 py-3 rounded-md bg-gradient-to-r from-green to-green-700 text-white font-medium shadow-lg hover:scale-105 transition-transform cursor-pointer"
          >
            Trade Now
          </button>
        </div>
      </div>

      {/* Right Image */}
      <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
        <img
          src={aboutData?.aboutImg || assets.about}
          alt="Trading illustration"
          className="w-[80%] md:w-[90%] rounded-xl shadow-2xl"
        />
      </div>
    </section>
  );
};

export default AboutHero;
