import React from "react";
import { Link } from "react-router-dom";
import "../../css/featured.css";
import { FaStar, FaInfoCircle } from "react-icons/fa";

export default function FeaturedDoctorCard({
  name,
  hospital,
  speciality,
  _id,
  rating,
  experience,
  fee,
  imgSrc,
}) {
  return (
    <div className="featured-doctor-card">
      <img src={imgSrc} alt={name} className="fphoto" />

      <div className="info">
        <div className="name-row">
          <h4 className="name">DR. {name}</h4>

          {/* Info icon that redirects to /patient/:id */}
          <Link to={`/patient/${_id}`} className="info-icon" title="View Profile">
            <FaInfoCircle size={18} />
          </Link>
        </div>

        <p className="speciality">{speciality}</p>
        <b className="hospital montserrat-bold">{hospital}</b>

        <div className="details">
          <span className="rating">
            <FaStar /> {rating.toFixed(1)}
          </span>
          <span className="experience">{experience} yrs exp</span>
        </div>

        <p className="fee">₹{fee} / session</p>
      </div>

      <Link className="booknow" to={`/patient/appointment/${_id}`}>
        Book Now
      </Link>
    </div>
  );
}
