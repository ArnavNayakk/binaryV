import React from "react";
import {
  FaBook,
  FaChartLine,
  FaVideo,
  FaQuestionCircle,
  FaDownload,
  FaUsers,
} from "react-icons/fa";

const Resources = () => {
  const resources = [
    {
      title: "Trading Guides",
      desc: "Step-by-step tutorials to help you master trading basics and advanced strategies.",
      link: "/resources/guides",
      icon: <FaBook size={24} className="text-green mb-3" />,
    },
    {
      title: "Market Insights",
      desc: "Daily updates, expert analysis, and insights to stay ahead in the market.",
      link: "/resources/insights",
      icon: <FaChartLine size={24} className="text-green mb-3" />,
    },
    {
      title: "Video Tutorials",
      desc: "Learn faster with short, engaging video lessons tailored for all skill levels.",
      link: "/resources/videos",
      icon: <FaVideo size={24} className="text-green mb-3" />,
    },
    {
      title: "FAQs",
      desc: "Quick answers to common trading questions and platform-related queries.",
      link: "/resources/faqs",
      icon: <FaQuestionCircle size={24} className="text-green mb-3" />,
    },
    {
      title: "E-books",
      desc: "Download free e-books packed with trading knowledge and market strategies.",
      link: "/resources/ebooks",
      icon: <FaDownload size={24} className="text-green mb-3" />,
    },
    {
      title: "Community Forum",
      desc: "Engage with fellow traders, share tips, and grow together as a community.",
      link: "/resources/community",
      icon: <FaUsers size={24} className="text-green mb-3" />,
    },
  ];

  return (
    <section className="bg-dark text-white py-16 px-6 md:px-20">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Trading <span className="text-green">Resources</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Explore our curated collection of resources designed to help you trade
          smarter, learn faster, and stay ahead in the markets.
        </p>
      </div>

      {/* Resource Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {resources.map((res, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-gray-600 to-gray-800 px-6 py-8 rounded-2xl shadow-md hover:shadow-green transition lg:min-h-56 hover:-translate-y-2"
          >
            <div className="flex space-x-2">
              <div className="mb-3">{res.icon}</div>
              <h3 className="text-xl lg:text-2xl font-semibold text-white mb-3">
                {res.title}
              </h3>
            </div>
            <p className="text-gray-400 mb-4 lg:text-xl">{res.desc}</p>
            <a
              href={res.link}
              className="text-green font-medium hover:underline"
            >
              Explore →
            </a>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="text-center mt-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Unlock the Power of Knowledge
        </h2>
        <p className="text-gray-400 mb-6">
          Stay updated with the latest tools and insights designed for traders
          like you.
        </p>
        <a
          href="/login"
          className="bg-gradient-to-r from-green to-green-700 px-6 py-3 rounded-full font-semibold hover:bg-green/85 transition "
        >
          Start Learning
        </a>
      </div>
    </section>
  );
};

export default Resources;
