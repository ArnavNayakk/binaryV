// components/Stairs.jsx
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const Stairs = ({ children }) => {
  const currentPath = useLocation().pathname;
  const stairParentRef = useRef(null);
  const pageRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline();

    // Show overlay
    tl.set(stairParentRef.current, { autoAlpha: 1 });

    // Animate stairs
    tl.from(".stair", { height: 0, stagger: { amount: -0.2 } });
    tl.to(".stair", { y: "100%", stagger: { amount: -0.25 } });

    // Hide overlay
    tl.to(stairParentRef.current, { autoAlpha: 0 });

    // Fade in page content
    gsap.from(pageRef.current, {
      opacity: 0,
      delay: 1.3,
      duration: 0.8,
      ease: "power2.out",
    });

    // Cleanup
    return () => {
      tl.kill();
      gsap.set(stairParentRef.current, { clearProps: "all" });
      gsap.set(pageRef.current, { clearProps: "all" });
    };
  }, [currentPath]);

  return (
    <div className="relative">
      {/* Loader overlay */}
      <div
        ref={stairParentRef}
        className="h-screen w-full fixed inset-0 z-20 overflow-hidden pointer-events-none"
      >
        <div className="h-full w-full flex">
          <div className="stair flex-1 bg-white"></div>
          <div className="stair flex-1 bg-white"></div>
          <div className="stair flex-1 bg-white"></div>
          <div className="stair flex-1 bg-white"></div>
          <div className="stair flex-1 bg-white"></div>
        </div>
      </div>

      {/* Page content */}
      <div ref={pageRef}>{children}</div>
    </div>
  );
};

export default Stairs;
