import React from "react";
import {
  FaChartLine,
  FaExchangeAlt,
  FaWallet,
  FaHistory,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaUsers,
} from "react-icons/fa";
import { BiSupport } from "react-icons/bi";
import { Link, NavLink, useNavigate } from "react-router-dom";
import assets from "../../assets/assets";
import { logoutUser } from "../../services/authServices";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const sidebarItems = [
  { name: "Profile", icon: <FaUser />, link: "profile" },
  { name: "Markets", icon: <FaChartLine />, link: "markets" },
  { name: "Trade", icon: <FaExchangeAlt />, link: "trade" },
  { name: "Portfolio", icon: <FaWallet />, link: "portfolio/deposit" },
  { name: "Transactions", icon: <FaHistory />, link: "portfolio/transactions" },
  { name: "Referral Program", icon: <FaUsers />, link: "referral" },
  { name: "Settings", icon: <FaCog />, link: "settings" },
  { name: "Support", icon: <BiSupport />, link: "support" },
];

const DashboardSidebar = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  // Logout user function
  const handleLogout = async () => {
    try {
      const res = await logoutUser();
      toast.success(res?.message);
      setUser(null);
      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error(error);
    }
  };
  
  return (
    <aside className="w-16 sm:w-20 group hover:w-50 h-screen bg-gray-800 border-r shadow-2xl border-gray-200 text-white sm:flex flex-col p-4 duration-200">
      {/* Logo + Title */}
      <div className="flex items-center gap-2 mb-8">
        <Link
          to={"/"}
          className="w-8 h-8 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0"
        >
          <img
            className="w-10 h-10 object-contain rounded-full"
            src={assets.logo}
            alt="Logo"
          />
        </Link>
        <h2 className="text-2xl font-bold text-green opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          BinaryV
        </h2>
      </div>

      {/* Sidebar nav items */}
      <nav className="flex flex-col gap-4 flex-1">
        {sidebarItems.map((item) => (
          <NavLink
            key={item.link}
            to={item.link}
            className={({ isActive }) =>
              `flex relative items-center gap-3 pr-10 py-2 rounded-r-lg ${
                isActive ? "bg-gray-800" : "bg-transparent"
              } hover:bg-gray-700 transition duration-200`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute w-1 h-[80%] bg-green rounded-r-md"></span>
                )}
                <span
                  className={`text-xl sm:text-2xl ml-2 flex-shrink-0 ${
                    isActive ? "text-green" : ""
                  }`}
                >
                  {item.icon}
                </span>
                {/* ✅ Fade in/out only text */}
                <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  {item.name}
                </span>
              </>
            )}
          </NavLink>
        ))}

        {/* Logout Button */}
        <NavLink
          key={"logout"}
          to={"#"}
          onClick={handleLogout}
          className={({ isActive }) =>
            `flex relative items-center gap-3 pr-10 py-2 rounded-r-lg ${
              isActive ? "bg-gray-800" : "bg-transparent"
            } hover:bg-gray-700 transition duration-200`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute w-1 h-[80%] bg-green rounded-r-md"></span>
              )}
              <span
                className={`text-2xl ml-2 flex-shrink-0 ${
                  isActive ? "text-green" : ""
                }`}
              >
                {<FaSignOutAlt />}
              </span>
              {/* ✅ Fade in/out only text */}
              <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                {"Logout"}
              </span>
            </>
          )}
        </NavLink>
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
