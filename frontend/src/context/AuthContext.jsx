import { createContext, useState, useEffect, useContext, useMemo } from "react";
import { refreshAccessToken } from "../services/authServices";
import { getUser } from "../services/userServices";
import Cookies from "js-cookie";
import { connectSocket } from "../socket.js";
import { getWithExpiry } from "../helper/storageWithExpiry";

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(getWithExpiry("user"));

  // Refresh Access Token every 2 min
  const refreshToken = async () => {
    try {
      const res = await refreshAccessToken();
    } catch (err) {
      console.error("Refresh token error:", err.response?.data || err?.message);
    }
  };

  //  Fetch User Function
  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const savedUser = getWithExpiry("user");
      if (savedUser) {
        setUser(savedUser);
        return;
      }
      const res = await getUser();
      setUser(res?.user);
    } catch (error) {
      console.log(error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTokenCookie = getWithExpiry("refreshToken");

  // Check if user is logged in on mount
  useEffect(() => {
    // Return if there is no refreshToken
    if (!refreshTokenCookie) {
      return;
    }
    fetchUser();
  }, []);

  // Start refresh token loop when user exists
  useEffect(() => {
    refreshToken(); // Refresh immediately on login
    if (!refreshTokenCookie) {
      return;
    }

    // Socket connection
    if (user && user?.refreshToken) {
      connectSocket();
    }

    const interval = setInterval(refreshToken, 1.8 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  const value = useMemo(
    () => ({ user, setUser, isLoading, setIsLoading }),
    [user, isLoading]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
