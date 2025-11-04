import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PatientContext } from "./patientcontext";
import { Link } from "react-router-dom";
import HeartLoader from "../../components/Loaders/heartloader";
import "../../css/slotbooking.css";
import { FaStar, FaInfoCircle } from "react-icons/fa";
import { FaSun, FaCloudSun, FaMoon } from "react-icons/fa";

export default function SlotBooking() {
  const { id: doctorId } = useParams();
  const navigate = useNavigate();
  const { doctors } = useContext(PatientContext);

  const [mode, setMode] = useState("offline"); // "offline" or "online"
  const [consultFee, setConsultFee] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [availabilityData, setAvailabilityData] = useState([]);
  const [selectedDayId, setSelectedDayId] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getNextDateForDay = (dayName) => {
    const today = new Date();
    const days = [
      "Sunday", "Monday", "Tuesday", "Wednesday",
      "Thursday", "Friday", "Saturday",
    ];
    const diff =
      (days.indexOf(dayName) - today.getDay() + 7) % 7;
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + diff);
    return nextDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  useEffect(() => {
    if (!doctors || !doctorId) return;
    const doctor = doctors.find((d) => d._id === doctorId);
    if (doctor) {
      setDoctorProfile(doctor);
      setLoading(false);
    } else {
      setError("Doctor not found");
      setLoading(false);
    }
  }, [doctors, doctorId]);

  useEffect(() => {
    if (!doctorId) return;

    const fetchSlots = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:8000/patient/allslots`, {
          headers: { "Content-Type": "application/json", doctorid: doctorId },
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch time slots");
        const data = await res.json();

        const grouped = {};
        data.timeslots.forEach((slot) => {
          if (slot.status?.toLowerCase() !== "available") return;

          // Determine morning / afternoon / evening
          const hour = parseInt(slot.StartTime.split(":")[0], 10);
          let period = "Morning";
          if (hour >= 12 && hour < 17) period = "Afternoon";
          else if (hour >= 17) period = "Evening";

          const key = slot.Day.toLowerCase();
          if (!grouped[key]) grouped[key] = {
            id: key,
            dayName: slot.Day,
            date: getNextDateForDay(slot.Day),
            offline: { Morning: [], Afternoon: [], Evening: [] },
            online: { Morning: [], Afternoon: [], Evening: [] },
          };

          grouped[key][slot.mode || "offline"][period].push({
            label: `${slot.StartTime} - ${slot.EndTime}`,
            fee: slot.fee || doctorProfile?.fee || 0,
            limit: slot.limit,
            booked: slot.booked,
          });
        });

        setAvailabilityData(Object.values(grouped));
        if (Object.keys(grouped).length > 0)
          setSelectedDayId(Object.keys(grouped)[0]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, [doctorId, doctorProfile]);

  const goto = () => {
    if (!selectedSlot || !doctorProfile) return;
    const selectedDayData = availabilityData.find((d) => d.id === selectedDayId);
    if (!selectedDayData) return;

    const appointmentData = {
      doctorId: doctorProfile._id,
      doctorName: doctorProfile.name,
      mode,
      fee: consultFee || doctorProfile.fee,
      date: selectedDayData.date,
      dayName: selectedDayData.dayName,
      timeSlot: selectedSlot.label.split(" - ")[0],
    };

    localStorage.setItem("appointment", JSON.stringify(appointmentData));
    navigate("/patient/appointment/form");
  };

  if (loading) return <HeartLoader />;
  if (error) return <p className="booking-card-error">{error}</p>;
  if (!doctorProfile) return null;

  const selectedDayData = availabilityData.find((d) => d.id === selectedDayId);
  const modeSlots = selectedDayData ? selectedDayData[mode] : null;

  return (
    <div className="booking-card" id="book">
      <header  className="doctor-header">
        <div className="doctor-left">
          <img
            src={doctorProfile.profilePic}
            alt={doctorProfile.name}
            className="doctor-avatar"
          />
        </div>

        <div className="doctor-main">
          <div className="doctor-info">
             
              <h1 className="doctor-name">
              {doctorProfile.name}  <Link to={`/patient/${doctorId}`} className="info-icon-slot" title="View Profile">
               view profile
              </Link></h1>
            
            

            <p className="doctor-sub">
              {doctorProfile.speciality} • {doctorProfile.experience} yrs experience
            </p>
            <div className="doctor-meta-grid">
              <div className="meta-item">
                <span className="meta-key">🏥 Hospital</span>
                <span className="meta-val">{doctorProfile.hospital}</span>
              </div>
              <div className="meta-item">
                <span className="meta-key">⭐ Rating</span>
                <span className="meta-val">{doctorProfile.rating || "N/A"}</span>
              </div>
            </div>
          </div>


        </div>

        <aside className="doctor-side">
          <div className="price">
            <div className="price-label">Consultation Fee</div>
            <div className="price-val">
              ₹{consultFee !== null ? consultFee : doctorProfile.fee}
            </div>
          </div>
          <button
            className="btn-primary"
            onClick={goto}
            disabled={!selectedSlot}
          >
            Book Appointment
          </button>
        </aside>
      </header>



      <div className="mode-toggle">
        <button
          className={mode === "offline" ? "active" : ""}
          onClick={() => setMode("offline")}
        >
          Offline
        </button>
        <button
          className={mode === "online" ? "active" : ""}
          onClick={() => setMode("online")}
        >
          Online
        </button>
      </div>

      {/* 📅 Availability */}
      <div className="availability-details">
        <h3 className="slots-title">Slots Available</h3>
        <div className="date-tabs">
          {availabilityData.map((day) => (
            <div
              key={day.id}
              className={`tab ${day.id === selectedDayId ? "selected" : ""}`}
              onClick={() => {
                setSelectedDayId(day.id);
                setSelectedSlot(null);
                setConsultFee(null);
              }}
            >
              <span className="day-date">{day.date}</span>
              <strong>{day.dayName}</strong>
            </div>
          ))}
        </div>

        {/* 🕓 Slots by time period */}
        {modeSlots ? (
          ["Morning", "Afternoon", "Evening"].map((period) => (
            <div key={period} className="time-period">
              <h4 className="time-title">
                {period === "Morning" && <FaSun />}{" "}
                {period === "Afternoon" && <FaCloudSun />}{" "}
                {period === "Evening" && <FaMoon />}{" "}
                {period}
              </h4>

              {modeSlots[period].length > 0 ? (
                <div className="slots-grid">
                  {modeSlots[period].map((slot) => (
                    <button
                      key={slot.label}
                      className={`slot-btn ${selectedSlot?.label === slot.label ? "slot-selected" : ""
                        }`}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setConsultFee(slot.fee);
                      }}
                    >
                      <div className="slot-label">{slot.label}</div>
                      <div className="slot-info">
                        <span>{slot.limit - slot.booked} left</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="no-slots">No {period.toLowerCase()} slots</p>
              )}
            </div>
          ))
        ) : (
          <p>No slots for this day.</p>
        )}
      </div>
    </div>
  );
}
