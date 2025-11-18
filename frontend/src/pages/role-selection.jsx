import React from "react";
import { useNavigate } from "react-router-dom";
import { User, Stethoscope, ArrowLeft } from "lucide-react";
import "../css/roleselection.css";
import { FaArrowLeft } from "react-icons/fa";
import Logo from "../pages/logo"


const RoleSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="role-container">
      {/* Back Button */}
      <button className="back-btn" onClick={() => navigate("/")}>
      <FaArrowLeft/>Back to Home
      </button>

      {/* Branding */}
      <div className="brand-wrapper">
        <div><Logo size="60"/></div>
        <h1 className="brand-title">Hello Dr</h1>
      </div>

      <h2 className="main-title">Welcome to Hello Dr</h2>
      <p className="subtitle">Choose your role to get started</p>

      {/* Cards Grid */}
      <div className="cards-grid">

        {/* Patient Card */}
        <div className="role-card" onClick={() => handleRoleSelection("patient")}>
          <div className="card-icon patient-bg">
            <User className="icon-big" />
          </div>
          <h3 className="card-title">I'm a Patient</h3>
          <p className="card-text">
            Find doctors, book appointments, manage medical records and more.
          </p>

          <ul className="feature-list">
            <li>• Search and book appointments</li>
            <li>• Manage medical records</li>
            <li>• Save favorite doctors</li>
            <li>• Get appointment reminders</li>
          </ul>

          <button className="primary-btn patient-btn" onClick={()=>{navigate("/patient/home")}}>Continue as Patient</button>
        </div>

        {/* Doctor Card */}
        <div className="role-card" onClick={() => handleRoleSelection("doctor")}>
          <div className="card-icon doctor-bg">
            <Stethoscope className="icon-big" />
          </div>
          <h3 className="card-title">I'm a Doctor</h3>
          <p className="card-text">
            Manage appointments, handle patient records and grow your practice.
          </p>

          <ul className="feature-list">
            <li>• Manage appointment slots</li>
            <li>• Upload prescriptions</li>
            <li>• View patient details</li>
            <li>• Track consultations</li>
          </ul>

          <button className="primary-btn doctor-btn" onClick={()=>{navigate("/doctor/login")}}>Continue as Doctor</button>
        </div>

      </div>

      {/* Login Link */}
      <div className="signin-box">
        <p>Already have an account?</p>
        <button className="link-btn" onClick={() => navigate("/login")}>
          Sign in here
        </button>
      </div>
    </div>
  );
};

export default RoleSelection;
