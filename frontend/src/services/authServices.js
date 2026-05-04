import api from "../api/axiosClient";

// User Register API
export const registerUser = async (data) => {
  const res = await api.post("/api/auth/register", data);
  return res.data;
};

// User Login API
export const loginUser = async (data) => {
  const res = await api.post("/api/auth/signin", data);
  // Cookies.set("accessToken", res.data?.accessToken);
  return res.data;
};

// User Logout function
export const logoutUser = async () => {
  const res = await api.post("/api/auth/signOut");
  localStorage.removeItem("user");
  localStorage.removeItem("refreshToken");
  return res.data;
};

// Verify-OTP API
export const verifyOtp = async (data) => {
  const res = await api.post("/api/auth/verifyemail", data);
  return res.data;
};

// Refresh access Token API
export const refreshAccessToken = async () => {
  const res = await api.get("/api/auth/refreshaccessToken");
  return res.data;
};
