import React, { useEffect, useState, useCallback, memo } from "react";
import assets from "../../assets/assets";
import {
  FaBitcoin,
  FaEthereum,
  FaUser,
  FaPlus,
  FaArrowTrendUp,
} from "react-icons/fa6";
import { RiBnbFill } from "react-icons/ri";
import TradingCandleCard from "../TrustedSection/TradingCandleCard";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

const formatPrice = (price) =>
  typeof price === "number"
    ? price.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "--";

const CoinCard = memo(
  ({ icon, name, fullName, price, color, delay = 0, change, isLoading }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.4 }}
    transition={{ duration: 0.5, delay }}
    className="flex justify-between items-center rounded-[24px] border border-white/10 bg-white/6 backdrop-blur-xl hover:-translate-y-1 transition-all duration-300 p-4 w-full shadow-[0_24px_60px_rgba(3,8,20,0.28)]"
  >
    <div className="flex items-center space-x-3">
      <span
        className={`text-4xl ${color} flex h-14 w-14 items-center justify-center rounded-2xl bg-white/8`}
      >
        {icon}
      </span>
      <div>
        <p className="font-semibold text-white">{name}</p>
        <p className="text-sm text-slate-300">{fullName}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="font-bold text-lg text-white">
        {isLoading ? (
          <span className="inline-flex h-6 w-20 animate-pulse rounded-full bg-white/10" />
        ) : (
          `$${formatPrice(price)}`
        )}
      </p>
      <p className="mt-1 text-xs text-emerald-300">{change}</p>
    </div>
  </motion.div>
));

