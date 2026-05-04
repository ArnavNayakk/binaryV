import React, { useState } from "react";
import { LuUsers } from "react-icons/lu";
import { IoGiftOutline } from "react-icons/io5";
import { FiBarChart2 } from "react-icons/fi";
import { useAuth } from "../../../context/AuthContext";

const ReferralPage = () => {
  const user = {
    id: "u_123456",
    name: "Trader",
    referralCode: "ABC123",
    referralsCount: 3,
    earned: 42.5,
  };

  const recentReferrals = [
    {
      id: "r1",
      name: "Aman K.",
      email: "aman@example.com",
      date: "2025-09-12",
      status: "Converted",
      reward: 5,
    },
    {
      id: "r2",
      name: "Priya S.",
      email: "priya@example.com",
      date: "2025-08-23",
      status: "Converted",
      reward: 5,
    },
    {
      id: "r3",
      name: "Dev R.",
      email: "dev@example.com",
      date: "2025-07-11",
      status: "Pending",
      reward: 0,
    },
  ];

  const tiers = [
    {
      id: 1,
      name: "Bronze",
      requirement: "1+ referrals",
      reward: "$5 per referral",
    },
    {
      id: 2,
      name: "Silver",
      requirement: "5+ referrals",
      reward: "$7 per referral",
    },
    {
      id: 3,
      name: "Gold",
      requirement: "15+ referrals",
      reward: "$10 per referral",
    },
  ];

  const [copied, setCopied] = useState(false);

  // Copy referral code function
  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.log("Failed to copy", error);
    }
  };

  const handleShare = async () => {
    const link = `https://www.binaryv.com/signup?ref=${user.referralCode}`;
    const text = "Join BinaryV and get rewards for trading!";
    try {
      await navigator.share({
        title: "BinaryV Referral",
        text,
        url: link,
      });
    } catch (error) {
      console.log("Shared failed", error);
    }
  };

  const referralLink = `https://www.binaryv.com/signup?ref=${user.referralCode}`;
  const twitterShare = `https://twitter.com/intent/tweet?text=Join%20BinaryV%20and%20earn%20rewards!%20${encodeURIComponent(
    referralLink
  )}`;
  const telegramShare = `https://t.me/share/url?url=${encodeURIComponent(
    referralLink
  )}&text=Join%20BinaryV%20and%20earn%20rewards!`;

  return (
    <section className="w-full text-white px-6 py-4">
      {/* Header */}
      <section className="flex flex-col lg:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">
            Referral <span className="text-green">Program</span>
          </h2>
          <p className="text-md text-gray-300">
            Invite friends, earn trading credits and climb the referrals tiers.
          </p>
        </div>

        <div className="flex  justify-between gap-4">
          {/* Your code box */}
          <div className="bg-gradient-to-br from-gray-700 to-gray-900 py-2 px-4 rounded-lg">
            <p className="text-sm">Your code</p>
            <div className="flex justify-center items-center gap-2">
              <p className="text-xs sm:text-md font-semibold">
                {user?.referralCode}
              </p>
              <button
                onClick={() => handleCopy(user?.referralCode)}
                className="px-2 py-1 border-2 text-xs sm:text-md border-green rounded-md hover:bg-gradient-to-r from-green to-green-700 cursor-pointer duration-300"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          {/* Referrals and earnings */}
          <div className="text-right">
            <p className="sm:text-xl font-semibold">Referrals</p>
            <p className="sm:text-xl font-semibold">
              {user?.referralsCount || 0}
            </p>
            <div>
              <p className="text-xs sm:text-lg">
                Earned: <span className="">${user?.earned || 0}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main */}
      <section className="w-full grid grid-cols-1 lg:grid-cols-3 my-6 gap-6">
        {/* Left section */}
        <section className=" lg:col-span-2 bg-gradient-to-b from-gray-800 to-gray-900 p-6 rounded-lg">
          {/* How it works + Share */}
          <div className="flex w-full justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">How it works</h2>
              <p className="text-sm">
                Share your unique referral link. When someone signs up and
                completes qualifying trades, you get rewarded.
              </p>
            </div>
            {/* Share Buttons */}
            <div className="hidden sm:flex">
              <button
                onClick={handleShare}
                className="max-h-10 px-2 py-1 border-2 border-green rounded-lg md:text-xl hover:bg-gradient-to-r from-green to-green-700 hover:scale-105 duration-300 cursor-pointer"
              >
                Share
              </button>
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="w-full h-25 px-6 flex items-center gap-2 border-2 border-green  rounded-lg hover:shadow-lg shadow-green hover:-translate-y-1.5 duration-300">
              <LuUsers size={30} className="text-green" />
              <div>
                <h5 className="text-md">Total Invites</h5>
                <p className="text-md font-semibold">
                  {user?.referralsCount || 0}
                </p>
              </div>
            </div>

            <div className="flex items-center h-25 gap-2 border-2 border-green p-6 rounded-lg hover:shadow-lg shadow-green hover:-translate-y-1.5 duration-300">
              <IoGiftOutline size={30} className="text-green" />
              <div>
                <h5 className="text-md">Rewards Earned</h5>
                <p className="text-md font-semibold">$ {user?.earned || 0}</p>
              </div>
            </div>

            <div className="flex items-center h-25 gap-2 border-2 border-green p-6 rounded-lg hover:shadow-lg shadow-green hover:-translate-y-1.5 duration-300">
              <FiBarChart2 size={30} className="text-green" />
              <div>
                <h5 className="text-md">Conversion rate</h5>
                <p className="text-md font-semibold">30%</p>
              </div>
            </div>
          </div>

          {/* Invite Link */}
          <div className="mb-6">
            <h3 className="text-sm">Your invite link</h3>
            <div className="flex flex-col xl:flex-row gap-3 mt-2">
              <p className="text-xs overflow-auto sm:text-sm flex items-center border py-3 px-4 rounded-lg ">
                {`https://www.binaryv.com/signup?ref=${user?.referralCode}`}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleShare}
                  className=" px-3 py-2 border-2 border-green rounded-lg text-xl hover:bg-gradient-to-r from-green to-green-700 hover:scale-105 duration-300 cursor-pointer"
                >
                  Share
                </button>
                <button
                  onClick={() => window.open(telegramShare, "_blank")}
                  className="px-3 py-2 border-2 border-green rounded-lg text-xl hover:bg-gradient-to-r from-green to-green-700 hover:scale-105 duration-300 cursor-pointer"
                >
                  Telegram
                </button>
                <button
                  onClick={() => window.open(twitterShare, "_blank")}
                  className="px-3 py-2 border-2 border-green rounded-lg text-xl hover:bg-gradient-to-r from-green to-green-700 hover:scale-105 duration-300 cursor-pointer"
                >
                  Twitter
                </button>
              </div>
            </div>
          </div>

          {/* Referrals Section */}
          <div>
            <h2 className="text-lg">Recent referrals</h2>
            <div className="max-h-125 overflow-y-auto overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b sticky top-0 bg-gray-800">
                  <tr>
                    <th className="py-2">Name</th>
                    <th className="py-2">Email</th>
                    <th className="py-2">Date</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Reward</th>
                  </tr>
                </thead>
                <tbody className="">
                  {recentReferrals.map((ref) => (
                    <tr key={ref.id} className="border-b">
                      <td className="py-2">{ref?.name}</td>
                      <td className="py-2">{ref?.email}</td>
                      <td className="py-2">{ref?.date}</td>
                      <td
                        className={`py-2 ${
                          ref?.status === "Converted"
                            ? "text-green"
                            : "text-red-400"
                        }`}
                      >
                        {ref?.status}
                      </td>
                      <td className="py-2">
                        $ <span>{ref?.reward || 0}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Right section */}
        <aside className="lg:col-span-1 w-full space-y-4">
          {/* Tiers */}
          <div className="p-6 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg">
            <h2 className="mb-3">Referrals Tiers</h2>
            <div className="space-y-4">
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  className="w-full flex flex-col sm:flex-row justify-between p-4 border rounded-lg gap-3 hover:scale-102 duration-300"
                >
                  <div>
                    <h2>{tier?.name}</h2>
                    <p>{tier?.requirement}</p>
                  </div>
                  <div className="flex sm:flex-col justify-between items-end gap-2">
                    <h2 className="truncate">{tier?.reward}</h2>
                    {/* <button className="px-2 p-1 border-2 border-green rounded-lg text-md hover:bg-gradient-to-r from-green to-green-700 hover:scale-105 duration-300 cursor-pointer">
                      Select
                    </button> */}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-3">FAQ</h3>
            <div className="space-y-3 text-sm ">
              <div>
                <div className="font-medium">When do I get my rewards?</div>
                <div className="mt-1 text-xs">
                  Rewards are credited after the referred user completes the
                  qualifying trades (see terms).
                </div>
              </div>
              <div>
                <div className="font-medium">Is there a limit?</div>
                <div className="mt-1 text-xs">
                  No limit — the more people you bring, the more you can earn.
                  Tiers increase your per-referral reward.
                </div>
              </div>
            </div>
          </div>

          {/* Contact Support  */}
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 text-white rounded-2xl p-6">
            <h4 className="text-sm font-semibold">Need help?</h4>
            <p className="text-xs mt-2">
              Contact our support team for questions about tracking or payments.
            </p>
            <div className="mt-4">
              <a
                href="support"
                className="inline-block text-xs sm:text-lg px-4 py-2 rounded-md border-2 hover:bg-gradient-to-r from-green to-green-700 hover:scale-105 duration-300 border-green font-medium"
              >
                Contact support
              </a>
            </div>
          </div>
        </aside>
      </section>

      {/* Bottom CTA */}
      <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">
            Ready to get more referrals?
          </h3>
          <p className="text-sm text-gray-300">
            Share your link — earn credits and unlock higher tiers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-block text-xs sm:text-lg px-4 py-2 rounded-md border-2 hover:bg-gradient-to-r from-green to-green-700 hover:scale-105 duration-300 border-green font-medium cursor-pointer">
            Share on Twitter
          </button>
          <button
            onClick={() =>
              handleCopy(
                `https://www.binaryv.com/signup?ref=${user?.referralCode}`
              )
            }
            className="inline-block text-xs sm:text-lg px-4 py-2 rounded-md border-2 hover:bg-gradient-to-r from-green to-green-700 hover:scale-105 duration-300 border-green font-medium cursor-pointer"
          >
            {copied ? "Link copied" : "Copy Link"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default ReferralPage;
