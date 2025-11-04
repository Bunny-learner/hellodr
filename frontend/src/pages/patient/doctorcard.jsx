import React from "react";
import "../../css/doctorcard.css";

export default function DoctorCard({ name, speciality, rating, experience, fee, _id, imgSrc }) {
  return (
    <div className="doctor-card" key={_id}>
      <div className="doctor-left">
        <img src={imgSrc} alt={name} className="doctor-img" />

        <div className="doctor-info">
          <h3 className="doctor-name">{name}</h3>
          <p className="doctor-speciality">{speciality}</p>
          <p className="doctor-exp">
            <span className="exp">{experience} YEARS</span>
          </p>
          <p className="doctor-rating">
            <span className="single-star">⭐</span> {rating.toFixed(1)}
          </p>
        </div>
      </div>

      <div className="doctor-right">
        <p className="doctor-fee">₹{fee}</p>
        <button className="consult-btn">Online Consult</button>
        <p className="consult-time">Available in 6 minutes</p>
      </div>
    </div>
  );
}
