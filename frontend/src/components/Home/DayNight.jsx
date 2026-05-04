import React, { useState, useEffect, useRef } from "react";
import assets from "../../assets/assets";

const DayNightVertical = () => {
  const containerRef = useRef(null);
  const nightImageRef = useRef(null);
  const titleRef = useRef(null);
  const textRef = useRef(null);
  const [defaultDay, setDefaultDay] = useState("Night");

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!containerRef.current) return;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          const rect = containerRef.current.getBoundingClientRect();
          const windowHeight = window.innerHeight;

          let progress = 0;
          if (rect.top <= 0 && rect.bottom >= windowHeight) {
            const totalScroll = rect.height - windowHeight;
            const scrolled = Math.min(Math.max(-rect.top, 0), totalScroll);
            progress = Math.min(Math.max(scrolled / totalScroll, 0), 1);
          } else if (rect.top > 0) {
            progress = 0;
          } else {
            progress = 1;
          }

          // GPU transform for Night layer
          if (nightImageRef.current) {
            nightImageRef.current.style.transform = `translate3d(0, ${
              100 - progress * 100
            }%, 0)`;
          }

          // Change text colors based on scroll progress
          if (titleRef.current) {
            const isNight = progress > 0.6;
            titleRef.current.style.color = isNight ? "#fff" : "#000";
            setDefaultDay(isNight ? "Night" : "Day");
          }

          if (textRef.current) {
            textRef.current.style.color =
              progress > 0.4 ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.7)";
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    // Use passive scroll listener for better performance
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section ref={containerRef} className="relative h-[200vh]">
      {/* Sticky viewport section */}
      <div className="sticky top-0 h-[100vh] w-full overflow-hidden will-change-transform">
        {/* Base Day image */}
        <img
          src={assets.Day}
          alt="Day Background"
          className="absolute top-0 left-0 w-full h-full object-cover select-none pointer-events-none"
        />

        {/* Night image (slides in) */}
        <img
          ref={nightImageRef}
          src={assets.Night}
          alt="Night Background"
          className="absolute top-0 left-0 w-full h-full object-cover will-change-transform select-none pointer-events-none"
          style={{
            transform: "translate3d(0,100%,0)",
          }}
        />

        {/* Foreground content */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:justify-between items-center h-full px-4 sm:px-12">
          <div className="max-w-lg pt-20 lg:pt-0">
            <h1
              ref={titleRef}
              className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold transition-colors duration-300 pt-20 lg:pt-10 font-gideon-roman"
            >
              Trade All {defaultDay}
            </h1>
            <p
              ref={textRef}
              className="mt-4 text-xl md:text-2xl transition-colors duration-300 font-gideon-roman"
            >
              Cryptocurrencies and our unique Synthetic Indices are available
              24/7.
            </p>
            <button className="mt-6 px-3 py-2 sm:px-6 sm:py-3 text-sm sm:text-xl bg-white border-2 border-green cursor-pointer text-green font-bold rounded-xl hover:bg-gradient-to-br from-green to-green-700 hover:text-white transition-colors duration-500">
              Open account
            </button>
          </div>

          <div className="pt-2">
            <img
              src={assets.day_night}
              alt="Man"
              className="object-bottom-right lg:object-contain h-[72vh] lg:h-[100vh] select-none pointer-events-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(DayNightVertical);
