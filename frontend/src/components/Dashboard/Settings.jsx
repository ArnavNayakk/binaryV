import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { updateProfile } from "../../services/userServices";
import { setWithExpiry } from "../../helper/storageWithExpiry";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("Profile");
  const tabs = ["Profile", "Trading", "Notifications", "Security", "Referral","Appearance"];

  const { user, setUser, setIsLoading } = useAuth();
  const [formData, setFormData] = useState(null);

  const handleOnChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  const updateUserProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await updateProfile(formData);
      setUser(res?.user);
      setWithExpiry("user", res?.user, 24 * 60 * 60 * 1000);
      toast.success(res?.message);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Update Profile failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setFormData({
        image: user?.image || "",
        name: user?.name || "",
      });
    }
  }, [user]);

  const renderContent = () => {
    switch (activeTab) {
      case "Profile":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              Profile Settings
            </h2>
            <form
              onSubmit={updateUserProfile}
              className="bg-gray-800 p-5 rounded-xl space-y-4"
            >
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData?.name || user?.name}
                  onChange={handleOnChange}
                  placeholder="John Doe"
                  className="w-full p-2 rounded-md bg-gray-900 border border-gray-700 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Profile Image
                </label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleOnChange}
                  className="w-full p-2 rounded-md bg-gray-900 border border-gray-700 text-white"
                />
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-green to-green-700 hover:scale-105 cursor-pointer duration-300 px-4 py-2 rounded-lg text-white"
              >
                Save Changes
              </button>
            </form>
          </div>
        );

      case "Trading":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              Trading Preferences
            </h2>
            <div className="bg-gray-800 p-5 rounded-xl space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Default Chart Type
                </label>
                <select className="w-full p-2 rounded-md bg-gray-900 border border-gray-700 text-white">
                  <option>Candlestick</option>
                  <option>Line</option>
                  <option>Bar</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Default Time Frame
                </label>
                <select className="w-full p-2 rounded-md bg-gray-900 border border-gray-700 text-white">
                  <option>1 Minute</option>
                  <option>5 Minutes</option>
                  <option>1 Hour</option>
                  <option>1 Day</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="darkMode" className="accent-green" />
                <label htmlFor="darkMode" className="text-gray-300">
                  Enable Dark Mode
                </label>
              </div>
            </div>
          </div>
        );

      case "Notifications":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              Notification Preferences
            </h2>
            <div className="bg-gray-800 p-5 rounded-xl space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-gray-300">Trade Alerts</span>
                <input type="checkbox" className="accent-green" />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-gray-300">Deposit Updates</span>
                <input type="checkbox" className="accent-green" />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-gray-300">Referral Notifications</span>
                <input type="checkbox" className="accent-green" />
              </label>
            </div>
          </div>
        );

      case "Security":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              Security Settings
            </h2>
            <div className="bg-gray-800 p-5 rounded-xl space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  className="w-full p-2 rounded-md bg-gray-900 border border-gray-700 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  className="w-full p-2 rounded-md bg-gray-900 border border-gray-700 text-white"
                />
              </div>
              <button className="bg-gradient-to-r from-green to-green-700 hover:scale-105 cursor-pointer duration-300 px-4 py-2 rounded-lg text-white">
                Update Password
              </button>
            </div>
          </div>
        );

      case "Referral":
        return (
          <div className="space-y-4 w-full">
            <h2 className="text-xl font-semibold text-white">
              Referral Program
            </h2>
            <div className="bg-gray-800 p-5 rounded-xl space-y-4">
              <p className="text-gray-300">
                Invite your friends to BinaryV and earn rewards for each
                successful referral.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 items-start">
                <input
                  type="text"
                  readOnly
                  value={`https://www.binaryv.com/signup?ref=${user?.referralCode}`}
                  className="flex-1 p-2 rounded-md bg-gray-900 border border-gray-700 text-white"
                />
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(
                      `https://www.binaryv.com/signup?ref=${user?.referralCode}`
                    )
                  }
                  className="bg-gradient-to-r from-green to-green-700 hover:scale-105 cursor-pointer px-3 py-2 rounded-lg text-white"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        );

      case "Appearance":
        return (
          <div className="space-y-5">
            <h2 className="text-xl font-semibold text-green-400">Appearance</h2>
            <div className="bg-gray-800 p-5 rounded-xl  space-y-5">
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Theme Preference
                </label>
                <select className="w-full p-2 rounded-md bg-gray-900 text-white">
                  <option>Dark (Default)</option>
                  <option>Light</option>
                  <option>High Contrast</option>
                </select>
              </div>
              <button className="bg-gradient-to-r from-green to-green-700 cursor-pointer duration-300 hover:scale-105 transition px-4 py-2 rounded-lg text-white font-medium">
                Apply Theme
              </button>
            </div>
          </div>
        ); 

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6">
      <div className="mx-auto">
        <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === tab
                  ? "bg-gradient-to-r from-green to-green-700 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <hr className="text-green" />

        {/* Tab Content */}
        <div className="mt-4 xl:w-2/3">{renderContent()}</div>
      </div>
    </div>
  );
};

