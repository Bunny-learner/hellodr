import React from "react";
import "../../css/patienthome.css";
import { FaStar } from "react-icons/fa";

export default function PopularDoctorCard({ name, speciality, rating, experience, fee, imgSrc }) {
  return (
    <div className="popular-doctor-card">
      <img src={imgSrc} alt={name} className="photo" />
      <div className="info">
        <h4 className="name">{name}</h4>
        <p className="speciality">{speciality}</p>
        <div className="details">
          <span className="rating"><FaStar /> {rating.toFixed(1)}</span>
          <span className="experience">{experience} yrs exp</span>
        </div>
        <p className="fee">₹{fee} / session</p>
      </div>
    </div>
  );
}
