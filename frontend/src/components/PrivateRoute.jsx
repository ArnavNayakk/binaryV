import React, { useEffect } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader/Loader";
import gsap from "gsap";

const PrivateRoute = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="w-full h-screen flex justify-center items-center bg-transparent">
        <Loader />
      </div>
    );
  }
  return !user || user === null ? <Navigate to={"/login"} /> : <Outlet />;
};

export default PrivateRoute;
