import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Popup = () => {
  const [show, setShow] = useState(false);
  useEffect;
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;
  return (
    <section className="fixed inset-0 bg-black/10 flex justify-center items-center backdrop-blur-sm z-99 text-white" style={{animation:"fadeIn 0.3s ease-in"}}>
      <div className="relative w-11/12 max-w-md p-6 py-10 flex flex-col justify-center items-center bg-gradient-to-r from-green to-green-700 rounded-xl" style={{animation:"popUp 0.4s ease"}}>
        <div className="absolute top-0 left-0 border -rotate-6 rounded-xl w-full h-full z-[-1]"></div>

        <button
          onClick={() => setShow(false)}
          className="absolute top-4 right-4 text-xl cursor-pointer"
        >
          ✕
        </button>

        <div className="text-3xl mb-3">👋 Trader</div>

        <h2 className="text-xl font-semibold mb-2">Join BinaryV Today!</h2>

        <p className=" text-sm mb-6 px-2">
          Sign up now to start trading and get exclusive insights.
        </p>

        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => navigate("/register")}
            className="bg-gradient-to-r from-gray-500 to-gray-800 text-white px-6 py-2 rounded-full font-medium hover:bg-gray-800 transition cursor-pointer"
          >
            Sign up
          </button>
          <button
            onClick={() => setShow(false)}
            className="transition cursor-pointer"
          >
            Next time
          </button>
        </div>
      </div>
      {/* Animations */}
      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes popUp {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        `}
      </style>
    </section>
  );
};

export default Popup;
