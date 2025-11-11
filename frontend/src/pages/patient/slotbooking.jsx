import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { PatientContext } from "./patientcontext";
import HeartLoader from "../../components/Loaders/heartloader";
import "../../css/slotbooking.css";
import DayTabs from "../../components/Swiper/swiper";

const formatDate = (date) => {
  if (!date) return "";
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
    const dayIndex = days.indexOf(dayName);
    if (dayIndex === -1) return null;
    const diff = (dayIndex - today.getDay() + 7) % 7;
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + diff);
    nextDate.setHours(0, 0, 0, 0);
    return nextDate;
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

          const slotMode = (slot.mode || "offline").toLowerCase();
          const hour = parseInt(String(slot.StartTime).split(":")[0], 10);
          let period = "Morning";
          if (hour >= 12 && hour < 17) period = "Afternoon";
          else if (hour >= 17) period = "Evening";

          const key = (slot.Day || "unknown").toLowerCase();
          if (!grouped[key]) {
            const nextDateObj = getNextDateForDay(slot.Day || key);
            if (!nextDateObj) return;

            grouped[key] = {
              id: key,
              dayName: slot.Day || key,
              date: formatDate(nextDateObj),
              dateObj: nextDateObj,
              offline: { Morning: [], Afternoon: [], Evening: [] },
              online: { Morning: [], Afternoon: [], Evening: [] },
            };
          }

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
        arr.sort((a, b) => a.dateObj - b.dateObj);
        setAvailabilityData(arr);

        const firstWithMode = arr.find(
          (d) =>
            d[mode] &&
            (d[mode].Morning.length +
              d[mode].Afternoon.length +
              d[mode].Evening.length) >
              0
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
  }, [doctorId, doctorProfile]);

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
        setSelectedSlot(null);
        setConsultFee(null);
      }
    }
  }, [mode, availabilityData, selectedDayId]);

  const hasOnlineSlots = availabilityData.some(
    (d) =>
      d.online.Morning.length +
        d.online.Afternoon.length +
        d.online.Evening.length >
      0
  );
  const hasOfflineSlots = availabilityData.some(
    (d) =>
      d.offline.Morning.length +
        d.offline.Afternoon.length +
        d.offline.Evening.length >
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

  const selectedDayData =
    availabilityData.find((d) => d.id === selectedDayId) || null;
  const modeSlots = selectedDayData ? selectedDayData[mode] : null;

  const isToday = selectedDayData
    ? selectedDayData.dateObj.toDateString() === new Date().toDateString()
    : false;

  // 🔹 Filter helper: only keep slots that are future if today
  const isFutureSlot = (slotLabel) => {
    const [startTime] = slotLabel.split("-");
    const [hours, minutes] = startTime.trim().split(":").map(Number);
    const now = new Date();
    const slotTime = new Date();
    slotTime.setHours(hours, minutes, 0, 0);
    return slotTime > now;
  };

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
            <Link
              to={`/patient/${doctorId}`}
              className="info-icon-slot"
              title="View Profile"
            >
              view profile
            </Link>
          </h1>

          <p className="doctor-sub">
            {doctorProfile.speciality} • {doctorProfile.experience} yrs
            experience
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
          <button
            className="btn-primary"
            onClick={goto}
            disabled={!selectedSlot}
          >
            Book Appointment
          </button>
        </aside>
      </header>

      <div className="mode-toggle" role="tablist">
        <button
          className={mode === "offline" ? "active" : ""}
          onClick={() => setMode("offline")}
          disabled={!hasOfflineSlots}
        >
          Offline
        </button>
        <button
          className={mode === "online" ? "active" : ""}
          onClick={() => setMode("online")}
          disabled={!hasOnlineSlots}
        >
          Online
        </button>
      </div>

      <div className="availability-details">
        <h3 className="slots-title">Slots Available</h3>

        <DayTabs
          availabilityData={availabilityData}
          mode={mode}
          selectedDayId={selectedDayId}
          setSelectedDayId={setSelectedDayId}
          setSelectedSlot={setSelectedSlot}
          setConsultFee={setConsultFee}
        />

        {modeSlots ? (
          ["Morning", "Afternoon", "Evening"]
            // ✅ Filter out periods that have no slots left after filtering expired ones
            .map((period) => {
              const visibleSlots = modeSlots[period]
                ?.filter((slot) => !isToday || isFutureSlot(slot.label))
                .sort((a, b) => {
                  const startA = a.label.split("-")[0].trim();
                  const startB = b.label.split("-")[0].trim();
                  const [hourA, minA] = startA.split(":").map(Number);
                  const [hourB, minB] = startB.split(":").map(Number);
                  return hourA * 60 + minA - (hourB * 60 + minB);
                }) || [];

              if (visibleSlots.length === 0) return null; // ✅ hide period entirely

              return (
                <div key={period} className="time-period">
                  <h4 className="time-title">{period}</h4>
                  <div className="slots-grid">
                    {visibleSlots.map((slot) => (
                      <button
                        key={slot.label}
                        className={`slot-btn ${
                          selectedSlot?.label === slot.label
                            ? "slot-selected"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedSlot(slot);
                          setConsultFee(slot.fee);
                        }}
                      >
                        <div className="slot-label">{slot.label}</div>
                        <div className="slot-info">
                          {mode === "offline" && (
                            <span>
                              {Math.max(
                                0,
                                (slot.limit || 0) - (slot.booked || 0)
                              )}{" "}
                              left
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })
            .filter(Boolean) // remove nulls
        ) : (
          <p>No slots for this day.</p>
        )}
      </div>
    </div>
  );
}
