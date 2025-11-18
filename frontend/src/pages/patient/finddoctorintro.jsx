
import React from "react";
import "../../css/finddoctorsintro.css";
import { FiMapPin, FiCalendar, FiCheckCircle, FiClock, FiHeart } from "react-icons/fi";

export default function FindDoctorIntro({onSelectLocation}) {
  return (
    <div className="welcome-container">
      <div className="welcome-content">

        {/* Header */}
        <div className="welcome-header">
          <div className="welcome-icon-wrapper">
            <FiMapPin className="welcome-icon-large" />
          </div>

          <h1 className="welcome-title">Find the Right Doctor Near You</h1>

          <p className="welcome-subtitle">
            Select your location to discover qualified healthcare professionals in your area
          </p>

          <button className="welcome-btn-primary" onClick={onSelectLocation}>
            <FiCalendar size={20} />
            Select Your Location
          </button>
        </div>

        {/* Features */}
        <div className="welcome-features">
          <div className="welcome-feature-card">
            <div className="feature-icon-wrapper">
              <FiCalendar className="feature-icon" />
            </div>
            <h3>Easy Booking</h3>
            <p>Schedule appointments with top doctors in just a few clicks</p>
          </div>

          <div className="welcome-feature-card">
            <div className="feature-icon-wrapper">
              <FiCheckCircle className="feature-icon" />
            </div>
            <h3>Verified Doctors</h3>
            <p>Connect with certified and experienced healthcare professionals</p>
          </div>

          <div className="welcome-feature-card">
            <div className="feature-icon-wrapper">
              <FiClock className="feature-icon" />
            </div>
            <h3>24/7 Support</h3>
            <p>Get assistance anytime you need help with your healthcare journey</p>
          </div>

          <div className="welcome-feature-card">
            <div className="feature-icon-wrapper">
              <FiHeart className="feature-icon" />
            </div>
            <h3>Quality Care</h3>
            <p>Access comprehensive healthcare services tailored to your needs</p>
          </div>
        </div>

      </div>
    </div>
  );
}

