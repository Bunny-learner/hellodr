import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PatientContext } from "./patientcontext";
import HeartLoader from "../../components/Loaders/heartloader";
import ReviewCard from "../../components/reviewcard";
import Map from "../../components/map";
import "../../css/slotbooking.css";

export default function ViewDoctorProfile() {
  const { id: doctorId } = useParams();
  const navigate = useNavigate();
  const { doctors } = useContext(PatientContext);

  const [doctorProfile, setDoctorProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

    const doctor = doctors.find((d) => d._id === doctorId);
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

  return (
    <div className="doctor-profile-page" id="book">
      {/* ===== HEADER SECTION ===== */}
      <header className="doctor-header">
        <div className="doctor-left">
          <img
            src={doctorProfile.profilePic}
            alt={doctorProfile.name}
            className="doctor-avatar"
          />
        </div>

        <div className="doctor-main">
          <div className="doctor-info">
            <h1 className="doctor-name">Dr. {doctorProfile.name}</h1>
            <p className="doctor-sub">
              {doctorProfile.speciality} • {doctorProfile.experience} yrs
              experience
            </p>
            <p className="doctor-bio">
              {doctorProfile.bio || "No bio available"}
            </p>

            <div className="doctor-info-table">
              <div>
                <strong>Email</strong>
                <span>{doctorProfile.email}</span>
              </div>
              <div>
                <strong>Gender</strong>
                <span>{doctorProfile.gender || "-"}</span>
              </div>
              <div>
                <strong>Languages</strong>
                <span>{doctorProfile.languages?.join(", ") || "-"}</span>
              </div>
              <div>
                <strong>Hospital</strong>
                <span>{doctorProfile.hospital}</span>
              </div>
              <div>
                <strong>Rating</strong>
                <span>⭐ {doctorProfile.rating || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        <aside className="doctor-side">
          <div className="price">
            <div className="price-label">Consultation Fee</div>
            <div className="price-val">₹{doctorProfile.fee}</div>
          </div>
          <button className="btn-primary" onClick={gotoAppointment}>
            Book Appointment
          </button>
        </aside>
      </header>

      {/* ===== CONDITIONS TREATED ===== */}
      {doctorProfile.conditions?.length > 0 && (
        <section className="conditions-section">
          <h2 className="section-title">Conditions Treated</h2>
          <div className="conditions-list">
            {doctorProfile.conditions.map((condition, index) => (
              <span key={index} className="condition-chip">
                {condition}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ===== PAST TREATMENTS ===== */}
      {doctorProfile.pasttreatments?.length > 0 && (
        <section className="treatments-section">
          <h2 className="section-title">Past Treatments</h2>
          <div className="treatments-list">
            {doctorProfile.pasttreatments.map((treatment, index) => (
              <div key={index} className="treatment-card">
                {treatment}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== CLINIC LOCATION ===== */}
      {doctorProfile.address && (
        <>
          <h2 className="hehe">Clinic Location</h2>
          {doctorProfile.address && <Map address={doctorProfile.address} />}
        </>
      )}

      {/* ===== REVIEWS ===== */}
      <h2 className="section-title" id="reviews">
        Reviews
      </h2>
      <ReviewCard reviews={reviews} />

      <a id="down" className="scrollers" href="#reviews">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="white"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
          />
        </svg>
      </a>
      <a id="up" className="scrollers" href="#book">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="white"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
          />
        </svg>
      </a>
    </div>
  );
}
