import React from "react";
import "../../css/doctorcard.css";

export default function DoctorCard({ name, speciality, rating, experience, fee, _id, imgSrc }) {
  return (
    <div className="doctor-card">
      <div className="doctor-left">
        <img src={imgSrc} alt={name} className="doctor-img" />

        <div className="doctor-info">
          <h3 className="doctor-name">{name}</h3>
          <p className="doctor-speciality">{speciality}</p>
          <p className="doctor-exp">{experience} yrs experience</p>

          <div className="doctor-rating">
            ⭐ {rating.toFixed(1)}
          </div>
        </div>
      </div>

      <div className="doctor-right">
        <div className="doctor-fee">
          <span className="fee-label">Consultation Fee</span>
          <span className="fee-value">₹{fee}</span>
        </div>

        <button className="consult-btn">Consult Now</button>
        <p className="consult-time">Available in 6 minutes</p>
      </div>
    </div>
  );
}
