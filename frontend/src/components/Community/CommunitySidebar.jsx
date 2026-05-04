import React, { useState } from "react";
import {
  LayoutDashboard,
  BarChart3,
  Table2,
  Layers,
  Users,
  Shield,
  FileWarning,
  BookOpen,
  ChevronRight,
  X,
  LogOut,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosClient";

const CommunitySidebar = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openSubDropdown, setOpenSubDropdown] = useState(null);

  const location = useLocation();

  const toggleDropdown = (id) =>
    setOpenDropdown((prev) => (prev === id ? null : id));

  const toggleSubDropdown = (id) =>
    setOpenSubDropdown((prev) => (prev === id ? null : id));

  const isActivePath = (path) => location.pathname.startsWith(path);

  const handleLogout = async () => {
    try {
      const { data } = await api.post("/api/employe-auth/logout");
      console.log(data);
      if (data.success) {
        localStorage.removeItem("admin");
        setUser(null);
        toast.success("User Logged out successfully.");
        navigate("/");
      }
    } catch (error) {
      console.log("Logout Error: ", error);
      toast.error(error?.response?.data?.message || "Logout failed.");
    }
  };

  const menuItems = [
    // {
    //   id: "home",
    //   label: "Home",
    //   icon: LayoutDashboard,
    //   path: "/community/home",
    // },

    {
      id: "yourCommunity",
      label: "Your Communities",
      icon: Users,
      path: "/resources/community",
    },

    // {
    //   id: "signals",
    //   label: "Signals",
    //   icon: BarChart3,
    //   hasDropdown: true,
    //   subItems: [
    //     {
    //       id: "forexSignals",
    //       label: "Forex Signals",
    //       path: "/community/signals/forex",
    //     },
    //     {
    //       id: "cryptoSignals",
    //       label: "Crypto Signals",
    //       path: "/community/signals/crypto",
    //     },
    //     {
    //       id: "indicesSignals",
    //       label: "Indices Signals",
    //       path: "/community/signals/indices",
    //     },
    //     {
    //       id: "commoditySignals",
    //       label: "Commodity Signals",
    //       path: "/community/signals/commodities",
    //     },
    //     {
    //       id: "premiumSignals",
    //       label: "Premium Signals",
    //       path: "/community/signals/premium",
    //     },
    //   ],
    // },

    {
      id: "tradingRooms",
      label: "Trading Rooms",
      icon: Layers,
      path: "co",
      hasDropdown: false,
      subItems: [
        {
          id: "liveChat",
          label: "Live Chat Room",
          path: "rooms/live",
        },
        {
          id: "scalpingRoom",
          label: "Scalping Room",
          path: "rooms/scalping",
        },
        {
          id: "swingRoom",
          label: "Swing Trading Room",
          path: "rooms/swing",
        },
        {
          id: "copyTrading",
          label: "Copy Trading Room",
          path: "rooms/copy-trading",
        },
        {
          id: "botTrading",
          label: "Bot Trading Room",
          path: "rooms/bot",
        },
      ],
    },

    // {
    //   id: "strategyHub",
    //   label: "Strategy Hub",
    //   icon: Layers,
    //   hasDropdown: true,
    //   subItems: [
    //     {
    //       id: "communityStrategies",
    //       label: "Community Strategies",
    //       path: "/community/strategies",
    //     },
    //     {
    //       id: "indicatorStrategies",
    //       label: "Indicator Strategies",
    //       path: "/community/strategies/indicators",
    //     },
    //     {
    //       id: "backtested",
    //       label: "Backtested Strategies",
    //       path: "/community/strategies/backtested",
    //     },
    //     {
    //       id: "uploadStrategy",
    //       label: "Upload Your Strategy",
    //       path: "/community/strategies/upload",
    //     },
    //   ],
    // },

    // {
    //   id: "marketAnalysis",
    //   label: "Market Analysis",
    //   icon: BarChart3,
    //   hasDropdown: true,
    //   subItems: [
    //     {
    //       id: "technical",
    //       label: "Technical Analysis",
    //       path: "/community/analysis/technical",
    //     },
    //     {
    //       id: "fundamental",
    //       label: "Fundamental Analysis",
    //       path: "/community/analysis/fundamental",
    //     },
    //     { id: "news", label: "Market News", path: "/community/analysis/news" },
    //     {
    //       id: "economicCalendar",
    //       label: "Economic Calendar",
    //       path: "/community/analysis/calendar",
    //     },
    //   ],
    // },

    // {
    //   id: "tutorials",
    //   label: "Tutorials & Learning",
    //   icon: BookOpen,
    //   hasDropdown: true,
    //   subItems: [
    //     {
    //       id: "basics",
    //       label: "Trading Basics",
    //       path: "/community/tutorials/basics",
    //     },
    //     {
    //       id: "chartPatterns",
    //       label: "Chart Patterns",
    //       path: "/community/tutorials/chart-patterns",
    //     },
    //     {
    //       id: "indicatorsGuide",
    //       label: "Indicators Guide",
    //       path: "/community/tutorials/indicators",
    //     },
    //     {
    //       id: "riskManagement",
    //       label: "Risk Management",
    //       path: "/community/tutorials/risk",
    //     },
    //     {
    //       id: "fullCourses",
    //       label: "Full Courses",
    //       path: "/community/tutorials/courses",
    //     },
    //   ],
    // },

    {
      id: "forum",
      label: "Forum / Q&A",
      icon: Table2,
      hasDropdown: true,
      subItems: [
        {
          id: "beginnerForum",
          label: "Beginner Forum",
          path: "forum/beginners",
        },
        {
          id: "expertForum",
          label: "Expert Forum",
          path: "forum/experts",
        },
        {
          id: "strategyDiscussion",
          label: "Strategy Discussions",
          path: "forum/strategies",
        },
        {
          id: "indicatorDiscussion",
          label: "Indicator Tools",
          path: "forum/indicators",
        },
      ],
    },

    // {
    //   id: "leaderboard",
    //   label: "Leaderboard",
    //   icon: Shield,
    //   path: "/community/leaderboard",
    // },

    // {
    //   id: "competitions",
    //   label: "Competitions",
    //   icon: FileWarning,
    //   hasDropdown: true,
    //   subItems: [
    //     {
    //       id: "monthlyChallenge",
    //       label: "Monthly Challenge",
    //       path: "/community/competitions/monthly",
    //     },
    //     {
    //       id: "demoContest",
    //       label: "Demo Contest",
    //       path: "/community/competitions/demo",
    //     },
    //     {
    //       id: "referralContest",
    //       label: "Referral Contest",
    //       path: "/community/competitions/referral",
    //     },
    //   ],
    // },

    {
      id: "resources",
      label: "Resources",
      icon: Layers,
      hasDropdown: true,
      subItems: [
        {
          id: "indicators",
          label: "Indicators",
          path: "resources/indicators",
        },
        { id: "ebooks", label: "E-Books", path: "resources/ebooks" },
        {
          id: "journalTemplate",
          label: "Trading Journal",
          path: "resources/journal",
        },
        {
          id: "riskCalculator",
          label: "Risk Calculator",
          path: "resources/risk",
        },
        {
          id: "positionSize",
          label: "Position Size Calculator",
          path: "resources/position-size",
        },
      ],
    },

    {
      id: "notifications",
      label: "Notifications",
      icon: FileWarning,
      path: "notifications",
    },

    // {
    //   id: "profile",
    //   label: "My Profile",
    //   icon: Users,
    //   hasDropdown: true,
    //   subItems: [
    //     { id: "myProfile", label: "View Profile", path: "/community/profile" },
    //     {
    //       id: "savedPosts",
    //       label: "Saved Posts",
    //       path: "/community/profile/saved",
    //     },
    //     {
    //       id: "myStrategies",
    //       label: "My Strategies",
    //       path: "/community/profile/strategies",
    //     },
    //     {
    //       id: "settings",
    //       label: "Account Settings",
    //       path: "/community/profile/settings",
    //     },
    //   ],
    // },
  ];

  return (
    <aside
      className={`z-50 h-full bg-dark shadow-lg text-gray-200
  transform transition-transform duration-300 ease-in-out flex flex-col
  fixed top-16 left-0
  ${isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"}
  lg:static lg:translate-x-0 lg:w-64`}
    >
      <div
        onClick={() => setIsOpen(true)}
        className={`absolute top-12 md:top-18 -right-10 text-white lg:hidden ${
          isOpen ? "hidden" : ""
        }`}
      >
        <ChevronRight />
      </div>
      {/* HEADER PROFILE */}
      <div
        className={`${
          isOpen ? "flex" : "hidden"
        } items-center justify-between px-6 border-b border-slate-700 py-4 md:flex`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
            {user?.image
              ? user?.image
              : `${user?.name.split(" ")[0]?.charAt(0)}${user?.name
                  .split(" ")[1]
                  ?.charAt(0)}`}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{user?.name}</p>
            <p className="text-xs text-gray-400">Trader</p>
          </div>
        </div>

        {/* Close on mobile */}
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* MENU */}
      <nav
        className={`${
          isOpen ? "flex-1" : "hidden"
        } px-4 py-5 w-full overflow-y-auto space-y-1 md:flex flex-col`}
      >
        {menuItems.map((item) => (
          <div key={item.id}>
            {!item.hasDropdown ? (
              <NavLink
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full 
                  ${isActive ? "bg-green-700 text-white" : "hover:bg-white/10"}`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ) : (
              <>
                {/* DROPDOWN BUTTON */}
                <button
                  onClick={() => toggleDropdown(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all
                  ${
                    isActivePath(item.subItems?.[0]?.path)
                      ? "bg-blue-600 text-white"
                      : "hover:bg-white/10"
                  }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      openDropdown === item.id ? "rotate-90" : ""
                    }`}
                  />
                </button>

                {/* DROPDOWN LIST */}
                {openDropdown === item.id && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.subItems.map((sub) => (
                      <div key={sub.id}>
                        {!sub.hasDropdown ? (
                          <NavLink
                            to={sub.path}
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all
                              ${
                                isActive
                                  ? "text-white"
                                  : "text-gray-300 hover:bg-white/10"
                              }`
                            }
                          >
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                            {sub.label}
                          </NavLink>
                        ) : (
                          <>
                            {/* SUB-DROPDOWN */}
                            <button
                              onClick={() => toggleSubDropdown(sub.id)}
                              className="flex items-center justify-between w-full px-4 py-2 rounded-lg hover:bg-white/10 text-gray-300"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                <span className="text-sm">{sub.label}</span>
                              </div>
                              <ChevronRight
                                className={`w-4 h-4 transition-transform ${
                                  openSubDropdown === sub.id ? "rotate-90" : ""
                                }`}
                              />
                            </button>

                            {/* Sub Dropdown Items */}
                            {openSubDropdown === sub.id && (
                              <div className="ml-5 mt-1 space-y-1">
                                {sub.subItems.map((nested) => (
                                  <NavLink
                                    key={nested.id}
                                    to={nested.path}
                                    onClick={() => setIsOpen(false)}
                                    className={({ isActive }) =>
                                      `flex items-center gap-2 px-4 py-1.5 text-sm rounded-lg
                                      ${
                                        isActive
                                          ? "text-white"
                                          : "text-gray-400 hover:text-white hover:bg-white/10"
                                      }`
                                    }
                                  >
                                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                    {nested.label}
                                  </NavLink>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default CommunitySidebar;
