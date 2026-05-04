import React from "react";
import {
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaFacebookF,
  FaCopy,
} from "react-icons/fa";
import toast from "react-hot-toast";

const Footer = () => {
  return (
    <footer className="bg-[#0B0F0C] text-gray-300 pt-42 px-8 md:px-20 rounded-2xl m-6">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Left Section */}
        <div>
          <h4 className="text-green-400 uppercase text-sm tracking-widest mb-3">
            Contact Us
          </h4>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white mb-6">
            Let’s Discuss Your <br /> Trading Vision With Us
          </h2>
          <button className="bg-gradient-to-r from-green to-green-700 transition text-black font-medium px-6 py-3 rounded-full inline-flex items-center gap-2 cursor-pointer">
            Schedule a call now →
          </button>

          <p className="mt-6 text-sm text-gray-400">Or email us at</p>
          <div className="mt-3 bg-[#121712] inline-block rounded-full px-4 py-2 border border-green-600/30 text-gray-200 text-sm">
            info@binaryv.com{" "}
            <button
              onClick={() => {
                navigator.clipboard.writeText("info@binaryv.com");
                toast.success("Copied Successfully");
              }}
              className="cursor-pointer text-gray-500"
            >
              {" "}
              <FaCopy size={18} />{" "}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12">
          {" "}
          {/* Middle Section */}
          <div>
            <h4 className="text-green-400 uppercase text-sm tracking-widest mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="hover:text-green-400 transition">
                  Home
                </a>
              </li>
              <li>
                <a href="/download" className="hover:text-green-400 transition">
                  Download our App
                </a>
              </li>
              <li>
                <a
                  href="/resources"
                  className="hover:text-green-400 transition"
                >
                  Resources
                </a>
              </li>
              <li>
                <a href="/blog" className="hover:text-green-400 transition">
                  Blog
                </a>
              </li>
              <li>
                <a href="/about-us" className="hover:text-green-400 transition">
                  About Us
                </a>
              </li>
            </ul>
          </div>
          {/* Right Section */}
          <div>
            <h4 className="text-green-400 uppercase text-sm tracking-widest mb-3">
              Information
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="terms-of-services"
                  className="hover:text-green-400 transition"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="privacy" className="hover:text-green-400 transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="cookie-setting" className="hover:text-green-400 transition">
                  Cookie Settings
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <hr className="my-10 border-gray-700/50" />

      {/* Bottom Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center text-sm">
        <p className="text-gray-500">
          © BinaryV {new Date().getFullYear()}. All Rights Reserved.
        </p>
        <div className="flex gap-4 mt-4 md:mt-0 text-gray-400 text-2xl">
          <a href="#" className="hover:text-blue-500">
            <FaFacebookF />
          </a>
          <a href="#" className="hover:text-blue-400">
            <FaTwitter />
          </a>
          <a href="#" className="hover:text-pink-500">
            <FaInstagram />
          </a>
          <a href="#" className="hover:text-blue-600">
            <FaLinkedin />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
