import React from "react";
import { FaLeaf, FaTruck, FaCheckCircle, FaHome } from "react-icons/fa";
import { assets } from "../../assets/assets";

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t mt-10">
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* 🔥 Highlights Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center mb-12">
          {[
            { icon: <FaHome />, text: "100% Homemade" },
            { icon: <FaLeaf />, text: "No Artificial Additives" },
            { icon: <FaTruck />, text: "Local Farm Sourcing" },
            { icon: <FaCheckCircle />, text: "Quality Tested" },
          ].map((item, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-20 h-20 bg-white rounded-full shadow flex items-center justify-center text-green-600 text-2xl hover:scale-105 transition">
                {item.icon}
              </div>
              <p className="mt-4 font-semibold text-gray-700">
                {item.text}
              </p>
            </div>
          ))}
        </div>

        {/* 🔥 Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">

          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-green-600">
              Cocogrand Organics
            </h3>
            <p className="mt-4 text-gray-600 leading-relaxed">
              🌱 Pure, organic, and farm-fresh products delivered to your home.
              <br />
              <span className="font-medium">Good Food, Good Health ✨</span>
            </p>
            <p className="mt-3 text-sm text-gray-500">
              <strong>GST:</strong> 33QWPWS6777HIZH
            </p>
            <p className="text-sm text-gray-500">
              <strong>FSSAI:</strong> 22423022000177
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg text-gray-800">
              Contact Us
            </h4>
            <ul className="mt-4 space-y-2 text-gray-600 text-sm">
              <li>📍 Cuddalore – Virudhachalam Main Road, TN</li>
              <li>📞 +91 70922 33420</li>
              <li>📞 +91 80726 78237</li>
              <li>📧 support@cocograndorganics.com</li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-lg text-gray-800">
              Quick Links
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              {["Home", "Shop", "About Us", "Contact"].map((link) => (
                <li key={link}>
                  <a
                    href={`/${link.toLowerCase().replace(" ", "")}`}
                    className="text-gray-600 hover:text-green-600 transition"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t my-10"></div>

        {/* 🔥 Social Icons */}
        <div className="flex justify-center gap-6 mb-6">
          <a href="https://youtube.com" target="_blank">
            <img
              src={assets.youtube}
              alt="YouTube"
              className="w-9 h-9 hover:scale-110 transition"
            />
          </a>
          <a href="https://instagram.com" target="_blank">
            <img
              src={assets.instagram}
              alt="Instagram"
              className="w-9 h-9 hover:scale-110 transition"
            />
          </a>
          <a href="https://wa.me/919943322935" target="_blank">
            <img
              src={assets.whatsapp}
              alt="WhatsApp"
              className="w-9 h-9 hover:scale-110 transition"
            />
          </a>
        </div>

        {/* Copyright */}
        <p className="text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Cocogrand Organics. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
