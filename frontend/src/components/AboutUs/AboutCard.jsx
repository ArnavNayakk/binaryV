import React from "react";
import { motion } from "framer-motion";

const AboutCard = ({ aboutData }) => {
  if (!aboutData) {
    return <div>Loading...</div>;
  }
  return (
    <div className="bg-black flex justify-center items-center px-6 md:px-16">
      <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 rounded-xl shadow-lg p-8 max-w-4xl text-center relative overflow-hidden">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] bg-repeat"></div>

        {/* Content */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="text-3xl md:text-4xl font-bold relative z-10"
        >
          {aboutData?.subTitle}
        </motion.h2>
        <p className="mt-6 text-gray-300 leading-relaxed relative z-10">
          {aboutData?.subDescription}
        </p>
      </div>
    </div>
  );
};

export default AboutCard;
