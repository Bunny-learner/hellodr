import React, { useState, useEffect } from 'react';
import "../../css/patientappointments.css";
import toast from 'react-hot-toast';
import Bubbles from '../../components/Loaders/bubbles';
import {useNavigate} from 'react-router-dom'

export default function PatientAppointments() {

  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [rejected,setRejected]=useState([])
  const [pending,setPending]=useState([])
  const navigate=useNavigate()
  const [page,setPage]=useState('rejected')
  const [completed,setCompleted]=useState([])
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);



  function goto(event){

    const text=event.target.innerHTML.toLowerCase();
    console.log(text)
    setLoading(true)
    setPage(text);
    setLoading(false)
  }


  const submitreview=async () => {
          if (!selectedAppointment.reviewText || selectedAppointment.reviewText.trim() === "") {
            console.log("hello")
          
            toast.error("Please write something before submitting.");
            return;
          }
          try {
            const res = await fetch("http://localhost:8000/patient/addreview", {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                appointment: selectedAppointment._id,
                doctor: selectedAppointment.doctor._id,
                rating:selectedAppointment.rating,
                patient:selectedAppointment.patient,
                review: selectedAppointment.reviewText,
              }),
            });
            const data = await res.json();
            if (res.status === 201) {
              toast.success("Review submitted successfully!");
              setShowReviewModal(false);
            } else {
              toast.error(data.message || "Failed to submit review");
            }
          } catch (err) {
            console.log(err);
            alert("Error submitting review.");
          }
        }



  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:8000/patient/appointments", {
          method: "GET",
          credentials: 'include',
        });
        const data = await res.json();
        if (res.status === 200) {
          setAppointments(data.data);
          let rejected=data.data.filter(doc=>doc.status=="rejected")
          let completed=data.data.filter(doc=>doc.status=="completed")
          let pending=data.data.filter(doc=>doc.status=="pending")

          setPending(pending)
          setRejected(rejected)
          setCompleted(completed)
        }
        if(res.status==401)
          navigate('/patient/login?alert=Session expired please login again !')
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  if (loading) return <Bubbles />;

  if (!appointments || appointments.length === 0)
    return <div className="no-appointments">No appointments found.</div>;

  return (
    <section className="pcontent-section">
      <div className="section-header">
        <h3>My Appointments</h3>

        <div className='choices'>
          <button  onClick={goto}  className={`choice ${
                      page === "rejected"? "act" : ""
                    }`}>Rejected</button>
          <button onClick={goto} className={`choice ${
                      page === "completed"? "act" : ""
                    }`} >Completed</button>
          <button onClick={goto} className={`choice ${
                      page === "pending"? "act" : ""
                    }`}>Pending</button>
        </div>

      </div>

  
<div className="appointments-container">

 {page === "rejected" && (
  <>
    {rejected.length === 0 ? (
      <div className='no'>No Rejected appointments</div>
    ) : (
      rejected.map((app) => (
        <div key={app._id} className="appointment-card">
          <div className="appointment-header">
            <img
              src={app.doctor.profilePic || "/default-doctor.png"}
              alt={app.doctor.name}
              className="doctor-image"
            />
            <div className="doctor-info">
              <h4>Dr. {app.doctor.name}</h4>
              <span className={`status ${app.status.toLowerCase()}`}>
                {app.status}
              </span>
            </div>
          </div>
          <p><strong>Speciality:</strong> {app.doctor.speciality || "-"}</p>
          <p><strong>Date:</strong> {new Date(app.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> {app.TimeSlot ? `${app.TimeSlot.StartTime} - ${app.TimeSlot.EndTime}` : "-"}</p>
          <p><strong>Fee:</strong> ₹{app.TimeSlot?.fee || app.doctor.fee || "-"}</p>
          <p><strong>Symptoms:</strong> {app.symptoms || "N/A"}</p>
          <p><strong>Day:</strong> {app.TimeSlot?.Day || "-"}</p>
        </div>
      ))
    )}
  </>
)}


 {page === "completed" &&(
  <>
  {completed.length===0? (
     <div className='no'>No Completed appointments</div>
    ) : (completed.map((app) => (
      <div key={app._id} className="appointment-card">
        <div className="appointment-header">
          <img
            src={app.doctor.profilePic || "/default-doctor.png"}
            alt={app.doctor.name}
            className="doctor-image"
          />
          <div className="doctor-info">
            <h4>Dr.{app.doctor.name}</h4>
            <span className={`status ${app.status.toLowerCase()}`}>{app.status}</span>
          </div>
        </div>

        <p><strong>Speciality:</strong> {app.doctor.speciality || "-"}</p>
        <p><strong>Date:</strong> {new Date(app.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> {app.TimeSlot ? `${app.TimeSlot.StartTime} - ${app.TimeSlot.EndTime}` : "-"}</p>
        <p><strong>Fee:</strong> ₹{app.TimeSlot?.fee || app.doctor.fee || "-"}</p>
        <p><strong>Symptoms:</strong> {app.symptoms || "N/A"}</p>
        <p><strong>Day:</strong> {app.TimeSlot?.Day || "-"}</p>

        <button
          className="add-review-btn"
          onClick={() => {
            setSelectedAppointment(app);
            setShowReviewModal(true);
          }}
        >
          Add Review
        </button>
      </div>
    )))
}
</>)}


  {page === "pending"&&(
    <>
      {
      pending.length===0?(
        <div className="no">No pending Appointments</div>):(pending.map((app) => (
        <div key={app._id} className="appointment-card">
          <div className="appointment-header">
            <img
              src={app.doctor.profilePic || "/default-doctor.png"}
              alt={app.doctor.name}
              className="doctor-image"
            />
            <div className="doctor-info">
              <h4>Dr.{app.doctor.name}</h4>
              <span className={`status ${app.status.toLowerCase()}`}>
                {app.status}
              </span>
            </div>
          </div>
          <p><strong>Speciality:</strong> {app.doctor.speciality || "-"}</p>
          <p><strong>Date:</strong> {new Date(app.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> {app.TimeSlot ? `${app.TimeSlot.StartTime} - ${app.TimeSlot.EndTime}` : "-"}</p>
          <p><strong>Fee:</strong> ₹{app.TimeSlot?.fee || app.doctor.fee || "-"}</p>
          <p><strong>Symptoms:</strong> {app.symptoms || "N/A"}</p>
          <p><strong>Day:</strong> {app.TimeSlot?.Day || "-"}</p>
        </div>
      )))}
    </>
  )}



</div>
{showReviewModal && selectedAppointment && (
  <div className="review-modal-overlay" onClick={() => setShowReviewModal(false)}>
    <div className="review-modal" onClick={(e) => e.stopPropagation()}>
      <button className="close-modal-btn" onClick={() => setShowReviewModal(false)}>×</button>
      <h3>Review Dr. {selectedAppointment.doctor.name}</h3>

      
      <div className="rating-input">
        <label>
          Rating: 
          <span style={{ color: "#f5c518", marginLeft: "5px" }}>★</span>
          <input
            type="number"
            min="1"
            max="5"
            value={selectedAppointment.rating || ""}
            onChange={(e) => {
              const updated = completed.map((a) =>
                a._id === selectedAppointment._id
                  ? { ...a, rating: Number(e.target.value) }
                  : a
              );
              setCompleted(updated);
              setSelectedAppointment({ ...selectedAppointment, rating: Number(e.target.value) });
            }}
            className="rating-field"
            style={{ marginLeft: "5px", width: "50px" }}
          />
        </label>
      </div>

      {/* Review textarea */}
      <textarea
        className="review-textarea"
        placeholder="Write your review here..."
        value={selectedAppointment.reviewText || ""}
        onChange={(e) => {
          const updated = completed.map((a) =>
            a._id === selectedAppointment._id ? { ...a, reviewText: e.target.value } : a
          );
          setCompleted(updated);
          setSelectedAppointment({ ...selectedAppointment, reviewText: e.target.value });
        }}
      ></textarea>

      <button
        className="submit-review-btn"
        onClick={submitreview}
      >
        Submit Review
      </button>
    </div>
  </div>
)}



    </section>
  );
}
