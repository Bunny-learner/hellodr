import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PatientContext } from "./patientcontext";
import HeartLoader from "../../components/Loaders/heartloader";
import Map from "../../components/map";
import "../../css/viewdoctorprofile.css"; // This will now use the new CSS file below

// Simple Star Rating component
const StarRating = ({ rating }) => {
  const stars = [];
  const roundedRating = Math.round(rating * 2) / 2; // Round to nearest 0.5
  for (let i = 1; i <= 5; i++) {
    if (i <= roundedRating) {
      stars.push(<span key={i} className="vdp-star vdp-filled">★</span>);
    } else if (i - 0.5 === roundedRating) {
      // Assuming you might want a half-star style
      stars.push(<span key={i} className="vdp-star vdp-half">★</span>); 
    } else {
      stars.push(<span key={i} className="vdp-star vdp-empty">☆</span>);
    }
  }
  return <div className="vdp-star-rating">{stars}</div>;
};


export default function ViewDoctorProfile() {
  const { id: doctorId } = useParams();
  const navigate = useNavigate();
  const { doctors } = useContext(PatientContext);

  const [doctorProfile, setDoctorProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllReviews, setShowAllReviews] = useState(false);

  async function getReviews(id) {
    try {
      const res = await fetch(`http://localhost:8000/patient/reviews/${id}`, {
        credentials: "include",
        method: "GET",
      });
      const data = await res.json();

      if (res.status === 200) setReviews(data.reviews);
      else if (res.status === 401)
        navigate("/patient/login?alert=Session expired. Please login again!");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch reviews");
    }
  }

  useEffect(() => {
    if (!doctors || !doctorId) return;

    console.log(doctorId)
    const doctor = doctors.find((d) => d._id === doctorId);
    
    if(!doctor)return;

    if (doctor) {
      setDoctorProfile(doctor);
      getReviews(doctor._id);
      setLoading(false);
    } else {
      setError("Doctor not found");
      setLoading(false);
    }
  }, [doctors, doctorId, navigate]); // Added navigate to dependency array

  if (loading) return <HeartLoader />;
  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;
  if (!doctorProfile) return null;

  const gotoAppointment = () =>
    navigate(`/patient/appointment/${doctorProfile._id}`);

  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 3);
  const toggleShowAllReviews = () => setShowAllReviews(!showAllReviews);

  return (
    <div className="vdp-page-container">
      <button onClick={() => navigate(-1)} className="vdp-back-button">
        &larr; Back
      </button>

      <div className="vdp-layout">
        {/* ===== MAIN CONTENT (LEFT COLUMN) ===== */}
        <div className="vdp-main">
          
          {/* --- Doctor Intro Card --- */}
          <div className="vdp-card vdp-intro-card">
            <img
              src={doctorProfile.profilePic}
              alt={doctorProfile.name}
              className="vdp-intro-avatar"
            />
            <div className="vdp-intro-details">
              <h1 className="vdp-doctor-name">Dr. {doctorProfile.name}</h1>
              <p className="vdp-doctor-sub">
                {doctorProfile.speciality}
              </p>
              <div className="vdp-doctor-stats">
                <span>⭐ {doctorProfile.rating || "N/A"}</span>
                <span>•</span>
                <span>{doctorProfile.experience} yrs experience</span>
              </div>
              <p className="vdp-doctor-languages">
                Speaks: {doctorProfile.languages?.join(", ") || "N/A"}
              </p>
            </div>
          </div>

          {/* --- About Doctor Card --- */}
          {doctorProfile.bio && (
            <div className="vdp-card">
              <h2 className="vdp-card-title">About Dr. {doctorProfile.name}</h2>
              <p className="vdp-doctor-bio">{doctorProfile.bio}</p>
            </div>
          )}

          {/* --- Specializations (Conditions Treated) Card --- */}
          {doctorProfile.conditions?.length > 0 && (
            <div className="vdp-card">
              <h2 className="vdp-card-title">Conditions Treated</h2>
              <div className="vdp-chip-list">
                {doctorProfile.conditions.map((condition, index) => (
                  <span key={index} className="vdp-chip">
                    {condition}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* --- Past Treatments Card --- */}
          {doctorProfile.pasttreatments?.length > 0 && (
            <div className="vdp-card">
              <h2 className="vdp-card-title">Past Treatments</h2>
              <div className="vdp-chip-list">
                {doctorProfile.pasttreatments.map((treatment, index) => (
                  <span key={index} className="vdp-chip">
                    {treatment}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* --- Clinic Location Card --- */}
          {doctorProfile.address && (
            <div className="vdp-card">
              <h2 className="vdp-card-title">Clinic Location</h2>
              <p>{doctorProfile.address}</p>
              <div className="vdp-map-container">
                <Map address={doctorProfile.address} />
              </div>
            </div>
          )}

          {/* --- Reviews Card --- */}
          <div className="vdp-card">
            <h2 className="vdp-card-title">Patient Reviews</h2>
            {reviews.length === 0 ? (
              <p>No reviews available for this doctor yet.</p>
            ) : (
              <div className="vdp-review-list">
                {visibleReviews.map((review) => (
                  <div key={review._id} className="vdp-review-item">
                    <div className="vdp-review-header">
                      <strong className="vdp-review-patient-name">{review.patient.name || "Anonymous"}</strong>
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="vdp-review-comment">{review.review}</p>
                  </div>
                ))}
                {reviews.length > 3 && (
                  <button onClick={toggleShowAllReviews} className="vdp-read-more-btn">
                    {showAllReviews ? "Read Less" : `Read ${reviews.length - 3} More Reviews`}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ===== SIDEBAR (RIGHT COLUMN) ===== */}
        <div className="vdp-sidebar">
          
          {/* --- Booking Card --- */}
          <div className="vdp-card vdp-booking-card">
            <div className="vdp-price-display">
              <span>Consultation Fee</span>
              <strong>₹{doctorProfile.fee}</strong>
            </div>
            <button className="vdp-btn-primary" onClick={gotoAppointment}>
              Book Appointment
            </button>
          </div>

          {/* --- Additional Info Card --- */}
          <div className="vdp-card">
            <h2 className="vdp-card-title">More Info</h2>
            <ul className="vdp-info-list">
              <li>
                <strong>Hospital</strong>
                <span>{doctorProfile.hospital || "-"}</span>
              </li>
              <li>
                <strong>Gender</strong>
                <span>{doctorProfile.gender || "-"}</span>
              </li>
              <li>
                <strong>Email</strong>
                <span>{doctorProfile.email}</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}