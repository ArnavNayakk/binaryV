import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import Card from "./Card";

const features = [
  { title: "Live Data", description: "Monitor the Markets in Real-Time for Informed Decisions" },
  { title: "Instant", description: "Get Your Winnings Quickly and Securely, Hassle-Free" },
  { title: "Easy UI", description: "Intuitive Interface Designed for Novice and Experienced Users" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.3 } },
};

const FeaturesSection = () => {
  const controls = useAnimation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Small screen card rotation
  useEffect(() => {
    if (!isMobile) return;
    let idx = 0;
    const interval = setInterval(() => {
      const positions = ["center", "left", "right"];
      const rotateOrder = [positions[idx % 3], positions[(idx + 1) % 3], positions[(idx + 2) % 3]];
      controls.start((i) => getPositionStyles(rotateOrder[i]));
      idx++;
    }, 3000);
    return () => clearInterval(interval);
  }, [controls, isMobile]);

  const getPositionStyles = (pos) => {
    switch (pos) {
      case "center": return { left: "65%", scale: 1, zIndex: 20, opacity: 1, x: "-50%" };
      case "left": return { left: "40%", scale: 0.8, zIndex: 10, opacity: 0.6, x: "-50%" };
      case "right": return { left: "85%", scale: 0.8, zIndex: 10, opacity: 0.6, x: "-50%" };
      default: return {};
    }
  };

  return (
    <motion.section
      className="w-full mx-auto bg-[#06080d] py-2 flex items-center justify-evenly px-4 lg:px-20 lg:gap-6"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {!isMobile ? (
        <div className="flex items-center justify-evenly gap-6 w-full px-4">
          {features.map((feature) => (
            <motion.div key={feature.title} whileHover={{ scale: 1.1 }}>
              <Card title={feature.title} description={feature.description} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex bg-[#06080d] justify-center items-center mx-auto relative w-full h-[30vh] overflow-hidden">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              custom={i}
              animate={controls}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute w-full rounded-2xl shadow-xl overflow-hidden cursor-pointer"
            >
              <div className="w-[70%]">
                <Card title={feature.title} description={feature.description} />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.section>
  );
};

export default FeaturesSection;
