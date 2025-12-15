import React from "react";
import "./AboutUs.css";
import OrganicStory from "../../components/OrganicStory/OrganicStory";
import { assets } from "../../assets/assets";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 }
};

const AboutUs = () => {
  return (
    <main className="about-page">

      {/* ================= HERO ================= */}
      <section className="about-hero">
        <motion.div
          className="about-hero-content"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 1 }}
        >
          <h1>About CocoGrand Organics 🌿</h1>
          <p>
            Pure • Natural • Honest food from farm to family
          </p>

          <a href="/menu" className="cta-btn">
            Explore Our Products 🛒
          </a>
        </motion.div>
      </section>

      {/* ================= MISSION ================= */}
      <motion.section
        className="about-section mission"
        initial="hidden"
        whileInView="visible"
        variants={fadeUp}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2>Our Mission</h2>
        <p>
          At <b>CocoGrand Organics</b>, our mission is to reconnect people
          with nature through food. We stand for chemical-free farming,
          honest sourcing, and healthier living.
        </p>
      </motion.section>

      {/* ================= IMPACT ================= */}
      <motion.section
        className="impact-section"
        initial="hidden"
        whileInView="visible"
        variants={fadeUp}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="impact-card">
          <h3>10+</h3>
          <p>Years of Trust</p>
        </div>
        <div className="impact-card">
          <h3>150+</h3>
          <p>Organic Farmers</p>
        </div>
        <div className="impact-card">
          <h3>5000+</h3>
          <p>Happy Families</p>
        </div>
        <div className="impact-card">
          <h3>100%</h3>
          <p>Chemical-Free</p>
        </div>
      </motion.section>

      {/* ================= WHY US ================= */}
      <motion.section
        className="about-section why-us"
        initial="hidden"
        whileInView="visible"
        variants={fadeUp}
        viewport={{ once: true }}
      >
        <h2>Why CocoGrand?</h2>

        <div className="why-grid">
          <div className="why-card">🌱<h4>100% Natural</h4><p>Pure organic farming</p></div>
          <div className="why-card">🧑‍🌾<h4>Farmer First</h4><p>Ethical sourcing</p></div>
          <div className="why-card">🛡️<h4>Quality Tested</h4><p>Strict standards</p></div>
          <div className="why-card">❤️<h4>Health Focus</h4><p>Family wellness</p></div>
        </div>
      </motion.section>

      {/* ================= CERTIFICATIONS ================= */}
      <motion.section
        className="cert-section"
        initial="hidden"
        whileInView="visible"
        variants={fadeUp}
        viewport={{ once: true }}
      >
        <h2>Certified & Trusted 🧾</h2>

        <div className="cert-logos">
          <img src={assets.cert1} alt="Organic Certified" />
          <img src={assets.cert2} alt="ISO" />
          <img src={assets.cert3} alt="FSSAI" />
        </div>
      </motion.section>

      {/* ================= FOUNDER ================= */}
      <motion.section
        className="founder-section"
        initial="hidden"
        whileInView="visible"
        variants={fadeUp}
        viewport={{ once: true }}
      >
        <div className="founder-img">
          <img src={assets.founder || assets.girl} alt="Founder" />
        </div>

        <div className="founder-content">
          <h2>Our Founder’s Story 💬</h2>
          <p>
            CocoGrand began with a simple belief — food should heal, not harm.
            Our founder started this journey to bring back the purity
            of traditional organic farming for future generations.
          </p>
        </div>
      </motion.section>

      {/* ================= ORGANIC STORY ================= */}
      <OrganicStory />

    </main>
  );
};

export default AboutUs;
