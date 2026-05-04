import React from "react";

const Footer = () => {
  return (
    <footer
      style={{
        background:
          "linear-gradient(165deg, black 40%, #38D300 100%, #38D300 5%)",
        // backgroundColor:"pink"
      }}
      className="relative w-full flex flex-col justify-end items-center h-full  text-gray-300 py-8 px-6"
    >
      <div className="w-[80vw] h-full pt-40 mb-12 sm:mb-0 pl-2 sm:pl-6 md:pl-0 pb-4  mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* Useful Links */}
        <div>
          <h3 className="text-white  font-semibold mb-3">Useful Links</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-blue-400">
                Home
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400">
                About
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400">
                Features
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400">
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* Social Links */}
        <div>
          <h3 className="text-white font-semibold mb-3">Connect with Us</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-blue-400">
                Twitter
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400">
                LinkedIn
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400">
                Instagram
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400">
                Facebook
              </a>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-white font-semibold mb-3">Legal</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-blue-400">
                Terms
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400">
                Privacy
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400">
                Cookies
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400">
                Sitemap
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-3">Legal</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-blue-400">
                Terms
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400">
                Privacy
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400">
                Cookies
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400">
                Sitemap
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/*  */}
      <div className="border-t  border-gray-700 w-[80vw] h-full flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0 w-full grid grid-cols-1 md:grid-cols-2 py-2 gap-5">
          <div className="w-full">
            <span>Never miss an update</span>
            <p>
              Get all the latest update of real time market price and trading
              tips
            </p>
          </div>
          <div className="w-full h-full flex flex-col gap-4 py-2 ">
            <span className="flex gap-2">
              <input
                className="border w-full border-gray-300 rounded-md p-2" placeholder="youremail@gmail.com"
                type="text"
              />{" "}
              <button className="bg-[#F5F5F5] text-dark px-6  rounded-md p-2">
                Join
              </button>
            </span>
            <span>
              <input className="border rounded-md " type="checkbox" defaultChecked />{" "}
              <span>I agree to the terms and conditions</span>{" "}
            </span>
          </div>
        </div>
      </div>
      {/* Copyright */}
      <div className="text-gray-50 md:mt-6 w-full">
        <p className="text-sm w-full text-center">
          &copy; 2025 BinaryV, All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
