import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PatientContext } from "./patientcontext";
import HeartLoader from "../../components/Loaders/heartloader";
import Map from "../../components/map";
import "../../css/viewdoctorprofile.css";
import toast, { Toaster } from 'react-hot-toast';
import Logo from "../logo";
import { useLocation } from 'react-router-dom';
import { useAuth } from "../AuthContext"
const API = import.meta.env.VITE_API_URL;

// Share Modal component
const ShareModal = ({ doctorProfile, onClose }) => {
  const currentUrl = window.location.href;

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    toast.success('Link copied to clipboard!');
    onClose();
  };

  const handleWhatsApp = () => {
    const message = `Check out Dr. ${doctorProfile.name} - ${doctorProfile.speciality}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message + ' ' + currentUrl)}`;
    window.open(url, '_blank');
    onClose();
  };

  const handleFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank');
    onClose();
  };

  const handleTwitter = () => {
    const text = `Check out Dr. ${doctorProfile.name} - ${doctorProfile.speciality}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank');
    onClose();
  };

  const handleEmail = () => {
    const subject = `Check out Dr. ${doctorProfile.name}`;
    const body = `I found this doctor you might be interested in:\n\nDr. ${doctorProfile.name}\n${doctorProfile.speciality}\n${currentUrl}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    onClose();
  };

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <h2>Share Doctor Profile</h2>
          <button className="share-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="share-doctor-info">
          <img src={doctorProfile.profilePic} alt={doctorProfile.name} className="share-doctor-avatar" />
          <div>
            <h3>Dr. {doctorProfile.name}</h3>
            <p>{doctorProfile.speciality}</p>
          </div>
        </div>

        <div className="share-options">
          <button className="share-option" onClick={handleCopyLink}>
            <div className="share-option-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </div>
            <div className="share-option-text">
              <strong>Copy Link</strong>
              <span>Copy profile link to clipboard</span>
            </div>
          </button>

          <button className="share-option" onClick={handleWhatsApp}>
            <div className="share-option-icon" style={{ background: '#E7F8F0' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <div className="share-option-text">
              <strong>WhatsApp</strong>
              <span>Share via WhatsApp</span>
            </div>
          </button>

          <button className="share-option" onClick={handleFacebook}>
            <div className="share-option-icon" style={{ background: '#E7F3FF' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
            <div className="share-option-text">
              <strong>Facebook</strong>
              <span>Share on Facebook</span>
            </div>
          </button>

          <button className="share-option" onClick={handleTwitter}>
            <div className="share-option-icon" style={{ background: '#E8F5FE' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1DA1F2">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </div>
            <div className="share-option-text">
              <strong>Twitter</strong>
              <span>Share on Twitter</span>
            </div>
          </button>

          <button className="share-option" onClick={handleEmail}>
            <div className="share-option-icon" style={{ background: '#FFF4E6' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF9800" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <div className="share-option-text">
              <strong>Email</strong>
              <span>Share via email</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

// Simple Star Rating component
const StarRating = ({ rating }) => {
  const stars = [];
  const roundedRating = Math.round(rating * 2) / 2;
  for (let i = 1; i <= 5; i++) {
    if (i <= roundedRating) {
      stars.push(<span key={i} className="vdp-star vdp-filled">★</span>);
    } else if (i - 0.5 === roundedRating) {
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
  const locationRef = useRef(null);
const location = useLocation();
  const { doctors } = useContext(PatientContext);
  const { user } = useAuth();
  const [currentshowing,setCurrentShowing]=useState("")
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showBottomMenu,setShowBottomMenu]=useState(false)
  

  useEffect(() => {
    if (!user || !doctorId) return;
    if (user.fav_doctors?.includes(doctorId)) {
      setIsLiked(true);
    } else {
      setIsLiked(false);
    }
  }, [user, doctorId]);

  async function getReviews(id) {
    try {
      const res = await fetch(`${API}/patient/reviews/${id}`, {
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
  if (location.state?.scrollTo === "location-section" && doctorProfile) {
    setTimeout(() => {
      const el = locationRef.current;
      el.scrollIntoView({ behavior: "smooth" });

      el.classList.add("highlight-section");
      setTimeout(() => el.classList.remove("highlight-section"), 1500);
    }, 300);
  }
}, [location.state, doctorProfile]);




  useEffect(() => {
    if (doctorProfile?.isLiked !== undefined) {
      setIsLiked(doctorProfile.isLiked);
    }
  }, [doctorProfile]);

  useEffect(() => {
    if (!doctors || !doctorId) return;
    const doctor = doctors.find((d) => d._id === doctorId);
    if (!doctor) return;

    if (doctor) {
      setDoctorProfile(doctor);
      getReviews(doctor._id);
      setLoading(false);
    } else {
      setError("Doctor not found");
      setLoading(false);
    }
  }, [doctors, doctorId, navigate]);

  if (loading) return <HeartLoader />;
  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;
  if (!doctorProfile) return null;

  const gotoAppointment = () =>
    navigate(`/patient/appointment/${doctorProfile._id}`);

  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  const toggleShowAllBottom = (current) => {
    setCurrentShowing(current)
    setShowBottomMenu(true);
  };

  const closeBottomPanel = () => {
    setShowBottomMenu(false);
  };

  const toggleLike = async (doctorId) => {
    const newState = !isLiked;
    setIsLiked(newState);

    try {
      const res = await fetch(`${API}/patient/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorId,
          isLiked: newState
        }),
        credentials: "include"
      });

      const data = await res.json();
      toast.success(data.message);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to like or unlike");
      setIsLiked(prev => !prev);
    }
  };

  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
  }

  return (
    <>
      <div className="vdp-page-container">
        <button onClick={() => navigate(-1)} className="vdp-back-button">
          &larr; Back
        </button>

        <div className="vdp-layout">
          <div className="vdp-main">
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
                <div className="vdp-actions">
                  <button
                    className="vdp-like-btn"
                    onClick={() => toggleLike(doctorProfile._id)}
                  >
                    {isLiked ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="25" fill="red" viewBox="0 0 24 24" strokeWidth="1.5" stroke="none" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" width="25" viewBox="0 0 24 24" strokeWidth="1.5" stroke="black" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                      </svg>
                    )}
                  </button>

                  <div style={{ position: 'relative' }}>
                    <button
                      className="vdp-share-btn"
                      onClick={() => handleShare()}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="25" fill="black" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-15">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {doctorProfile.bio && (
              <div className="vdp-card">
                <h2 className="vdp-card-title">About Dr. {doctorProfile.name}</h2>
                <p className="vdp-doctor-bio">{doctorProfile.bio}</p>
              </div>
            )}

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

            <div ref={locationRef} id="location-section">
  {doctorProfile.address && (
    <div className="vdp-card">
      <h2 className="vdp-card-title">Clinic Location</h2>
      <button className="locn" onClick={()=>toggleShowAllBottom("location")}>view</button>
    </div>
  )}
</div>


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
                    <button onClick={()=>toggleShowAllBottom("reviews")} className="vdp-read-more-btn">
                      {showAllReviews ? "Read Less" : `Read ${reviews.length - 3} More Reviews`}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="vdp-sidebar">
            <div className="vdp-card vdp-booking-card">
              <div className="vdp-price-display">
                <span>Consultation Fee</span>
                <strong>₹{doctorProfile.fee}</strong>
              </div>
              <button className="vdp-btn-primary" onClick={gotoAppointment}>
                Book Appointment
              </button>
            </div>

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
                  <strong>City</strong>
                  <span>{doctorProfile.city || "-"}</span>
                </li>
                <li>
                  <strong>Pincode</strong>
                  <span>{doctorProfile.pincode || "-"}</span>
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

      {showShareMenu && (
        <ShareModal
          doctorProfile={doctorProfile}
          onClose={() => setShowShareMenu(false)}
        />
      )}

   
{showBottomMenu && (
  <>
    <div className="reviews-panel-backdrop" onClick={closeBottomPanel} />

    <div className="reviews-panel">
      {currentshowing === "reviews" ? (
        <>
          <div className="reviews-panel-header">
            <h3>All Reviews ({reviews.length})</h3>
            <button className="reviews-panel-close" onClick={closeBottomPanel}>
              ×
            </button>
          </div>

          <div className="reviews-panel-content">
            {reviews.map((review) => (
              <div key={review._id} className="review-panel-item">
                <div className="review-panel-header">
                  <div className="review-panel-avatar">
                    {(review.patient.name || "A").charAt(0)}
                  </div>
                  <div className="review-panel-info">
                    <h4>{review.patient.name || "Anonymous"}</h4>
                    <div className="review-panel-rating">
                      <StarRating rating={review.rating} />
                    </div>
                  </div>
                </div>

                <p className="review-panel-text">{review.review}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="reviews-panel-header">
            <h3>Clinic Location</h3>
            <button className="reviews-panel-close" onClick={closeBottomPanel}>
              ×
            </button>
          </div>

          <p>{doctorProfile.address}</p>

          <div className="vdp-map-container">
            <Map address={doctorProfile.address} />
          </div>
        </>
      )}
    </div>
  </>
)}


</>
  )}
