import React from "react";
import "../../css/patienthome.css";
import { FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function PopularDoctorCard({
  name,
  hospital,
  speciality,
  _id,
  rating = 0,
  experience = 0,
  fee = "N/A",
  profilePic,
}) {
  return (
    <article className="popular-card">
      
      {/* ----- TOP SECTION ----- */}
      <div className="popular-top">
        <img
          src={profilePic || "/images/doctor-placeholder.png"}
          alt={name}
          className="popular-avatar"
          onError={(e) => {
            e.target.src = "/images/doctor-placeholder.png";
          }}
        />

        <div className="popular-info">
          <h4 className="popular-name">DR. {name}</h4>

          <Link
            to={`/patient/${_id}`}
            className="view"
            title="View profile"
            style={{ padding: 0 }}
          >
            View Profile
          </Link>

          <div className="popular-special">{speciality}</div>
          <div className="popular-hospital">{hospital}</div>

          <div className="popular-meta">
            <span className="meta-item">
              <FaStar className="star" /> {Number(rating).toFixed(1)}
            </span>
            <span className="meta-item"> {experience} yrs</span>
          </div>
        </div>
      </div>

      {/* ----- BOTTOM SECTION ----- */}
    <div className="popular-bottom">
  <div className="popular-fee">
    <span className="fee-label">Consultation</span>
    <span className="fee-amount">₹{fee}</span>
  </div>

  <Link to={`/patient/appointment/${_id}`} className="btn-outline">
    Book
  </Link>
</div>


    </article>
  );
}
