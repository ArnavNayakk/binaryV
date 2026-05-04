import React from "react";
import { FaWallet, FaArrowDown, FaArrowUp } from "react-icons/fa";
import { MdSavings } from "react-icons/md";
import { BiDollar } from "react-icons/bi";
import { useAuth } from "../../context/AuthContext";

const iconMap = {
  wallet: <FaWallet size={20} />,
  income: <BiDollar size={20} />,
  savings: <MdSavings size={20} />,
  expenses: <FaArrowDown size={20} />,
};

const StatsCard = () => {
  const { user } = useAuth();
  const statsData = [
    {
      id: 1,
      title: "Total Balance",
      amount: user?.totalBalance || 0,
      currency: "USD",
      icon: "wallet",
      change: "+1.29%",
      changeType: "positive",
    },
    {
      id: 2,
      title: "Total Income",
      amount: user?.totalIncome || 0,
      currency: "USD",
      icon: "income",
      change: "-1.29%",
      changeType: "negative",
    },
    {
      id: 3,
      title: "Total Savings",
      amount: user?.totalSaving || 0,
      currency: "USD",
      icon: "savings",
      change: "+1.29%",
      changeType: "positive",
    },
    {
      id: 4,
      title: "Total Expenses",
      amount: user?.totalExpenses || 0,
      currency: "USD",
      icon: "expenses",
      change: "-1.29%",
      changeType: "negative",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {statsData.map((stat) => (
        <div
          key={stat.id}
          className="stat-metal-panel rounded-2xl px-4 py-6 flex flex-col gap-3 w-full h-full max-w-sm mx-auto"
        >
          {/* Icon */}
          <div className="w-10 h-10 flex items-center justify-center rounded-lg shadow-md shadow-green-500/30 bg-slate-950/70 text-green-400 border border-white/8">
            {iconMap[stat.icon]}
          </div>

          {/* Title + Amount */}
          <p className="text-gray-400 text-sm">{stat.title}</p>
          <div className="flex justify-between items-center">
            <h2 className="text-xs lg:text-sm font-semibold text-white font-space-grotesk">
              ${stat.amount}
            </h2>

            {/* Change */}
            <p
              className={`text-xs font-medium rounded-2xl px-1 py-1 ${
                stat.changeType === "positive"
                  ? "text-green bg-green-100/10"
                  : "text-red-500 bg-red-100/10"
              }`}
            >
              {stat.change}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCard;
