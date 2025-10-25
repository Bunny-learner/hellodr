import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LinearProgress, Button } from '@mui/material';
import toast, { Toaster } from 'react-hot-toast';
import "../../css/finalappointment.css";

const renderStars = (rating = 0) => (
  <div className="doctor-rating">
    {[1, 2, 3, 4, 5].map((i) => (
      <span key={i} className={`star ${i <= rating ? "filled" : "empty"}`}>★</span>
    ))}
  </div>
);

  export default function AppointmentReview() {
    
  const navigate = useNavigate();
  const [loading,setLoading]=useState(false)
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    const savedAppointment = JSON.parse(localStorage.getItem("appointment"));
    if (savedAppointment) setAppointment(savedAppointment);
  }, []);

  const bookNow = async () => {
    if (!appointment) return;
    setLoading(true)

    try {
     const res = await fetch("http://localhost:8000/appointment/book", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  credentials: "include", 
  body: JSON.stringify(appointment)
});


      const response = await res.json();

     if (res.status === 201) {
  navigate('/patient/appointments?alert=Appointment Booked Successfully');
} else {
  setLoading(false);
  toast.error(response.message || "Failed to book appointment");
}

    } catch (err) {
      console.error("Error while booking appointment:", err);
    }
  };

  if (!appointment) {
    return <div className="no-appointment">No appointment details found.</div>;
  }

  return (<>
  <Toaster position="top-left" toastOptions={{className: 'my-toast'}}  reverseOrder={false} />
   {loading && (
          <LinearProgress
            color="primary"
            className="progress"
          />
        )}
    <div className="hospital-appointment-card">
      <h1>Appointment Summary</h1>

      {/* Doctor Info */}
      <section className="final-doctor-info">
        <img
          src= "https://res.cloudinary.com/decmqqc9n/image/upload/v1761300266/dp_copsbu.png"
          alt={appointment.doctorName}
          className="doctor-avatar"
        />
        <div className="doctor-details">
          <h2>{appointment.doctorName}</h2>
          <p>Speciality: {appointment.speciality || "-"}</p>
          <p>Consultation Fee: ₹{appointment.fee}</p>
          {appointment.rating && renderStars(appointment.rating)}
        </div>
      </section>

      {/* Appointment Info */}
      <section className="info-section">
        <h3>Appointment Details</h3>
        <div className="info-grid">
          <div><label>Day</label><input type="text" readOnly value={appointment.dayName} /></div>
          <div><label>Date</label><input type="text" readOnly value={appointment.date} /></div>
          <div><label>Time Slot</label><input type="text" readOnly value={appointment.timeSlot} /></div>
        </div>
      </section>

      {/* Patient Info */}
      <section className="info-section">
        <h3>Patient Details</h3>
        <div className="info-grid">
          <div><label>Name</label><input type="text" readOnly value={appointment.patientName} /></div>
          <div><label>Age</label><input type="text" readOnly value={appointment.age} /></div>
          <div><label>Gender</label><input type="text" readOnly value={appointment.gender} /></div>
          <div><label>Email</label><input type="text" readOnly value={appointment.email} /></div>
          <div><label>Phone</label><input type="text" readOnly value={appointment.phoneNumber} /></div>
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
        <button className="btn-back" onClick={() => navigate(-1)}>Edit Details</button>
        <button className="btn-confirm" onClick={bookNow}>Confirm Booking</button>
      </div>
    </div>
    </>
  );
}
