import React, { useState } from "react";
import toast from "react-hot-toast";

const CookieSettings = () => {
  const [cookies, setCookies] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  const handleToggle = (key) => {
    // Prevent toggling "necessary" cookies off
    if (key === "necessary") return;
    setCookies((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    localStorage.setItem("binaryv_cookie_prefs", JSON.stringify(cookies));
    toast.success("Your cookie preferences have been saved");
  };

  return (
    <div className="min-h-screen bg-[#0a0f0a] text-gray-200 flex flex-col items-center py-12 px-4 sm:px-8">
      <div className="max-w-3xl w-full">
        <h1 className="text-4xl font-bold text-green-400 mb-6 text-center">
          Cookie Settings
        </h1>
        <p className="text-gray-400 text-center mb-10">
          Manage your cookie preferences for BinaryV. You can adjust your
          consent settings anytime.
        </p>

        <div className="bg-[#0f1610] rounded-2xl p-8 shadow-lg border border-green-800/30">
          {/* Cookie Options */}
          <div className="space-y-6">
            {/* Necessary */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-green-300">
                  Necessary Cookies
                </h2>
                <p className="text-gray-400 text-sm">
                  These cookies are essential for the website to function
                  properly and cannot be turned off.
                </p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={cookies.necessary}
                  disabled
                  className="cursor-not-allowed accent-green-500 w-5 h-5"
                />
              </div>
            </div>

            {/* Analytics */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-green-300">
                  Analytics Cookies
                </h2>
                <p className="text-gray-400 text-sm">
                  Help us understand how visitors interact with our platform to
                  improve performance.
                </p>
              </div>
              <div>
                <input
                  type="checkbox"
                  checked={cookies.analytics}
                  onChange={() => handleToggle("analytics")}
                  className="accent-green-500 w-5 h-5 cursor-pointer"
                />
              </div>
            </div>

            {/* Marketing */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-green-300">
                  Marketing Cookies
                </h2>
                <p className="text-gray-400 text-sm">
                  Used to deliver personalized ads and measure ad campaign
                  effectiveness.
                </p>
              </div>
              <div>
                <input
                  type="checkbox"
                  checked={cookies.marketing}
                  onChange={() => handleToggle("marketing")}
                  className="accent-green-500 w-5 h-5 cursor-pointer"
                />
              </div>
            </div>

            {/* Preferences */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-green-300">
                  Preference Cookies
                </h2>
                <p className="text-gray-400 text-sm">
                  Remember your language, theme, and display preferences to
                  enhance your experience.
                </p>
              </div>
              <div>
                <input
                  type="checkbox"
                  checked={cookies.preferences}
                  onChange={() => handleToggle("preferences")}
                  className="accent-green-500 w-5 h-5 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="my-8 border-t border-green-800/40" />

          {/* Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={handleSave}
              className="bg-green-500 hover:bg-green-600 transition text-white font-semibold py-2 px-6 rounded-lg"
            >
              Save Preferences
            </button>
            <button
              onClick={() =>
                setCookies({
                  necessary: true,
                  analytics: true,
                  marketing: true,
                  preferences: true,
                })
              }
              className="border border-green-500 text-green-400 hover:bg-green-500/10 transition font-semibold py-2 px-6 rounded-lg"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieSettings;
