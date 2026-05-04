import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader/Loader";

const PublicRoute = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="w-full h-screen flex justify-center items-center bg-transparent">
        <Loader />
      </div>
    );
  }
  return user ? <Navigate to={"/dashboard/markets"} replace /> : <Outlet />;
};

export default PublicRoute;
