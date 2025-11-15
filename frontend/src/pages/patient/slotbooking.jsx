import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { PatientContext } from "./patientcontext";
import HeartLoader from "../../components/Loaders/heartloader";
import "../../css/slotbooking.css";

const formatDate = (date) => {
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function SlotBooking() {
  const { id: doctorId } = useParams();
  const navigate = useNavigate();
  const { doctors } = useContext(PatientContext);

  const [mode, setMode] = useState("offline");
  const [consultFee, setConsultFee] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [availabilityData, setAvailabilityData] = useState([]);
  const [selectedDayId, setSelectedDayId] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ----------------- DATE UTILITY ----------------- */
  const getNextDateForDay = (dayName) => {
    const today = new Date();
    const days = [
      "Sunday", "Monday", "Tuesday", "Wednesday",
      "Thursday", "Friday", "Saturday"
    ];
    const idx = days.indexOf(dayName);
    if (idx === -1) return null;

    const diff = (idx - today.getDay() + 7) % 7;
    const d = new Date(today);
    d.setDate(today.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  /* ----------------- FETCH DOCTOR ----------------- */
  useEffect(() => {
    if (!doctors || !doctorId) return;

    const doc = doctors.find((d) => d._id === doctorId);
    if (!doc) {
      setError("Doctor not found");
      setLoading(false);
      return;
    }

    setDoctorProfile(doc);
    setLoading(false);
  }, [doctors, doctorId]);

  /* ----------------- FETCH SLOTS ----------------- */
  useEffect(() => {
    if (!doctorId) return;

    let run = true;

    const fetchSlots = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8000/patient/allslots", {
          headers: { "Content-Type": "application/json", doctorid: doctorId },
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch slots");

        const data = await res.json();
        const grouped = {};

        (data.timeslots || []).forEach((slot) => {
          if (slot.status?.toLowerCase() !== "available") return;

          const mode = slot.mode?.toLowerCase() || "offline";
          const hour = parseInt(slot.StartTime.split(":")[0], 10);

          let period = "Morning";
          if (hour >= 12 && hour < 17) period = "Afternoon";
          else if (hour >= 17) period = "Evening";

          const key = slot.Day.toLowerCase();

          if (!grouped[key]) {
            const nextDateObj = getNextDateForDay(slot.Day);
            grouped[key] = {
              id: key,
              dayName: slot.Day,
              dateObj: nextDateObj,
              date: formatDate(nextDateObj),
              offline: { Morning: [], Afternoon: [], Evening: [] },
              online: { Morning: [], Afternoon: [], Evening: [] },
            };
          }

          grouped[key][mode][period].push({
            start: slot.StartTime,
            label: `${slot.StartTime} - ${slot.EndTime}`,
            fee: slot.fee ?? doctorProfile?.fee,
            limit: slot.limit ?? 0,
            booked: slot.booked ?? 0,
          });
        });

        if (!run) return;

        const arr = Object.values(grouped).sort(
          (a, b) => a.dateObj - b.dateObj
        );

        setAvailabilityData(arr);

        // pick first day with any slots
        const first = arr.find((d) => {
          const m = d[mode];
          return (
            m.Morning.length + m.Afternoon.length + m.Evening.length > 0
          );
        });

        setSelectedDayId(first ? first.id : "");
      } catch (err) {
        if (run) setError(err.message);
      } finally {
        run && setLoading(false);
      }
    };

    fetchSlots();
    return () => (run = false);
  }, [doctorId, doctorProfile]);

  /* ----------------- HELPERS ----------------- */
  const isFutureSlot = (start) => {
    const now = new Date();
    const [h, m] = start.split(":").map(Number);
    const slotTime = new Date();
    slotTime.setHours(h, m, 0, 0);
    return slotTime > now;
  };

  const selectedDayData = availabilityData.find(
    (d) => d.id === selectedDayId
  );

  const isToday =
    selectedDayData &&
    selectedDayData.dateObj.toDateString() === new Date().toDateString();

  const modeSlots = selectedDayData ? selectedDayData[mode] : null;

  const countFutureSlots = (dayObj) => {
    if (!dayObj) return 0;

    let count = 0;
    ["Morning", "Afternoon", "Evening"].forEach((p) => {
      const list = dayObj[mode][p] || [];
      if (dayObj.dateObj.toDateString() === new Date().toDateString()) {
        count += list.filter((s) => isFutureSlot(s.start)).length;
      } else {
        count += list.length;
      }
    });

    return count;
  };

  const todaySlots = countFutureSlots(selectedDayData);

  /* ---------------- BOOK ---------------- */
  const goto = () => {
    if (!selectedSlot || !selectedDayData) return;

    const appt = {
      doctorId: doctorProfile._id,
      doctorName: doctorProfile.name,
      mode,
      fee: consultFee ?? doctorProfile.fee,
      date: selectedDayData.date,
      dayName: selectedDayData.dayName,
      timeSlot: selectedSlot.start,
    };

    localStorage.setItem("appointment", JSON.stringify(appt));
    navigate("/patient/appointment/form");
  };

  /* ---------------- RENDER ---------------- */
  if (loading) return <HeartLoader />;
  if (error) return <p className="booking-card-error">{error}</p>;

  return (
    <div className="booking-card">

      {/* ---------- DOCTOR HEADER ---------- */}
      <header className="doctor-header">
        <div className="doctor-left">
          <img
            src={doctorProfile.profilePic}
            className="doctor-avatar"
            alt="doc"
          />
        </div>

        <div className="doctor-main">
          <h1 className="doctor-name">
            {doctorProfile.name}
            <Link to={`/patient/${doctorId}`} className="info-icon-slot">
              view profile
            </Link>
          </h1>

          <p className="doctor-sub">
            {doctorProfile.speciality} • {doctorProfile.experience} yrs
          </p>
        </div>

        <aside className="doctor-side">
          <div className="price-label">Consultation Fee</div>
          <div className="price-val">
            ₹{consultFee ?? doctorProfile.fee}
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

      {/* ---------- MODE SWITCH ---------- */}
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

      {/* ---------- DAY TABS ---------- */}
      <div className="date-tabs">
        {availabilityData.map((day) => {
          const futureCount = countFutureSlots(day);
          const selected = selectedDayId === day.id;

          return (
            <div
              key={day.id}
              className={`tab ${selected ? "selected" : ""}`}
              onClick={() => {
                setSelectedDayId(day.id);
                setSelectedSlot(null);
                setConsultFee(null);
              }}
            >
              <span className="day-date">{day.date}</span>
              <strong>{day.dayName}</strong>
              <span>{futureCount} slots</span>
            </div>
          );
        })}
      </div>

      {/* ---------- SLOTS LIST ---------- */}
      <div className="availability-details">
        <h3 className="slots-title">Slots Available</h3>

        {todaySlots === 0 ? (
          <p className="no-slots">No slots available for today</p>
        ) : (
          ["Morning", "Afternoon", "Evening"].map((period) => {
            const visible =
              modeSlots[period]
                ?.filter((s) => !isToday || isFutureSlot(s.start))
                .sort((a, b) => {
                  const [h1, m1] = a.start.split(":").map(Number);
                  const [h2, m2] = b.start.split(":").map(Number);
                  return h1 * 60 + m1 - (h2 * 60 + m2);
                }) || [];

            if (visible.length === 0) return null;

            return (
              <div key={period} className="time-period">
                <h4 className="time-title">{period}</h4>

                <div className="slots-grid">
                  {visible.map((slot) => {
                    const left = Math.max(0, slot.limit - slot.booked);

                    return (
                      <button
                        key={slot.start}
                        className={`slot-btn ${
                          selectedSlot?.start === slot.start
                            ? "slot-selected"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedSlot(slot);
                          setConsultFee(slot.fee);
                        }}
                      >
                        <div className="slot-label">
                          {mode === "online" ? slot.start : slot.label}
                        </div>

                        {mode === "offline" && (
                          <div className="slot-info">{left} left</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
