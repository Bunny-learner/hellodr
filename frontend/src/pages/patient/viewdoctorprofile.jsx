import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PatientContext } from "./patientcontext";
import HeartLoader from "../../components/Loaders/heartloader";
// We will render reviews directly, so ReviewCard component is no longer needed here
// import ReviewCard from "../../components/reviewcard"; 
import Map from "../../components/map";
import "../../css/doctorprofile.css"; // We will use this new CSS file

// Simple Star Rating component (you can place this in another file if you want)
const StarRating = ({ rating }) => {
  const stars = [];
  const roundedRating = Math.round(rating * 2) / 2; // Round to nearest 0.5
  for (let i = 1; i <= 5; i++) {
    if (i <= roundedRating) {
      stars.push(<span key={i} className="star filled">★</span>); // Full star
    } else if (i - 0.5 === roundedRating) {
      stars.push(<span key={i} className="star half">★</span>); // Half star (if you want)
    } else {
      stars.push(<span key={i} className="star empty">☆</span>); // Empty star
    }
  }
  return <div className="star-rating">{stars}</div>;
};


export default function ViewDoctorProfile() {
  const { id: doctorId } = useParams();
  const navigate = useNavigate();
  const { doctors } = useContext(PatientContext);

  const [doctorProfile, setDoctorProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllReviews, setShowAllReviews] = useState(false); // State for Read More/Less

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
  }, [doctors, doctorId]);

  if (loading) return <HeartLoader />;
  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;
  if (!doctorProfile) return null;

  const gotoAppointment = () =>
    navigate(`/patient/appointment/${doctorProfile._id}`);

  // Logic for Read More/Less
  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 3);
  const toggleShowAllReviews = () => setShowAllReviews(!showAllReviews);

  return (
    <div className="profile-page-container">
      <button onClick={() => navigate(-1)} className="back-button">
        &larr; Back
      </button>

      <div className="profile-layout">
        {/* ===== MAIN CONTENT (LEFT COLUMN) ===== */}
        <div className="profile-main">
          
          {/* --- Doctor Intro Card --- */}
          <div className="profile-card doctor-intro-card">
            <img
              src={doctorProfile.profilePic}
              alt={doctorProfile.name}
              className="doctor-intro-avatar"
            />
            <div className="doctor-intro-details">
              <h1 className="doctor-name">Dr. {doctorProfile.name}</h1>
              <p className="doctor-sub">
                {doctorProfile.speciality}
              </p>
              <div className="doctor-stats">
                <span>⭐ {doctorProfile.rating || "N/A"}</span>
                <span>•</span>
                <span>{doctorProfile.experience} yrs experience</span>
              </div>
              <p className="doctor-languages">
                Speaks: {doctorProfile.languages?.join(", ") || "N/A"}
              </p>
            </div>
          </div>

          {/* --- About Doctor Card --- */}
          {doctorProfile.bio && (
            <div className="profile-card">
              <h2 className="profile-card-title">About Dr. {doctorProfile.name}</h2>
              <p className="doctor-bio">{doctorProfile.bio}</p>
            </div>
          )}

          {/* --- Specializations (Conditions Treated) Card --- */}
          {doctorProfile.conditions?.length > 0 && (
            <div className="profile-card">
              <h2 className="profile-card-title">Conditions Treated</h2>
              <div className="chip-list">
                {doctorProfile.conditions.map((condition, index) => (
                  <span key={index} className="chip">
                    {condition}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* --- Past Treatments Card --- */}
          {doctorProfile.pasttreatments?.length > 0 && (
            <div className="profile-card">
              <h2 className="profile-card-title">Past Treatments</h2>
              <div className="chip-list">
                {doctorProfile.pasttreatments.map((treatment, index) => (
                  <span key={index} className="chip">
                    {treatment}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* --- Clinic Location Card --- */}
          {doctorProfile.address && (
            <div className="profile-card">
              <h2 className="profile-card-title">Clinic Location</h2>
              <p>{doctorProfile.address}</p>
              <div className="map-container">
                <Map address={doctorProfile.address} />
              </div>
            </div>
          )}

          {/* --- Reviews Card --- */}
          <div className="profile-card">
            <h2 className="profile-card-title">Patient Reviews</h2>
            {reviews.length === 0 ? (
              <p>No reviews available for this doctor yet.</p>
            ) : (
              <div className="review-list">
                {visibleReviews.map((review) => (
                  <div key={review._id} className="review-item">
                    <div className="review-header">
                      {/* Assuming review object has patientName. Adjust if needed. */}
                      <strong className="review-patient-name">{review.patient.name || "Anonymous"}</strong>
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="review-comment">{review.review}</p>
                  </div>
                ))}
                {reviews.length > 3 && (
                  <button onClick={toggleShowAllReviews} className="read-more-btn">
                    {showAllReviews ? "Read Less" : `Read ${reviews.length - 3} More Reviews`}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ===== SIDEBAR (RIGHT COLUMN) ===== */}
        <div className="profile-sidebar">
          
          {/* --- Booking Card --- */}
          <div className="profile-card booking-card">
            <div className="price-display">
              <span>Consultation Fee</span>
              <strong>₹{doctorProfile.fee}</strong>
            </div>
            <button className="btn-primary" onClick={gotoAppointment}>
              Book Appointment
            </button>
          </div>

          {/* --- Additional Info Card --- */}
          <div className="profile-card">
            <h2 className="profile-card-title">More Info</h2>
            <ul className="info-list">
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