export default Settings;

// import React, { useState } from "react";

// const Settings = () => {
//   const [activeTab, setActiveTab] = useState("Profile");

//   const tabs = [
//     "Profile",
//     "Trading",
//     "Notifications",
//     "Security",
//     "Billing",
//     "Appearance",
//   ];

//   const renderContent = () => {
//     switch (activeTab) {
//       case "Profile":
//         return (
//           <div className="space-y-5">
//             <h2 className="text-xl font-semibold text-green-400">
//               Profile Settings
//             </h2>
//             <div className="bg-[#101b13] p-5 rounded-xl border border-green-800 space-y-4">
//               <div>
//                 <label className="block text-sm text-gray-300 mb-1">
//                   Full Name
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="John Doe"
//                   className="w-full p-2 rounded-md bg-black/40 border border-green-800 text-white"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm text-gray-300 mb-1">
//                   Email
//                 </label>
//                 <input
//                   type="email"
//                   placeholder="john@example.com"
//                   className="w-full p-2 rounded-md bg-black/40 border border-green-800 text-white"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm text-gray-300 mb-1">
//                   Phone Number
//                 </label>
//                 <input
//                   type="tel"
//                   placeholder="+91 98765 43210"
//                   className="w-full p-2 rounded-md bg-black/40 border border-green-800 text-white"
//                 />
//               </div>
//               <button className="bg-green-600 hover:bg-green-700 transition px-4 py-2 rounded-lg text-white font-medium">
//                 Save Profile
//               </button>
//             </div>
//           </div>
//         );

//       case "Trading":
//         return (
//           <div className="space-y-5">
//             <h2 className="text-xl font-semibold text-green-400">
//               Trading Preferences
//             </h2>
//             <div className="bg-[#101b13] p-5 rounded-xl border border-green-800 space-y-4">
//               <div>
//                 <label className="block text-sm text-gray-300 mb-1">
//                   Default Asset Pair
//                 </label>
//                 <select className="w-full p-2 rounded-md bg-black/40 border border-green-800 text-white">
//                   <option>BTC / USD</option>
//                   <option>ETH / USD</option>
//                   <option>BNB / USDT</option>
//                   <option>EUR / USD</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm text-gray-300 mb-1">
//                   Auto Close Trade Timer
//                 </label>
//                 <select className="w-full p-2 rounded-md bg-black/40 border border-green-800 text-white">
//                   <option>30 Seconds</option>
//                   <option>1 Minute</option>
//                   <option>5 Minutes</option>
//                   <option>Custom</option>
//                 </select>
//               </div>
//               <div className="flex items-center gap-2">
//                 <input
//                   type="checkbox"
//                   id="oneClick"
//                   className="accent-green-500"
//                 />
//                 <label htmlFor="oneClick" className="text-gray-300">
//                   Enable One-Click Trading
//                 </label>
//               </div>
//             </div>
//           </div>
//         );

//       case "Notifications":
//         return (
//           <div className="space-y-5">
//             <h2 className="text-xl font-semibold text-green-400">
//               Notifications
//             </h2>
//             <div className="bg-[#101b13] p-5 rounded-xl border border-green-800 space-y-3">
//               {[
//                 "Trade Executed",
//                 "Deposit Confirmation",
//                 "Withdrawal Processed",
//                 "Referral Bonus Earned",
//               ].map((label) => (
//                 <label
//                   key={label}
//                   className="flex items-center justify-between text-gray-300"
//                 >
//                   <span>{label}</span>
//                   <input type="checkbox" className="accent-green-500" />
//                 </label>
//               ))}
//             </div>
//           </div>
//         );

