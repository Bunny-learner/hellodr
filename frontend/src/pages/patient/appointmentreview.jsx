import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LinearProgress } from "@mui/material";
import { loadStripe } from "@stripe/stripe-js";
import { useAuth } from "../AuthContext";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import "../../css/finalappointment.css";
const API = import.meta.env.VITE_API_URL;

const renderStars = (rating = 0) => (
  <div className="appt-review-rating-display">
    {[1, 2, 3, 4, 5].map((i) => (
      <span key={i} className={`appt-review-star ${i <= rating ? "appt-review-star-active" : "appt-review-star-inactive"}`}>
        ★
      </span>
    ))}
  </div>
);

export default function AppointmentReview() {
  const navigate = useNavigate();
  const {isAuthenticated}=useAuth();
  const [loading, setLoading] = useState(false);
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    const savedAppointment = JSON.parse(localStorage.getItem("appointment"));
    if (savedAppointment) setAppointment(savedAppointment);
  }, []);

  const stripePromise = loadStripe(
    "pk_test_51SMMxVBjTdmRphBj07kP4sDrsC2LfsU2YU0dHTXxxCB4UPx3gfu1pjzIqPE2cYtuAaghDwvlhnl0ZgZiwpt0vf80001I770x02"
  );

  const bookNow = async () => {
    if(!isAuthenticated){
      localStorage.setItem("redirecturl","/hello-doctor/patient/appointment/review")
      navigate("/patient/login?alert=please login ")
    return;}

    if (!appointment) return;
 
   
    const result = await Swal.fire({
      title: "Confirm Booking?",
      text: "Are you sure you want to confirm this appointment?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, confirm it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`${API}/appointment/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(appointment),
      });

      const response = await res.json();
      console.log(response.appointment)

      if (res.status === 201) {
        const sessionRes = await fetch(`${API}/appointment/getsession`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: appointment.fee * 100,
            appointmentId: response.appointment._id,
            customerEmail: response.appointment.email,
            currency: "inr",
          }),
        });

        const sessionData = await sessionRes.json();

        if (sessionData.url) {
          window.location.href = sessionData.url;
        } else {
          toast.error("Stripe session URL not obtained");
        }
      }
    } catch (err) {
      console.error("Error while booking appointment:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!appointment) {
    return <div className="appt-review-no-data">No appointment details found.</div>;
  }

  return (
    <>
      <Toaster position="top-left" toastOptions={{ className: "my-toast" }} reverseOrder={false} />
      {loading && <LinearProgress color="primary" className="progress" />}
      
      <div className="appt-review-wrapper">
        <div className="appt-review-container">
          
          <div className="appt-review-header">
            <h1 className="appt-review-title">Appointment Summary</h1>
            <p className="appt-review-subtitle">Please review your appointment details before confirmation</p>
          </div>

          <div className="appt-review-card appt-review-doctor-card">
            <div className="appt-review-card-header">
              <span className="appt-review-card-icon">👨‍⚕️</span>
              <h2 className="appt-review-card-title">Doctor Information</h2>
            </div>
            <div className="appt-review-doctor-content">
              <img
                src="https://res.cloudinary.com/decmqqc9n/image/upload/v1761300266/dp_copsbu.png"
                alt={appointment.doctorName}
                className="appt-review-doctor-image"
              />
              <div className="appt-review-doctor-info">
                <h3 className="appt-review-doctor-name">{appointment.doctorName}</h3>
                <p className="appt-review-doctor-fee">Consultation Fee: ₹{appointment.fee}</p>
                {appointment.rating && renderStars(appointment.rating)}
              </div>
            </div>
          </div>

          <div className="appt-review-card">
            <div className="appt-review-card-header">
              <span className="appt-review-card-icon">📅</span>
              <h2 className="appt-review-card-title">Appointment Schedule</h2>
            </div>
            <div className="appt-review-info-grid">
              <div className="appt-review-field">
                <label className="appt-review-label">Day</label>
                <div className="appt-review-value">{appointment.dayName}</div>
              </div>
              <div className="appt-review-field">
                <label className="appt-review-label">Date</label>
                <div className="appt-review-value">{appointment.date}</div>
              </div>
              <div className="appt-review-field">
                <label className="appt-review-label">Time Slot</label>
                <div className="appt-review-value">{appointment.timeSlot}</div>
              </div>
            </div>
          </div>

          <div className="appt-review-card">
            <div className="appt-review-card-header">
              <span className="appt-review-card-icon">👤</span>
              <h2 className="appt-review-card-title">Patient Information</h2>
            </div>
            <div className="appt-review-info-grid">
              <div className="appt-review-field">
                <label className="appt-review-label">Full Name</label>
                <div className="appt-review-value">{appointment.patientName}</div>
              </div>
              <div className="appt-review-field">
                <label className="appt-review-label">Age</label>
                <div className="appt-review-value">{appointment.age} years</div>
              </div>
              <div className="appt-review-field">
                <label className="appt-review-label">Gender</label>
                <div className="appt-review-value">{appointment.gender}</div>
              </div>
              <div className="appt-review-field">
                <label className="appt-review-label">Email Address</label>
                <div className="appt-review-value">{appointment.email}</div>
              </div>
              <div className="appt-review-field">
                <label className="appt-review-label">Phone Number</label>
                <div className="appt-review-value">{appointment.phoneNumber}</div>
              </div>
              {appointment.symptoms && (
                <div className="appt-review-field appt-review-field-full">
                  <label className="appt-review-label">Symptoms / Reason for Visit</label>
                  <div className="appt-review-value appt-review-symptoms">{appointment.symptoms}</div>
                </div>
              )}
            </div>
          </div>

          <div className="appt-review-actions">
            <button 
              className="appt-review-btn appt-review-btn-secondary" 
              onClick={() => navigate("/patient/appointment/form")}
            >
              Edit Details
            </button>
            <button 
              className="appt-review-btn appt-review-btn-primary" 
              onClick={bookNow}
            >
              Confirm & Proceed to Payment
            </button>
          </div>

        </div>
      </div>
    </>
  );
}