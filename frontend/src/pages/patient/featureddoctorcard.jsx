import React from "react";
import {Link} from 'react-router-dom'
import "../../css/patienthome.css";
import { FaStar } from "react-icons/fa";

export default function FeaturedDoctorCard({ name, speciality,_id, rating, experience, fee, imgSrc }) {
  return (
    <div className="featured-doctor-card">
      <img src={imgSrc} alt={name} className="fphoto"/>
      <div className="info">
        <h4 className="name">{name}</h4>
        <p className="speciality">{speciality}</p>
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
