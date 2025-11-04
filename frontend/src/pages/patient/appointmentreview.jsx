import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LinearProgress } from "@mui/material";
import { loadStripe } from "@stripe/stripe-js";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import "../../css/finalappointment.css";

const renderStars = (rating = 0) => (
  <div className="doctor-rating">
    {[1, 2, 3, 4, 5].map((i) => (
      <span key={i} className={`star ${i <= rating ? "filled" : "empty"}`}>
        ★
      </span>
    ))}
  </div>
);

export default function AppointmentReview() {
  const navigate = useNavigate();
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

    if (!result.isConfirmed) return; // user canceled

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/appointment/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(appointment),
      });

      const response = await res.json();
      console.log(response.appointment)

      if (res.status === 201) {
        const sessionRes = await fetch("http://localhost:8000/appointment/getsession", {
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
    return <div className="no-appointment">No appointment details found.</div>;
  }

  return (
    <>
      <Toaster position="top-left" toastOptions={{ className: "my-toast" }} reverseOrder={false} />
      {loading && <LinearProgress color="primary" className="progress" />}
      <div className="hospital-appointment-card">
        <h1>Appointment Summary</h1>

        {/* Doctor Info */}
        <section className="final-doctor-info">
          <img
            src="https://res.cloudinary.com/decmqqc9n/image/upload/v1761300266/dp_copsbu.png"
            alt={appointment.doctorName}
            className="doctor-avatar"
          />
          <div className="doctor-details">
            <h2>{appointment.doctorName}</h2>
            {/* <p>Speciality: {appointment.speciality || "-"}</p> */}
            <p>Consultation Fee: ₹{appointment.fee}</p>
            {appointment.rating && renderStars(appointment.rating)}
          </div>
        </section>

        {/* Appointment Info */}
        <section className="info-section">
          <h3>Appointment Details</h3>
          <div className="info-grid">
            <div>
              <label>Day</label>
              <input type="text" readOnly value={appointment.dayName} />
            </div>
            <div>
              <label>Date</label>
              <input type="text" readOnly value={appointment.date} />
            </div>
            <div>
              <label>Time Slot</label>
              <input type="text" readOnly value={appointment.timeSlot} />
            </div>
          </div>
        </section>

        {/* Patient Info */}
        <section className="info-section">
          <h3>Patient Details</h3>
          <div className="info-grid">
            <div>
              <label>Name</label>
              <input type="text" readOnly value={appointment.patientName} />
            </div>
            <div>
              <label>Age</label>
              <input type="text" readOnly value={appointment.age} />
            </div>
            <div>
              <label>Gender</label>
              <input type="text" readOnly value={appointment.gender} />
            </div>
            <div>
              <label>Email</label>
              <input type="text" readOnly value={appointment.email} />
            </div>
            <div>
              <label>Phone</label>
              <input type="text" readOnly value={appointment.phoneNumber} />
            </div>
            {appointment.symptoms && (
              <div className="full-width">
                <label>Symptoms</label>
                <textarea readOnly value={appointment.symptoms}></textarea>
              </div>
            )}
          </div>
        </section>

        {/* Action Buttons */}
        <div className="btn-row">
          <button className="btn-back" onClick={() => navigate(-1)}>
            Edit Details
          </button>
          <button className="btn-confirm" onClick={bookNow}>
            Confirm Booking
          </button>
        </div>
      </div>
    </>
  );
}
