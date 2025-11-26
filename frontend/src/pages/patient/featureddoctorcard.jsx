import React from "react";
import { Link } from "react-router-dom";
import { FaStar, FaInfoCircle } from "react-icons/fa";
import "../../css/patienthome.css";

export default function FeaturedDoctorCard({
  name,
  hospital,
  speciality,
  _id,
  rating = 0,
  experience = 0,
  fee = "N/A",
  profilePic,
}) {
  const img = profilePic || "/images/doctor-placeholder.png";
  return (
    <article className="card featured-card">
      <div className="card-left">
        <img src={img} alt={name} className="card-avatar" onError={(e)=>{ e.target.src='/images/doctor-placeholder.png'}}/>
      </div>

      <div className="card-body">
        <div className="card-top">
          <h3 className="card-name">DR. {name}</h3>
          <Link to={`/patient/${_id}`} className="view" style={{fontSize:"1rem"}}title="View profile">
            View profile
          </Link>
        </div>

        <p className="card-special">{speciality}</p>
        <div className="card-hospital">{hospital}</div>

        <div className="card-meta">
          <div className="meta-item"><FaStar className="star"/> {Number(rating).toFixed(1)}</div>
          <div className="meta-item">{experience} yrs</div>
          <div className="meta-item fee">₹{fee} / session</div>
        </div>
      </div>

      <div className="card-action">
        <Link to={`/patient/appointment/${_id}`} className="btn button-primary">Book</Link>
      </div>
    </article>
  );
}