//       case "Security":
//         return (
//           <div className="space-y-5">
//             <h2 className="text-xl font-semibold text-green-400">
//               Security Settings
//             </h2>
//             <div className="bg-[#101b13] p-5 rounded-xl border border-green-800 space-y-5">
//               <div>
//                 <label className="block text-sm text-gray-300 mb-1">
//                   Current Password
//                 </label>
//                 <input
//                   type="password"
//                   className="w-full p-2 rounded-md bg-black/40 border border-green-800 text-white"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm text-gray-300 mb-1">
//                   New Password
//                 </label>
//                 <input
//                   type="password"
//                   className="w-full p-2 rounded-md bg-black/40 border border-green-800 text-white"
//                 />
//               </div>
//               <div className="flex items-center gap-2">
//                 <input type="checkbox" id="2fa" className="accent-green-500" />
//                 <label htmlFor="2fa" className="text-gray-300">
//                   Enable Two-Factor Authentication (2FA)
//                 </label>
//               </div>
//               <button className="bg-green-600 hover:bg-green-700 transition px-4 py-2 rounded-lg text-white font-medium">
//                 Update Security
//               </button>
//             </div>
//           </div>
//         );

//       case "Billing":
//         return (
//           <div className="space-y-5">
//             <h2 className="text-xl font-semibold text-green-400">
//               Billing & Subscription
//             </h2>
//             <div className="bg-[#101b13] p-5 rounded-xl border border-green-800 space-y-4">
//               <p className="text-gray-300">
//                 You are currently on the{" "}
//                 <span className="text-green-400">Pro Plan</span>.
//               </p>
//               <p className="text-gray-400">Next renewal: 15 Nov 2025</p>
//               <button className="bg-green-600 hover:bg-green-700 transition px-4 py-2 rounded-lg text-white font-medium">
//                 Manage Subscription
//               </button>
//             </div>
//           </div>
//         );

//       case "Appearance":
        // return (
        //   <div className="space-y-5">
        //     <h2 className="text-xl font-semibold text-green-400">Appearance</h2>
        //     <div className="bg-[#101b13] p-5 rounded-xl border border-green-800 space-y-5">
        //       <div>
        //         <label className="block text-sm text-gray-300 mb-1">
        //           Theme Preference
        //         </label>
        //         <select className="w-full p-2 rounded-md bg-black/40 border border-green-800 text-white">
        //           <option>Dark (Default)</option>
        //           <option>Light</option>
        //           <option>High Contrast</option>
        //         </select>
        //       </div>
        //       <div className="flex items-center gap-2">
        //         <input
        //           type="checkbox"
        //           id="animations"
        //           className="accent-green-500"
        //         />
        //         <label htmlFor="animations" className="text-gray-300">
        //           Enable Animations
        //         </label>
        //       </div>
        //       <button className="bg-green-600 hover:bg-green-700 transition px-4 py-2 rounded-lg text-white font-medium">
        //         Apply Theme
        //       </button>
        //     </div>
        //   </div>
        // );

//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-black to-[#0d1912] text-white p-6">
//       <div className="max-w-5xl mx-auto">
//         <h1 className="text-3xl font-bold mb-8 text-green-400">⚙️ Settings</h1>

//         {/* Tabs */}
//         <div className="flex flex-wrap gap-2 mb-6 border-b border-green-900 pb-3">
//           {tabs.map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`px-4 py-2 rounded-lg font-medium transition ${
//                 activeTab === tab
//                   ? "bg-green-600 text-white"
//                   : "bg-[#0e1a13] text-gray-400 hover:text-green-400 hover:bg-[#122017]"
//               }`}
//             >
//               {tab}
//             </button>
//           ))}
//         </div>

//         {/* Content */}
//         <div className="animate-fadeIn">{renderContent()}</div>
//       </div>
//     </div>
//   );
// };

// export default Settings;
