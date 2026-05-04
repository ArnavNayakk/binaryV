import React, { useState } from "react";
import assets from "../../assets/assets";
import { MdOutlineMail, MdOutlineLock } from "react-icons/md";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { LoaderCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../services/authServices";
import { setWithExpiry } from "../../helper/storageWithExpiry";

const Login = () => {
  const { setUser } = useAuth();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await loginUser(formData);
      toast.success(res?.message);
      setUser(res?.user);
      setWithExpiry("user", res?.user, ONE_DAY);
      setWithExpiry("refreshToken", res?.refreshToken, ONE_DAY);
      navigate("/dashboard/markets");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.errors?.[0]?.msg ||
          "User login failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col md:flex-row relative bg-gradient-to-r from-[#0a0f14] via-transparent to-[#0a0f14]">
      <div className="relative md:w-1/2 hidden w-full h-full md:flex justify-start items-start bg-dark overflow-hidden">
        <img
          src={assets.login_hero_img}
          alt="Trading Illustration"
          className="w-full h-full object-contain mt-24"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f14] via-transparent to-[#0a0f14]" />
      </div>

      <div className="md:w-1/2 relative h-full w-full flex items-center justify-center px-6 py-4 bg-[#090e14] text-white">
        <div className="max-w-md pt-12 w-full">
          <h2 className="text-2xl font-semibold text-center mb-4">
            Welcome to Our Platform
          </h2>

          <div className="flex justify-center mb-4">
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="px-6 py-2 bg-gray-800 text-white rounded-l-lg cursor-pointer"
            >
              Register
            </button>
            <button
              type="button"
              className="px-6 py-2 bg-green-600 rounded-r-lg cursor-pointer"
            >
              Login
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="relative w-full">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleOnChange}
                autoComplete="email"
                required
                placeholder=" "
                className="peer w-full px-4 pl-8 pt-4 pb-2 rounded-lg border border-gray-700 text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <MdOutlineMail className="absolute top-4 text-gray-500 left-1 text-xl" />
              <label
                htmlFor="email"
                className="pointer-events-none peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 absolute left-8 top-2.5 text-gray-400 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-500 peer-focus:-top-3 bg-[#090e14] peer-focus:text-green-500"
              >
                Email
              </label>
            </div>

            <div className="relative w-full">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                id="password"
                value={formData.password}
                onChange={handleOnChange}
                autoComplete="current-password"
                required
                placeholder=" "
                className="peer w-full px-4 pl-8 pt-4 pb-2 rounded-lg border border-gray-700 text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {showPassword ? (
                <IoMdEye
                  onClick={() => setShowPassword(false)}
                  className="absolute top-4 text-gray-500 right-8 text-xl cursor-pointer"
                />
              ) : (
                <IoMdEyeOff
                  onClick={() => setShowPassword(true)}
                  className="absolute top-4 text-gray-500 right-8 text-xl cursor-pointer"
                />
              )}
              <MdOutlineLock className="absolute top-4 text-gray-500 left-1 text-xl" />

              <label
                htmlFor="password"
                className="pointer-events-none peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 absolute left-8 top-2.5 text-gray-400 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-500 peer-focus:-top-3 bg-[#090e14] peer-focus:text-green-500"
              >
                Password
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-70 disabled:cursor-not-allowed py-2 rounded-lg text-white font-semibold cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                "Login ->"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
