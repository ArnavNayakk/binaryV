import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const backers = [
  "Solana Capital",
  "Huobi Ventures",
  "CMS",
  "YOU&ME CAPITAL",
  "Digital Strategies",
  "Gate.io Labs",
  "MXC",
  "HASKEY",
  "Petrock Capital",
  "Illusionist Group",
  "G Ventures",
  "SkyVision Capital",
  "Coin98 Ventures",
  "Solana Eco Fund",
  "D Ventures",
];

const Roadmap = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [refBackers, inViewBackers] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div className="bg-black text-white px-6">
      {/* Roadmap Section */}
      <section className="text-center mb-16">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-green to-green-600 text-transparent bg-clip-text">
          How It Works
        </h2>
        <p className="text-gray-400 mt-2">
          Start trading in just a few clicks. BinaryV makes trading simple,
          fast, and rewarding.
        </p>

        <div className="mt-12 flex flex-col md:flex-row justify-center -space-y-2 -space-x-2">
          {/* Step 1 */}

          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.6,
              ease: "easeOut",
              delay: 0.1,
            }}
            className="flex flex-col justify-center items-center w-full bg-dark border-6 border-r-transparent md:border-b-transparent rounded-l-lg md:rounded-t-lg h-50 p-2"
          >
            <div className="text-green-400 text-3xl font-bold mb-2">1</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Create Your Account
            </h3>
            <p className="text-sm text-gray-300">
              Sign up in seconds with your email or wallet. No KYC required to
              start trading.
            </p>
          </motion.div>

          {/* Step 2 */}

          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.6,
              ease: "easeOut",
              delay: 0.1,
            }}
            className="flex flex-col justify-center items-center w-full bg-dark border-6 border-l-transparent md:border-l-white md:border-t-transparent rounded-r-lg md:rounded-b-lg h-50 p-2"
          >
            <div className="text-green-400 text-3xl font-bold mb-2">2</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Place a Trade
            </h3>
            <p className="text-sm text-gray-300">
              Choose an asset, set your position (Up or Down), and select your
              expiry. It's that easy.
            </p>
          </motion.div>

          {/* Step 3 */}

          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.6,
              ease: "easeOut",
              delay: 0.1,
            }}
            className="flex flex-col justify-center items-center w-full bg-dark border-6 border-r-transparent md:border-r-white md:border-b-transparent rounded-l-lg md:rounded-t-lg h-50  p-2"
          >
            <div className="text-green-400 text-3xl font-bold mb-2">3</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Profit Instantly
            </h3>
            <p className="text-sm text-gray-300">
              If your prediction is correct, receive instant payouts up to 95% –
              no delays, no complications.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Backers Section */}
      <section className="text-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-green to-green-700 text-transparent bg-clip-text">
          Backers
        </h2>
        <p className="text-gray-400 mt-2">
          Cyclos has backing from top tier strategic investors in the Solana
          Ecosystem
        </p>

        <motion.div
          ref={refBackers}
          initial={{ opacity: 0, y: 10 }}
          animate={inViewBackers ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.3,
            ease: "easeOut",
            delay: 0.1,
          }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          {backers.map((backer, idx) => (
            <div
              key={idx}
              className="w-40 h-20 bg-[#1e1e1e] flex items-center justify-center rounded-md text-sm text-gray-300 text-center px-2 hover:scale-110 duration-300"
            >
              {backer}
            </div>
          ))}
        </motion.div>
      </section>
    </div>
  );
};

export default Roadmap;
