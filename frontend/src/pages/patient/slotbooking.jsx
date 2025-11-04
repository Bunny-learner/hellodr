import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { PatientContext } from "./patientcontext";
import HeartLoader from "../../components/Loaders/heartloader";
import "../../css/slotbooking.css";
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
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const diff = (days.indexOf(dayName) - today.getDay() + 7) % 7;
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + diff);
    return nextDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // load doctor profile from context if available
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

  // fetch slots (offline + online) once and group them
  useEffect(() => {
    if (!doctorId) return;

    let mounted = true;
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
        (data.timeslots || []).forEach((slot) => {
          if (slot.status?.toLowerCase() !== "available") return;

          // normalize mode to lowercase: 'online' or 'offline'
          const slotMode = (slot.mode || "offline").toString().toLowerCase();

          // determine period
          const hour = parseInt(String(slot.StartTime).split(":")[0], 10);
          let period = "Morning";
          if (hour >= 12 && hour < 17) period = "Afternoon";
          else if (hour >= 17) period = "Evening";

          const key = (slot.Day || "unknown").toString().toLowerCase();
          if (!grouped[key]) {
            grouped[key] = {
              id: key,
              dayName: slot.Day || key,
              date: getNextDateForDay(slot.Day || key),
              offline: { Morning: [], Afternoon: [], Evening: [] },
              online: { Morning: [], Afternoon: [], Evening: [] },
            };
          }

          // ensure we only push into known mode buckets
          const targetModeBucket = slotMode === "online" ? "online" : "offline";

          grouped[key][targetModeBucket][period].push({
            label: `${slot.StartTime} - ${slot.EndTime}`,
            fee: slot.fee ?? doctorProfile?.fee ?? 0,
            limit: slot.limit ?? 0,
            booked: slot.booked ?? 0,
            raw: slot,
          });
        });

        if (!mounted) return;

        const arr = Object.values(grouped);
        setAvailabilityData(arr);

        // pick initial selectedDayId:
        // prefer first day that has slots for current mode,
        // else fallback to first day available
        const firstWithMode = arr.find(
          (d) =>
          (d[mode] &&
            (d[mode].Morning.length +
              d[mode].Afternoon.length +
              d[mode].Evening.length) >
            0)
        );
        if (firstWithMode) setSelectedDayId(firstWithMode.id);
        else if (arr.length > 0) setSelectedDayId(arr[0].id);
        else setSelectedDayId("");
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Unknown error");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchSlots();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, doctorProfile]); // we don't re-fetch on mode; we fetch all and then show mode buckets

  // when mode changes, if current selected day has no slots for that mode,
  // auto-select the first day that DOES have slots in that mode (improves UX)
  useEffect(() => {
    if (!availabilityData || availabilityData.length === 0) return;

    const current = availabilityData.find((d) => d.id === selectedDayId);
    const hasInCurrent =
      current &&
      (current[mode].Morning.length +
        current[mode].Afternoon.length +
        current[mode].Evening.length) >
      0;

    if (!hasInCurrent) {
      const firstWithMode = availabilityData.find(
        (d) =>
          (d[mode].Morning.length +
            d[mode].Afternoon.length +
            d[mode].Evening.length) >
          0
      );
      if (firstWithMode) {
        setSelectedDayId(firstWithMode.id);
        setSelectedSlot(null);
        setConsultFee(null);
      } else {
        // no days have this mode -> keep selectedDayId but clear slot
        setSelectedSlot(null);
        setConsultFee(null);
      }
    } else {
      // current day has slots for this mode -> do nothing
    }
  }, [mode, availabilityData, selectedDayId]);

  // helper: does there exist any day with online slots?
  const hasOnlineSlots = availabilityData.some(
    (d) =>
      (d.online.Morning.length + d.online.Afternoon.length + d.online.Evening.length) >
      0
  );
  const hasOfflineSlots = availabilityData.some(
    (d) =>
      (d.offline.Morning.length +
        d.offline.Afternoon.length +
        d.offline.Evening.length) >
      0
  );

  const goto = () => {
    if (!selectedSlot || !doctorProfile) return;
    const selectedDayData = availabilityData.find((d) => d.id === selectedDayId);
    if (!selectedDayData) return;

    const appointmentData = {
      doctorId: doctorProfile._id,
      doctorName: doctorProfile.name,
      mode,
      fee: consultFee ?? doctorProfile.fee,
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

  const selectedDayData = availabilityData.find((d) => d.id === selectedDayId) || null;
  const modeSlots = selectedDayData ? selectedDayData[mode] : null;

  return (
    <div className="booking-card" id="book">
      <header className="doctor-header">
        <div className="doctor-left">
          <img
            src={doctorProfile.profilePic}
            alt={doctorProfile.name}
            className="doctor-avatar"
          />
        </div>

        <div className="doctor-main">
          <h1 className="doctor-name">
            {doctorProfile.name}{" "}
            <Link to={`/patient/${doctorId}`} className="info-icon-slot" title="View Profile">
              view profile
            </Link>
          </h1>

          <p className="doctor-sub">
            {doctorProfile.speciality} • {doctorProfile.experience} yrs experience
          </p>

          <div className="doctor-meta-grid" style={{ marginTop: 8 }}>
            <div className="meta-item">
              <span className="meta-key">🏥 Hospital</span>
              <span className="meta-val">{doctorProfile.hospital}</span>
            </div>
            <div className="meta-item">
              <span className="meta-key">⭐ Rating</span>
              <span className="meta-val">{doctorProfile.rating ?? "N/A"}</span>
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
          <button className="btn-primary" onClick={goto} disabled={!selectedSlot}>
            Book Appointment
          </button>
        </aside>
      </header>

      <div className="mode-toggle" role="tablist" aria-label="mode toggle">
        <button
          className={mode === "offline" ? "active" : ""}
          onClick={() => setMode("offline")}
          disabled={!hasOfflineSlots}
          title={hasOfflineSlots ? "Show offline slots" : "No offline slots available"}
        >
          Offline
        </button>

        <button
          className={mode === "online" ? "active" : ""}
          onClick={() => setMode("online")}
          disabled={!hasOnlineSlots}
          title={hasOnlineSlots ? "Show online slots" : "No online slots available"}
        >
          Online
        </button>
      </div>

      <div className="availability-details">
        <h3 className="slots-title">Slots Available</h3>

        <div className="date-tabs">
          {availabilityData.map((day) => {
            const count =
              (day[mode].Morning.length || 0) +
              (day[mode].Afternoon.length || 0) +
              (day[mode].Evening.length || 0);
            return (
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
                <span style={{ fontSize: 12, color: "#666" }}>
                  {count > 0 ? `${count} slots` : "no slots"}
                </span>
              </div>
            );
          })}
        </div>

        {modeSlots ? (
          ["Morning", "Afternoon", "Evening"]
          .filter((period) => modeSlots[period]?.length > 0)
          .map((period) => (
            <div key={period} className="time-period">
              <h4 className="time-title">
                {period === "Morning" && <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 122.88"><defs><style>{".cls-1{fill:#fcdb33;}"}</style></defs><title>sun-color</title><path class="cls-1" d="M30,13.21A3.93,3.93,0,1,1,36.8,9.27L41.86,18A3.94,3.94,0,1,1,35.05,22L30,13.21Zm31.45,13A35.23,35.23,0,1,1,36.52,36.52,35.13,35.13,0,0,1,61.44,26.2ZM58.31,4A3.95,3.95,0,1,1,66.2,4V14.06a3.95,3.95,0,1,1-7.89,0V4ZM87.49,10.1A3.93,3.93,0,1,1,94.3,14l-5.06,8.76a3.93,3.93,0,1,1-6.81-3.92l5.06-8.75ZM109.67,30a3.93,3.93,0,1,1,3.94,6.81l-8.75,5.06a3.94,3.94,0,1,1-4-6.81L109.67,30Zm9.26,28.32a3.95,3.95,0,1,1,0,7.89H108.82a3.95,3.95,0,1,1,0-7.89Zm-6.15,29.18a3.93,3.93,0,1,1-3.91,6.81l-8.76-5.06A3.93,3.93,0,1,1,104,82.43l8.75,5.06ZM92.89,109.67a3.93,3.93,0,1,1-6.81,3.94L81,104.86a3.94,3.94,0,0,1,6.81-4l5.06,8.76Zm-28.32,9.26a3.95,3.95,0,1,1-7.89,0V108.82a3.95,3.95,0,1,1,7.89,0v10.11Zm-29.18-6.15a3.93,3.93,0,0,1-6.81-3.91l5.06-8.76A3.93,3.93,0,1,1,40.45,104l-5.06,8.75ZM13.21,92.89a3.93,3.93,0,1,1-3.94-6.81L18,81A3.94,3.94,0,1,1,22,87.83l-8.76,5.06ZM4,64.57a3.95,3.95,0,1,1,0-7.89H14.06a3.95,3.95,0,1,1,0,7.89ZM10.1,35.39A3.93,3.93,0,1,1,14,28.58l8.76,5.06a3.93,3.93,0,1,1-3.92,6.81L10.1,35.39Z" /></svg>}{""}
                {period === "Afternoon" && <svg xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 512 365.51"><path fill="#FFC106" fill-rule="nonzero" d="M284.02 14.56c-1.62-6.19 2.11-12.55 8.3-14.18 6.2-1.62 12.55 2.09 14.18 8.3l7.51 28.87c1.63 6.2-2.1 12.55-8.3 14.18-6.2 1.62-12.55-2.09-14.17-8.3l-7.52-28.87zm79.26 61.61c27.67 7.63 49.62 25.75 62.76 48.89 13.12 23.15 17.43 51.3 9.8 78.97-6.73 24.4-21.62 44.34-40.91 57.72-.69-8.68-2.51-17.24-5.36-25.37-4.83-13.8-12.63-26.45-22.89-36.56-17.62-17.37-42.25-27.31-71.41-23.06-11.94-23.35-29.76-40.42-50.29-51.32 9.41-16.77 23.14-30.28 39.33-39.48 23.15-13.12 51.3-17.43 78.97-9.79zm8.54-65.74c1.71-6.2 8.12-9.84 14.33-8.13 6.19 1.71 9.84 8.12 8.12 14.32l-7.93 28.76c-1.71 6.2-8.12 9.84-14.32 8.12-6.2-1.71-9.84-8.12-8.13-14.32l7.93-28.75zm78.15 40.37c4.55-4.49 11.89-4.45 16.4.09 4.49 4.55 4.46 11.89-.09 16.4l-21.26 20.93c-4.54 4.5-11.88 4.46-16.39-.09-4.5-4.55-4.46-11.89.09-16.39l21.25-20.94zm47.47 73.97c6.19-1.62 12.55 2.11 14.17 8.3 1.64 6.2-2.08 12.55-8.29 14.18l-28.87 7.51c-6.2 1.63-12.54-2.1-14.18-8.3-1.62-6.19 2.09-12.55 8.3-14.18l28.87-7.51zm4.13 87.8c6.21 1.71 9.84 8.12 8.13 14.33-1.71 6.19-8.12 9.83-14.32 8.12l-28.76-7.93c-6.2-1.71-9.84-8.12-8.12-14.32 1.71-6.2 8.12-9.84 14.32-8.13l28.75 7.93zm-40.37 78.15c4.49 4.55 4.45 11.89-.09 16.4-4.55 4.49-11.89 4.46-16.4-.09l-20.93-21.25c-4.5-4.55-4.46-11.89.09-16.4 4.55-4.5 11.89-4.46 16.4.09l20.93 21.25zM210.05 62.03c-4.49-4.55-4.45-11.89.1-16.4 4.54-4.49 11.88-4.46 16.39.09l20.93 21.26c4.5 4.54 4.46 11.88-.09 16.39-4.54 4.5-11.89 4.46-16.39-.09l-20.94-21.25z" /><path fill="#FFD205" fill-rule="nonzero" d="M363.28 76.17c22.11 6.1 40.57 18.9 53.8 35.6l-108.64 64.02c-4.28 0-8.67.32-13.17.97-11.94-23.35-29.76-40.42-50.29-51.32 9.41-16.77 23.14-30.28 39.33-39.48 23.15-13.12 51.3-17.43 78.97-9.79z" /><path fill="#257FC4" fill-rule="nonzero" d="M295.27 176.76c29.16-4.25 53.79 5.69 71.41 23.06 10.26 10.11 18.06 22.76 22.89 36.56 4.8 13.7 6.69 28.59 5.16 43.29-3.09 29.69-19.87 58.54-54.28 75.42-21.23 10.41-30.41 10.4-51.03 10.38l-2.79-.01v.05H94.85v-.05l-4.7.02c-13.65.09-23.41.15-38.31-5.93-20.29-8.27-35.18-23.4-43.67-41.23-6.5-13.64-9.24-28.94-7.79-44 1.46-15.18 7.19-30.07 17.63-42.79 11.62-14.17 28.98-25.52 52.6-31.26 7.14-27.8 22.17-49.25 41.42-64.19 18.13-14.07 39.99-22.26 62.47-24.43 22.37-2.16 45.42 1.66 66.08 11.56 22.38 10.74 41.9 28.55 54.69 53.55z" /><path fill="#88DFF3" d="M301.96 188.95c80.38-6.7 116.19 113.75 32.85 154.62-19.45 9.54-27.59 9.06-48.18 9.06H94.85c-14.77 0-23.95.8-38.18-5-60.22-24.56-64.16-120.88 24.66-136.46 19.68-103.57 155.23-116.4 201.37-30.65-6.01 2.12-11.81 4.86-17.34 8.13-11.68 6.92-22.15 16.27-30.6 27.28-2.16 2.82-1.61 6.85 1.2 9 2.82 2.16 6.86 1.61 9.01-1.2 7.44-9.69 16.66-17.92 26.93-24.01 9.35-5.53 19.55-9.29 30.06-10.77z" /><path fill="#A3EDFD" d="M302.26 188.91c21.34-1.7 39.52 5.58 53.15 17.93 12.26 41.37-5.41 92.97-69.91 107.94H52.6c-15.12-1.92-27.82-7.8-37.79-16.13-8.57-35.78 10.55-77.66 66.52-87.48 19.68-103.58 155.23-116.41 201.37-30.65-6 2.12-11.81 4.86-17.34 8.13-11.68 6.92-22.15 16.27-30.6 27.28-2.16 2.82-1.61 6.85 1.2 9 2.82 2.16 6.86 1.61 9.01-1.2 7.44-9.69 16.66-17.92 26.93-24.01 9.44-5.58 19.75-9.37 30.36-10.81z" /><path fill="#fff" d="M249.95 175.64c.65-34.22-82-54.98-116.18-1.08 37.02-21.42 81.45-21.33 116.18 1.08z" /></svg>}{" "}
                {period === "Evening" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 122.88 122.89"
                    className="w-6 h-6"
                  >
                    <path d="M49.06,1.27c2.17-0.45,4.34-0.77,6.48-0.98c2.2-0.21,4.38-0.31,6.53-0.29c1.21,0.01,2.18,1,2.17,2.21 c-0.01,0.93-0.6,1.72-1.42,2.03c-9.15,3.6-16.47,10.31-20.96,18.62c-4.42,8.17-6.1,17.88-4.09,27.68l0.01,0.07 c2.29,11.06,8.83,20.15,17.58,25.91c8.74,5.76,19.67,8.18,30.73,5.92l0.07-0.01c7.96-1.65,14.89-5.49,20.3-10.78 c5.6-5.47,9.56-12.48,11.33-20.16c0.27-1.18,1.45-1.91,2.62-1.64c0.89,0.21,1.53,0.93,1.67,1.78c2.64,16.2-1.35,32.07-10.06,44.71 c-8.67,12.58-22.03,21.97-38.18,25.29c-16.62,3.42-33.05-0.22-46.18-8.86C14.52,104.1,4.69,90.45,1.27,73.83 C-2.07,57.6,1.32,41.55,9.53,28.58C17.78,15.57,30.88,5.64,46.91,1.75c0.31-0.08,0.67-0.16,1.06-0.25l0.01,0l0,0L49.06,1.27 L49.06,1.27z" />
                  </svg>
                )}
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
                        {mode === "offline" && (
                          <span>{Math.max(0, (slot.limit || 0) - (slot.booked || 0))} left</span>
                        )}
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
