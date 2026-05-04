import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import assets from "../../assets/assets";

const features = [
  {
    heading: "Real-Time Market Data",
    paragraph:
      "Stay ahead with live updates on stock, forex, and crypto markets. BinaryV provides accurate and fast market data to help you make informed trading decisions.",
    image: assets.f1,
  },
  {
    heading: "Advanced Trading Tools",
    paragraph:
      "Use BinaryV's intuitive charts, technical indicators, and risk management tools to craft winning trading strategies efficiently.",
    image: assets.f2,
  },
  {
    heading: "Secure Transactions",
    paragraph:
      "Trade with confidence. BinaryV ensures top-notch security for deposits, withdrawals, and trades with encrypted transactions.",
    image: assets.f3,
  },
  {
    heading: "Educational Resources",
    paragraph:
      "Learn while you trade. Access guides, tutorials, webinars, and market analysis to boost your trading knowledge and skills.",
    image: assets.f4,
  },
  {
    heading: "Mobile Trading",
    paragraph:
      "Trade on the go with BinaryV's mobile-optimized platform. Monitor markets, execute trades, and stay updated anytime, anywhere.",
    image: assets.f5,
  },
  {
    heading: "24/7 Customer Support",
    paragraph:
      "Get assistance whenever you need it. Our dedicated support team is available round the clock to resolve your trading queries quickly.",
    image: assets.f6,
  },
];

const FeatureCard = ({ feature, index }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.6,
        ease: "easeOut",
        delay: index * 0.1,
      }}
      className="bg-dark overflow-hidden w-full shadow-lg hover:shadow-2xl hover:scale-105 duration-300"
    >
      <div className="w-full h-50">
        <img
          src={feature.image}
          alt={feature.heading}
          className="w-full h-50 object-cover rounded-lg"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-green-400 mb-3">
          {feature.heading}
        </h3>
        <p className="text-gray-300">{feature.paragraph}</p>
      </div>
    </motion.div>
  );
};

const Features = () => {
  return (
    <section className="bg-dark text-white py-12 px-4 md:px-12">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
        Key Features of <span className="text-green">BinaryV</span>
      </h2>
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 space-y-3 mx-auto">
        {features.map((feature, index) => (
          <FeatureCard key={index} feature={feature} index={index} />
        ))}
      </div>
    </section>
  );
};

export default Features;
