import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import assets from "../../assets/assets"; // your images

gsap.registerPlugin(ScrollTrigger);

const tradingCards = [
  {
    title: "Live Data",
    description: "Monitor the markets in real-time for smarter decisions.",
    image: assets.live_data,
  },
  {
    title: "Instant Payouts",
    description: "Withdraw your profits quickly and securely, anytime.",
    image: assets.instant_payout,
  },
  {
    title: "Smart Tools",
    description: "Analyze trends and trade confidently with AI-powered tools.",
    image: assets.smart_tool,
  },
  {
    title: "Advanced Charts",
    description: "Visualize market trends with advanced charts.",
    image: assets.smart_charts,
  },
  {
    title: "Trading Resources",
    description: "Get notified of trading opportunities instantly.",
    image: assets.trading_resources,
  },
  {
    title: "Trade with App",
    description: "Download our app to start trading with you phone.",
    image: assets.download_app,
  },
];

export default function Scroll() {
  const containerRef = useRef(null);
  const textWrapperRef = useRef(null);
  const imageRef = useRef(null);
  const lastIndexRef = useRef(0);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const totalHeight =
        textWrapperRef.current.scrollHeight - window.innerHeight;

      // Ensure image starts visible
      gsap.set(imageRef.current, { autoAlpha: 1, scale: 1, force3D: true });

      // Scroll vertical for text
      gsap.to(textWrapperRef.current, {
        y: () => `-${totalHeight}px`,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: () => `+=${totalHeight}`,
          scrub: true,
          pin: true,
          onUpdate: (self) => {
            const index = Math.round(
              Math.min(Math.max(self.progress, 0), 1) *
                (tradingCards.length - 1)
            );

            if (index !== lastIndexRef.current) {
              lastIndexRef.current = index;

              if (imageRef.current) {
                // Fade old image out
                gsap.to(imageRef.current, {
                  autoAlpha: 0,
                  scale: 0.96,
                  duration: 0.18,
                  ease: "power1.in",
                  overwrite: "auto",
                  onComplete: () => {
                    // After fade-out, update image source
                    setActiveIndex(index);

                    // Then fade new image in
                    gsap.fromTo(
                      imageRef.current,
                      { autoAlpha: 0, scale: 0.96 },
                      {
                        autoAlpha: 1,
                        scale: 1,
                        duration: 0.45,
                        ease: "power2.out",
                        overwrite: "auto",
                      }
                    );
                  },
                });
              } else {
                setActiveIndex(index);
              }
            }
          },
        },
      });

      // Small screen text fade
      ScrollTrigger.matchMedia({
        "(max-width: 767px)": function () {
          tradingCards.forEach((_, i) => {
            const textEl = textWrapperRef.current.children[i];
            gsap.fromTo(
              textEl,
              { opacity: 1 },
              {
                opacity: 0,
                ease: "none",
                scrollTrigger: {
                  trigger: textEl,
                  start: "top 40%",
                  end: "center 50%",
                  scrub: true,
                },
              }
            );
          });
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full pt-10 h-screen bg-dark text-white flex flex-col sm:flex-row items-center sm:items-start overflow-hidden"
    >
      {/* <video
        className="hidden sm:block absolute top-0 left-0 w-full h-full object-cover bg-no-repeat opacity-20"
        muted
        loop
        autoPlay
      >
        <source src={assets?.hero_animation} type="video/mp4" />
      </video> */}
      {/* Left Side: Image */}
      <div className="flex w-full md:w-1/2 bg-transparent items-center justify-center top-0 pt-20 sm:pt-0 sticky h-screen pointer-events-none z-20">
        <img
          ref={imageRef}
          src={tradingCards[activeIndex].image}
          alt={tradingCards[activeIndex].title}
          className="w-[100%]  h-[90%] backdrop-blur pl-4  object-contain rounded-2xl will-change-transform will-change-opacity"
          loading="lazy"
        />
      </div>

      {/* Right Side: Text */}
      <div className="flex-1 z-10">
        <div ref={textWrapperRef} className="flex flex-col w-full">
          {tradingCards.map((card, idx) => (
            <div
              key={idx}
              className="min-h-screen flex flex-col items-center justify-center px-8 pb-20 text-center"
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                {card.title}
              </h2>
              <p className="text-lg text-gray-300">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
