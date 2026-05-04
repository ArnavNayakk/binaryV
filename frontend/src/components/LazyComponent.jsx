import Loader from "../components/Loader/Loader";
import React, { Suspense } from "react";
import { useInView } from "react-intersection-observer";

const LazyComponent = ({ Component, loader }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "100%",
  });

  return (
    <div ref={ref}>
      {inView && (
        <Suspense
          fallback={
            <div className="w-full h-full flex justify-center items-center">
              {loader || <Loader />}
            </div>
          }
        >
          <Component />
        </Suspense>
      )}
    </div>
  );
};

export default LazyComponent;
