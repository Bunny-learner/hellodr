import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Shield,
  Star,
  ArrowRight,
  Stethoscope,
  Calendar,
  FileText,
  Video,
} from "lucide-react";
import "../../css/welcome1.css";
import Logo from "../logo.jsx";

const Welcome1 = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Calendar className="icon-lg icon-blue" />,
      title: "Easy Appointment Booking",
      description: "Book appointments with verified doctors in just a few clicks",
    },
    {
      icon: <Video className="icon-lg icon-green" />,
      title: "Telemedicine Support",
      description: "Consult with doctors via video calls from home",
    },
    {
      icon: <FileText className="icon-lg icon-purple" />,
      title: "Digital Health Records",
      description: "Securely store and access your medical records",
    },
    {
      icon: <Shield className="icon-lg icon-teal" />,
      title: "HIPAA Compliant",
      description: "Your data is protected with industry standards",
    },
  ];

  const stats = [
    { number: "10,000+", label: "Happy Patients" },
    { number: "500+", label: "Verified Doctors" },
    { number: "50+", label: "Specializations" },
    { number: "24/7", label: "Emergency Support" },
  ];

  return (
    <>
    <div className="welcome-container">

      {/* ================= HEADER ================= */}
      <header className="header">
        <div className="header-inner">
          <div className="flex items-center gap-3">
            <div>
              <Logo size="40"/>
            </div>
            <h1 className="logo-title">Hello Dr</h1>
          </div>

          <div className="flex gap-3">
            <button
              className="header-btn header-btn-outline"
              onClick={() => navigate("/patient/login")}
            >
              Sign In
            </button>

            <button
              className="header-btn header-btn-primary"
              onClick={() => navigate("/patient/signup")}
            >
              Get Started 
            </button>
          </div>
        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className="hero-section">
        <div className="hero-wrapper">

          {/* LEFT SIDE TEXT */}
          <div>
            <div className="hero-badge">
              <Heart className="w-4 h-4 mr-2" />
              Trusted Healthcare Platform
            </div>

            <h1 className="hero-title">
              Your Health,
              <span> Our Priority</span>
            </h1>

            <p className="hero-description">
              Connect with certified healthcare professionals, book appointments
              instantly, and manage your health securely.
            </p>

            <div className="hero-buttons">
              <button
                className="hero-btn-primary"
                onClick={() => navigate("/role-selection")}
              >
                Book Appointment <ArrowRight />
              </button>

              <button
                className="hero-btn-outline"
                onClick={() => navigate("/doctor/signup")}
              >
                Join as Doctor
              </button>
            </div>
          </div>

          {/* RIGHT SIDE IMAGE */}
          <div className="hero-image-container">
            <div className="hero-image-box">
              <img
                src="https://res.cloudinary.com/decmqqc9n/image/upload/v1763620425/home_v1siak.jpg"
                alt="doctor"
                className="hero-image"
              />
            </div>

            <div className="hero-rating-card">
              <div className="rating-icon">
                <Star className="text-green-600" />
              </div>
              <div>
                <p className="rating-title">4.9/5 Rating</p>
                <p className="rating-sub">From 10,000+ patients</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= STATS SECTION ================= */}
      <section className="stats-section">
        <div className="stats-grid">
          {stats.map((s, i) => (
            <div key={i}>
              <p className="stat-number">{s.number}</p>
              <p className="stat-label">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= FEATURES SECTION ================= */}
      <section className="features-section">
        <h2 className="features-title">Why Choose Hello Dr?</h2>
        <p className="features-subtitle">
          Experience healthcare like never before with our digital platform.
        </p>

        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon-box">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-description">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= CTA SECTION ================= */}
      <section className="cta-section">
        <h2 className="cta-title">
          Ready to Transform Your Healthcare Experience?
        </h2>
        <p className="cta-subtitle">
          Join thousands of patients & doctors who trust Hello Dr.
        </p>

        <div className="cta-buttons">
          <button
            className="cta-btn-primary"
            onClick={() => navigate("/role-selection")}
          >
            Start Your Journey
            <ArrowRight />
          </button>

          <button
            className="cta-btn-outline"
            onClick={() => navigate("/role-selection")}
          >
            Learn More
          </button>
        </div>
      </section>

      
    </div>

    {/* ================= FOOTER ================= */}
      <footer className="footer">
        <div className="footer-inner">

          <div>
            <div className="flex items-center gap-3 mb-4">
              <div >
              <Logo className="logo-icon" size="40"/>
              </div>
              <h3 className="logo-footer">Hello Dr</h3>
            </div>
            <p className="footer-text">
              Connecting patients with healthcare professionals for better outcomes.
            </p>
          </div>

          <div>
            <h4 className="footer-title">Support</h4>

            <ul className="footer-links">
              <li><button onClick={() => navigate("/help-center")}>Help Center</button></li>
              <li><button onClick={() => navigate("/privacy-policy")}>Privacy Policy</button></li>
              <li><button onClick={() => navigate("/coming-soon")}>Terms of Service</button></li>
              <li><button onClick={() => navigate("/coming-soon")}>Contact Us</button></li>
            </ul>
          </div>

        </div>
      </footer>
</>
  );
};

export default Welcome1;
