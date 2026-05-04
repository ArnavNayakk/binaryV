// import React, { lazy, useEffect, useRef } from "react";
// import { gsap } from "gsap";
// import { useNavigate } from "react-router-dom";
// import assets from "../../assets/assets";

// const PlanetSection = lazy(() => import("../Home/Planet"));

// const HeroSection = () => {
//   const navigate = useNavigate();
//   const headingRef = useRef(null);

//   useEffect(() => {
//     const chars = headingRef.current.querySelectorAll("span");

//     gsap.fromTo(
//       chars,
//       { opacity: 0, y: 30 },
//       {
//         opacity: 1,
//         y: 0,
//         stagger: 0.05,
//         ease: "power3.out",
//         duration: 0.5,
//         delay: 2,
//       }
//     );
//   }, []);

//   const headingText = "Trade\nSmarter,\nProfit Faster";

//   return (
//     <div className="relative w-full flex flex-col-reverse lg:flex-row justify-center h-screen  pt-12 bg-dark">
//       <video
//         className="hidden sm:block absolute top-0 left-0 w-full h-full object-cover bg-no-repeat opacity-25"
//         autoPlay
//         loop
//         muted
//         preload="none"
//       >
//         <source src={assets?.hero_animation} type="video/mp4" />
//         Your browser does not support the video tag.
//       </video>

//       <div className="relative w-full lg:w-1/2 py-6 mb-10  flex flex-col gap-2 md:gap-5 justify-center px-6 sm:px-10 md:px-12 lg:px-20 xl:px-25">
//         <h1
//           ref={headingRef}
//           className="text-white text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-gideon-roman"
//         >
//           {headingText.split("").map((char, i) =>
//             char === "\n" ? (
//               <br key={i} />
//             ) : (
//               <span key={i} className="lg:inline-block">
//                 {char === " " ? "\u00A0" : char}
//               </span>
//             )
//           )}
//         </h1>
//         <p className="text-[#B8BCC2] text-sm lg:text-xl w-full">
//           Step into the world of binary options with real-time data, powerful
//           tools, and lighting-fast execution. Your future, one decision away.
//         </p>

//         <button
//           onClick={() => navigate("/login")}
//           className="bg-gradient-to-r z-10 from-green to-green-700 rounded text-lg text-white  w-44 h-12 lg:h-14 lg:w-66 font-semibold cursor-pointer hover:bg-green/90"
//         >
//           Get Started Free
//         </button>
//       </div>

//       <PlanetSection />
//     </div>
//   );
// };

// export default HeroSection;

import React, { lazy, useEffect, useRef, memo } from "react";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import assets from "../../assets/assets";

const PlanetSection = lazy(() => import("../Home/Planet"));

// Memoize PlanetSection to avoid re-renders
const MemoPlanetSection = memo(PlanetSection);

const HeroSection = () => {
  const navigate = useNavigate();
  const headingRef = useRef(null);

  useEffect(() => {
    const chars = headingRef.current.querySelectorAll("span");
    // Animate letters once on mount
    gsap.fromTo(
      chars,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.05,
        ease: "power3.out",
        duration: 0.5,
        delay: 2,
      }
    );
  }, []);

  const headingText = "Trade\nSmarter,\nProfit Faster";

  return (
    <div className="relative w-full flex flex-col-reverse lg:flex-row justify-center h-screen pt-12 bg-dark">
      {/* Background video with opacity */}
      <video
        className="hidden sm:block absolute top-0 left-0 w-full h-full object-cover bg-no-repeat opacity-25"
        autoPlay
        loop
        muted
        preload="none"
      >
        <source src={assets?.hero_animation} type="video/mp4" />
      </video>

      <div className="relative w-full lg:w-1/2 py-6 mb-10 flex flex-col gap-2 md:gap-5 justify-center px-6 sm:px-10 md:px-12 lg:px-20 xl:px-25">
        <h1
          ref={headingRef}
          className="text-white text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-gideon-roman"
        >
          {headingText.split("").map((char, i) =>
            char === "\n" ? (
              <br key={i} />
            ) : (
              <span key={i} className="lg:inline-block">
                {char === " " ? "\u00A0" : char}
              </span>
            )
          )}
        </h1>
        <p className="text-[#B8BCC2] text-sm lg:text-xl w-full">
          Step into the world of binary options with real-time data, powerful
          tools, and lightning-fast execution. Your future, one decision away.
        </p>

        <button
          onClick={() => navigate("/login")}
          className="bg-gradient-to-r from-green to-green-700 hover:scale-102 duration-300 rounded text-lg text-white w-44 h-12 lg:h-14 lg:w-66 font-semibold cursor-pointer hover:bg-green/90"
        >
          Get Started Free
        </button>
      </div>

      {/* Lazy PlanetSection */}
      <MemoPlanetSection />
    </div>
  );
};

export default memo(HeroSection);