const TrustedSection = () => {
  const navigate = useNavigate();
  const [isPriceLoading, setIsPriceLoading] = useState(true);
  const [prices, setPrices] = useState({
    bitcoin: { usd: 113040.98 },
    ethereum: { usd: 4170.58 },
    binancecoin: { usd: 1014.07 },
  });

  const fetchPrices = useCallback(async () => {
    try {
      setIsPriceLoading(true);
      const { data } = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price",
        {
          params: {
            ids: "bitcoin,ethereum,binancecoin",
            vs_currencies: "usd",
          },
        }
      );
      setPrices((prev) => ({ ...prev, ...data }));
    } catch (err) {
      console.warn("Price update failed:", err.message);
    } finally {
      setIsPriceLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return (
    <section className="bg-dark text-white w-full px-6 md:px-16 py-12 flex flex-col gap-10">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto"
      >
        <p className="text-sm uppercase tracking-[0.35em] text-emerald-300/80 mb-3">
          Trusted by active traders
        </p>
        <h2 className="text-3xl md:text-5xl font-bold">
          Confidence, speed, and market focus in one trading stack
        </h2>
        <p className="mt-4 text-slate-300">
          Built for traders who want live pricing, fast execution, and a cleaner
          path from sign in to the market graph.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.9fr] gap-6">
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-4 shadow-[0_40px_120px_rgba(4,10,24,0.45)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.28),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_30%)]" />
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="relative rounded-[28px] w-full h-[350px] object-cover"
          >
            <source src={assets.trading_vedio} type="video/mp4" />
          </video>
          <div className="relative mt-5 flex flex-col gap-4 px-2 pb-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                Live workflow
              </p>
              <h3 className="mt-2 text-2xl font-semibold">
                Watch the market, then act without context switching
              </h3>
            </div>
            <button
              onClick={() => navigate("/dashboard/markets")}
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Open Market Graph
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,#0f172a_0%,#020617_100%)] p-6 shadow-[0_32px_90px_rgba(2,6,23,0.5)]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.18),transparent_45%)]" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-slate-400">
                Live crypto board
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-white">
                Market movers at a glance
              </h3>
            </div>
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-emerald-300">
              <FaArrowTrendUp className="text-2xl" />
            </div>
          </div>

          <div className="relative mt-6 flex flex-col gap-4">
            <div className="w-full">
              <CoinCard
                icon={<FaBitcoin />}
                name="BTC"
                fullName="Bitcoin"
                price={prices.bitcoin?.usd || 0}
                color="text-yellow-500"
                delay={0.1}
                change="+4.8% today"
                isLoading={isPriceLoading}
              />
            </div>
            <div className="w-[96%] self-end">
              <CoinCard
                icon={<FaEthereum />}
                name="ETH"
                fullName="Ethereum"
                price={prices.ethereum?.usd || 0}
                color="text-blue-500"
                delay={0.2}
                change="+2.1% momentum"
                isLoading={isPriceLoading}
              />
            </div>
            <div className="w-[92%] self-end">
              <CoinCard
                icon={<RiBnbFill />}
                name="BNB"
                fullName="Binance Coin"
                price={prices.binancecoin?.usd || 0}
                color="text-yellow-400"
                delay={0.3}
                change="+1.3% session"
                isLoading={isPriceLoading}
              />
            </div>
          </div>

          <div className="relative mt-6 grid grid-cols-3 gap-3">
            {[
              { value: "24/7", label: "Market pulse" },
              { value: "1 tap", label: "Route to graph" },
              { value: "0 lag", label: "Fast updates" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/8 bg-white/6 px-3 py-4 text-center"
              >
                <p className="text-xl font-semibold text-white">{stat.value}</p>
                <p className="mt-1 text-xs text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[28px] border border-emerald-400/20 bg-slate-950 h-[350px] p-6"
        >
          <div
            className="absolute inset-0 bg-center bg-no-repeat bg-cover opacity-35"
            style={{ backgroundImage: `url(${assets.card_2_bg})` }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(15,23,42,0.35),rgba(2,6,23,0.92))]" />
          <div className="relative flex h-full flex-col justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/80">
                Execution
              </p>
              <h3 className="mt-3 text-3xl font-semibold text-white">
                Enter the chart the moment you are ready
              </h3>
              <p className="mt-3 max-w-xs text-slate-300">
                Jump directly into the live market graph with the tools you need
                already in view.
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold text-white">03s</p>
                <p className="text-sm text-slate-400">Average flow to chart</p>
              </div>
              <button
                onClick={() => navigate("/dashboard/markets")}
                className="rounded-full bg-gradient-to-r from-emerald-400 to-green-500 px-6 py-3 font-bold text-slate-950 transition hover:scale-105"
              >
                Trade now
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative text-white h-[350px] p-6 rounded-[28px] shadow-md overflow-hidden border border-white/10"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${assets.card_3_bg})` }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.18),rgba(2,6,23,0.88))]" />
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex font-semibold items-center gap-2">
              <FaUser /> <span>Accounts</span>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                <p className="text-sm text-slate-200">Choose your pace</p>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {[
                    { label: "Trading", icon: assets.hero_img },
                    { label: "Demo", icon: assets.hero_img },
                    { label: "Join", plus: true },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl bg-black/20 p-3 text-center"
                    >
                      {item.plus ? (
                        <FaPlus
                          onClick={() => navigate("/login")}
                          className="text-4xl text-emerald-300 bg-white/80 p-2 rounded-full mx-auto shadow-md cursor-pointer"
                        />
                      ) : (
                        <img
                          src={item.icon}
                          alt={item.label}
                          loading="lazy"
                          className="w-10 h-10 rounded-full mx-auto"
                        />
                      )}
                      <p className="font-semibold mt-2">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <div className="flex justify-center -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <img
                      key={i}
                      src={assets.hero_img}
                      alt="Trusted member"
                      loading="lazy"
                      className="w-8 h-8 rounded-full"
                    />
                  ))}
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-400 p-1">
                    <div
                      className="w-6 h-6 border-2 border-green border-dotted border-t-transparent rounded-full animate-spin"
                      style={{ animationDuration: "15s" }}
                    />
                  </div>
                </div>
                <p className="text-sm mt-4 text-slate-200">
                  4M+ traders trust the platform across demo and live sessions.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <div>
                <p className="text-xl font-semibold">Unlimited demo</p>
                <p className="text-sm text-slate-300">Practice before live risk</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-300">24/7</p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  access
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-[linear-gradient(180deg,#f8fafc_0%,#e2e8f0_100%)] h-[350px] text-dark w-full rounded-[28px] shadow-md flex justify-center items-center border border-slate-200"
        >
          <TradingCandleCard />
        </motion.div>
      </div>
    </section>
  );
};

export default TrustedSection;
