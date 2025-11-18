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
      "Sunday", "Monday", "Tuesday", "Wednesday",
      "Thursday", "Friday", "Saturday",
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

          const targetBucket = slotMode === "online" ? "online" : "offline";
          grouped[key][targetBucket][period].push({
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

        const firstDayWithMode = arr.find(
          (d) =>
            d[mode].Morning.length +
              d[mode].Afternoon.length +
              d[mode].Evening.length >
            0
        );

        if (firstDayWithMode) setSelectedDayId(firstDayWithMode.id);
        else if (arr.length > 0) setSelectedDayId(arr[0].id);
        else setSelectedDayId("");

      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Unknown error occurred.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchSlots();
    return () => {
      mounted = false;
    };
  }, [doctorId, doctorProfile]);


  useEffect(() => {
    if (!availabilityData.length) return;

    const current = availabilityData.find((d) => d.id === selectedDayId);
    const currentHasSlots =
      current &&
      (current[mode].Morning.length +
        current[mode].Afternoon.length +
        current[mode].Evening.length >
        0);

    if (!currentHasSlots) {
      const firstValid = availabilityData.find(
        (d) =>
          d[mode].Morning.length +
            d[mode].Afternoon.length +
            d[mode].Evening.length >
          0
      );
      if (firstValid) {
        setSelectedDayId(firstValid.id);
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
    const dayData = availabilityData.find((d) => d.id === selectedDayId);
    if (!dayData) return;

    const appointmentData = {
      doctorId: doctorProfile._id,
      doctorName: doctorProfile.name,
      mode,
      fee: consultFee ?? doctorProfile.fee,
      date: dayData.date,
      dayName: dayData.dayName,
      timeSlot: selectedSlot.label.split(" - ")[0],
    };

    localStorage.setItem("appointment", JSON.stringify(appointmentData));
    navigate("/patient/appointment/form");
  };


  if (loading) return <HeartLoader />;
  if (error) return <p className="booking-card-error">{error}</p>;
  if (!doctorProfile) return null;


  const selectedDayData = availabilityData.find(
    (d) => d.id === selectedDayId
  );

  const modeSlots = selectedDayData ? selectedDayData[mode] : null;

  const isToday =
    selectedDayData?.dateObj.toDateString() === new Date().toDateString();

  const isFutureSlot = (slotLabel) => {
    const [startTime] = slotLabel.split("-");
    const [hours, minutes] = startTime.trim().split(":").map(Number);
    const now = new Date();
    const slotTime = new Date();
    slotTime.setHours(hours, minutes, 0, 0);
    return slotTime > now;
  };


  return (
    <div className="booking-page-container">
      <button onClick={() => navigate(-1)} className="back-button">
        &larr; Back
      </button>

      <div className="booking-layout">
        <div className="booking-main">
          
          <div className="booking-doctor-header">
            <img
              src={doctorProfile.profilePic}
              alt={doctorProfile.name}
              className="doctor-avatar"
            />
            <div className="doctor-main">
              <h1 className="doctor-name">
                Dr. {doctorProfile.name}
                <Link to={`/patient/${doctorId}`} className="info-icon-slot">
                  view profile
                </Link>
              </h1>
              <p className="doctor-sub">
                {doctorProfile.speciality} • {doctorProfile.experience} yrs
                experience
              </p>
            </div>
          </div>

          <div className="mode-toggle">
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
            <h3 className="slots-title">Select a Slot</h3>

            <DayTabs
              availabilityData={availabilityData}
              mode={mode}
              selectedDayId={selectedDayId}
              setSelectedDayId={setSelectedDayId}
              setSelectedSlot={setSelectedSlot}
              setConsultFee={setConsultFee}
            />

            {modeSlots ? (
              (() => {
                const allVisible = [
                  ...modeSlots.Morning.filter(
                    (slot) => !isToday || isFutureSlot(slot.label)
                  ),
                  ...modeSlots.Afternoon.filter(
                    (slot) => !isToday || isFutureSlot(slot.label)
                  ),
                  ...modeSlots.Evening.filter(
                    (slot) => !isToday || isFutureSlot(slot.label)
                  ),
                ];

                if (allVisible.length === 0) {
                  return (
                    <p className="no-slots-message">
                      No slots available {isToday ? "for the rest of today." : "for this day."}
                    </p>
                  );
                }

                return ["Morning", "Afternoon", "Evening"]
                  .map((period) => {
                    const visibleSlots =
                      modeSlots[period]
                        ?.filter(
                          (slot) => !isToday || isFutureSlot(slot.label)
                        )
                        .sort((a, b) => {
                          const sA = a.label.split("-")[0].trim();
                          const sB = b.label.split("-")[0].trim();
                          const [hA, mA] = sA.split(":").map(Number);
                          const [hB, mB] = sB.split(":").map(Number);
                          return hA * 60 + mA - (hB * 60 + mB);
                        }) || [];

                    if (visibleSlots.length === 0) return null;

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
                  .filter(Boolean);
              })()
            ) : (
              <p className="no-slots-message">
                No slots available for this day or mode.
              </p>
            )}
          </div>
        </div>

        <div className="booking-sidebar">
          <div className="booking-summary-card profile-card">
            <h2 className="profile-card-title">Booking Summary</h2>

            <div className="summary-doctor-info">
              <img
                src={doctorProfile.profilePic}
                alt={doctorProfile.name}
                className="summary-doctor-avatar"
              />
              <div>
                <h3 className="doctor-name-summary">
                  Dr. {doctorProfile.name}
                </h3>
                <p className="doctor-sub-summary">
                  {doctorProfile.speciality}
                </p>
              </div>
            </div>

            <div className="summary-details">
              {!selectedSlot ? (
                <p className="summary-placeholder">
                  Please select a day and time slot.
                </p>
              ) : (
                <ul className="info-list">
                  <li>
                    <strong>Date</strong>
                    <span>{selectedDayData.date}</span>
                  </li>
                  <li>
                    <strong>Time</strong>
                    <span>{selectedSlot.label}</span>
                  </li>
                  <li>
                    <strong>Mode</strong>
                    <span style={{ textTransform: "capitalize" }}>
                      {mode}
                    </span>
                  </li>
                </ul>
              )}
            </div>

            <div className="price-display-summary">
              <span>Consultation Fee</span>
              <strong>
                ₹{consultFee !== null ? consultFee : doctorProfile.fee}
              </strong>
            </div>

            <button
              className="btn-primary"
              onClick={goto}
              disabled={!selectedSlot}
            >
              Book Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}