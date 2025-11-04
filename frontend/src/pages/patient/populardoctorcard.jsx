import React from "react";
import "../../css/patienthome.css";
import { FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function PopularDoctorCard({ name,hospital, speciality,_id, rating, experience, fee, imgSrc }) {
  return (
    <div className="popular-doctor-card">
      <img src={imgSrc} alt={name} className="photo" />
      <div className="info">
        <h4 className="name">DR. {name}</h4>
        <p className="speciality ">{speciality}</p>
        <b className="hospital montserrat-bold">{hospital}</b>
        <div className="details">
          <span className="rating"><FaStar /> {rating.toFixed(1)}</span>
          <span className="experience">{experience} yrs exp</span>
        </div>
        <p className="fee">₹{fee} / session</p>
      </div>
        <Link className="booknow" to={`/patient/appointment/${_id}`}>Book Now</Link>
    </div>
  );
}
