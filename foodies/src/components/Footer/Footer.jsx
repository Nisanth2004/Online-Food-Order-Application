import React from "react";
import { FaLeaf, FaTruck, FaCheckCircle, FaHome } from "react-icons/fa";
import { assets } from "../../assets/assets";

const Footer = () => {
  return (
    <footer className="bg-light text-dark mt-5 border-top">
      <div className="container-fluid py-5 px-4">
        
        {/* ✅ Highlights Section */}
        <div className="row text-center mb-5 g-4">
          <div className="col-6 col-md-3">
            <div
              className="bg-white shadow rounded-circle d-inline-flex align-items-center justify-content-center"
              style={{ width: "80px", height: "80px" }}
            >
              <FaHome className="fs-2 text-success" />
            </div>
            <p className="mt-3 fw-semibold">100% Homemade</p>
          </div>
          <div className="col-6 col-md-3">
            <div
              className="bg-white shadow rounded-circle d-inline-flex align-items-center justify-content-center"
              style={{ width: "80px", height: "80px" }}
            >
              <FaLeaf className="fs-2 text-success" />
            </div>
            <p className="mt-3 fw-semibold">No Artificial Additives</p>
          </div>
          <div className="col-6 col-md-3">
            <div
              className="bg-white shadow rounded-circle d-inline-flex align-items-center justify-content-center"
              style={{ width: "80px", height: "80px" }}
            >
              <FaTruck className="fs-2 text-success" />
            </div>
            <p className="mt-3 fw-semibold">Sourced from Local Farms</p>
          </div>
          <div className="col-6 col-md-3">
            <div
              className="bg-white shadow rounded-circle d-inline-flex align-items-center justify-content-center"
              style={{ width: "80px", height: "80px" }}
            >
              <FaCheckCircle className="fs-2 text-success" />
            </div>
            <p className="mt-3 fw-semibold">Quality Tested</p>
          </div>
        </div>

        {/* ✅ Main Footer Section */}
        <div className="row text-md-start text-center mb-5 px-md-5">
          {/* Brand Section */}
          <div className="col-md-4 mb-4">
            <h4 className="fw-bold text-success">Cocogrand Organics</h4>
            <p className="mt-3">
              🌱 Pure, organic, and farm-fresh products delivered to your home.
              <br />
              Good Food, Good Health ✨
            </p>
            <p className="mb-1"><strong>GST No:</strong> 33QWPWS6777HIZH</p>
            <p className="mb-1"><strong>FSSAI:</strong> 22423022000177</p>
          </div>

          {/* Contact Section */}
          <div className="col-md-4 mb-4">
            <h5 className="fw-bold">Contact Us</h5>
            <p className="mt-3 mb-1">📍 Cuddalore to Virudhachalam Main Road, Tamil Nadu - 607804</p>
            <p className="mb-1">📞 +91 70922 33420 | +91 80726 78237</p>
            <p className="mb-1">📧 support@cocograndorganics.com</p>
          </div>

          {/* Quick Links */}
          <div className="col-md-4 mb-4">
            <h5 className="fw-bold">Quick Links</h5>
            <ul className="list-unstyled mt-3">
              <li><a href="/" className="text-dark text-decoration-none d-block mb-2">Home</a></li>
              <li><a href="/shop" className="text-dark text-decoration-none d-block mb-2">Shop</a></li>
              <li><a href="/about" className="text-dark text-decoration-none d-block mb-2">About Us</a></li>
              <li><a href="/contact" className="text-dark text-decoration-none d-block">Contact Us</a></li>
            </ul>
          </div>
        </div>

        <hr className="my-4" />

        {/* ✅ Social Media Icons */}
        <div className="text-center mb-4">
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="mx-3">
            <img src={assets.youtube} alt="YouTube" style={{ width: "40px", height: "40px" }} />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="mx-3">
            <img src={assets.instagram} alt="Instagram" style={{ width: "40px", height: "40px" }} />
          </a>
          <a href="https://wa.me/919943322935" target="_blank" rel="noopener noreferrer" className="mx-3">
            <img src={assets.whatsapp} alt="WhatsApp" style={{ width: "40px", height: "40px" }} />
          </a>
        </div>

        {/* ✅ Copyright */}
        <div className="text-center small text-muted pb-2">
          © {new Date().getFullYear()} Cocogrand Organics | All Rights Reserved
        </div>
      </div>
    </footer>
  );
};

export default Footer;
