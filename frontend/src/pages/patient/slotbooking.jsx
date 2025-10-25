import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PatientContext } from "./patientcontext";
import HeartLoader from "../../components/Loaders/heartloader";
import ReviewCard from "../../components/reviewcard"
import Map from "../../components/map";
import "../../css/slotbooking.css";


const renderStars = (rating = 0) => (
  <div className="doctor-rating">
    {[1, 2, 3, 4, 5].map((i) => (
      <span key={i} className={`star ${i <= rating ? "filled" : "empty"}`}>
        ★
      </span>
    ))}
  </div>
);

export default function SlotBooking() {
  const { id: doctorId } = useParams();
  const navigate = useNavigate();
  const { doctors } = useContext(PatientContext);

  const [doctorProfile, setDoctorProfile] = useState(null);
  const [availabilityData, setAvailabilityData] = useState([]);
  const [selectedDayId, setSelectedDayId] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews,setReviews]=useState([])
  const [error, setError] = useState(null);


  useEffect(() => {


    async function getreviews(id){

      await fetch(`http://localhost:8000/patient/reviews/${id}`,{
        credentials:'include',
      method:'GET'
      })
      .then(async(res)=>{
        const response=await res.json()
        if(res.status==200)
          setReviews(response.reviews)
        if(res.status==401)
          navigate('/patient/login?alert=Session expired please login again !')
        else
          toast.error("Failed to get Doctor Reviews")
      })
      .catch(err=>console.log(err))

    }
    if (!doctors || !doctorId) return;
    const doctor = doctors.find((d) => d._id === doctorId);
    if (doctor) {
    setDoctorProfile(doctor);
    getreviews(doctor._id)
  }
    else setError("Doctor not found");
  }, [doctors, doctorId]);


  /** 📅 Convert day name to next upcoming date (DD-MM-YYYY) */
  const getNextDateForDay = (dayName) => {
    const today = new Date();
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const targetDay = daysOfWeek.indexOf(dayName);
    const currentDay = today.getDay();
    let diff = targetDay - currentDay;
    if (diff < 0) diff += 7;

    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + diff);

    const day = String(nextDate.getDate()).padStart(2, "0");
    const month = String(nextDate.getMonth() + 1).padStart(2, "0");
    const year = nextDate.getFullYear();

    return `${day}-${month}-${year}`;
  };

  /** ⏰ Fetch doctor's time slots */
  useEffect(() => {
    if (!doctorId) return;

    const fetchSlots = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`http://localhost:8000/patient/allslots`, {
          headers: {
            "Content-Type": "application/json",
            doctorid: doctorId,
          },
          credentials: "include",
        });

        if (response.status === 403) {
          navigate("/patient/login?alert=Session expired please login again");
          return;
        }

        if (!response.ok) throw new Error("Failed to fetch time slots");
        const data = await response.json();

        // 🧩 Group slots by day (only available ones)
        const grouped = {};
        data.timeslots.forEach((slot) => {
          const status = slot.status?.toLowerCase();
          if (status !== "available") return;
          if (!grouped[slot.Day]) grouped[slot.Day] = [];
          grouped[slot.Day].push(`${slot.StartTime} - ${slot.EndTime}`);
        });

        // 🧾 Format for UI
        const formatted = Object.keys(grouped).map((day) => ({
          id: day.toLowerCase(),
          dayName: day,
          date: getNextDateForDay(day),
          slots: grouped[day].length,
          availableSlots: grouped[day],
        }));

        setAvailabilityData(formatted);

        // 💾 Load saved appointment (if exists)
        const savedAppointment = JSON.parse(localStorage.getItem("appointment"));

        if (formatted.length > 0) {
          if (savedAppointment && savedAppointment.doctorId === doctorId) {
            const matchedDay = formatted.find(
              (d) =>
                d.date === savedAppointment.date &&
                d.dayName === savedAppointment.dayName
            );

            if (matchedDay) {
              setSelectedDayId(matchedDay.id);
              if (matchedDay.availableSlots.includes(savedAppointment.timeSlot)) {
                setSelectedSlot(savedAppointment.timeSlot);
              }
            } else {
              setSelectedDayId(formatted[0].id);
            }
          } else {
            setSelectedDayId(formatted[0].id);
          }
        } else {
          setSelectedDayId(null);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [doctorId, navigate]);

  /** 📤 Proceed to booking form */
  const goto = () => {
    if (!selectedSlot || !doctorProfile) return;

    const selectedDayData = availabilityData.find((d) => d.id === selectedDayId);
    if (!selectedDayData) return;

    const appointmentData = {
      doctorId: doctorProfile._id,
      doctorName: doctorProfile.name,
      fee: doctorProfile.fee,
      date: selectedDayData.date,
      dayName: selectedDayData.dayName,
      timeSlot: selectedSlot.split(" - ")[0],
    };

    localStorage.setItem("appointment", JSON.stringify(appointmentData));
    navigate("/patient/appointment/form");
  };

  /** 🎨 UI Helpers */
  const getTabClass = (day) => {
    const isSelected = day.id === selectedDayId;
    if (isSelected && day.slots === 0) return "tab selected-unavailable";
    if (isSelected && day.slots > 0) return "tab selected-available";
    if (!isSelected && day.slots > 0) return "tab available";
    return "tab";
  };

  const selectedDayData = availabilityData.find(
    (d) => d.id === selectedDayId
  );

  /** 🧠 Render Logic */
  if (loading) return <HeartLoader />;
  if (error) return <div className="booking-card-error">{error}</div>;
  if (!doctorProfile) return null;

  return (
    <div className="booking-card" id="book">
      {/* 🧑‍⚕️ Doctor Info */}
      <header className="doctor-header">
        <div className="doctor-left">
          <img
            src={doctorProfile.profilePic}
            alt={doctorProfile.name}
            className="doctor-avatar"
          />
        </div>

        <div className="doctor-main">
          <h1 className="doctor-name">{doctorProfile.name}</h1>
          <p className="doctor-sub">
            {doctorProfile.speciality} • {doctorProfile.experience} yrs experience
          </p>

          <div className="doctor-meta-grid">
            <div className="meta-item">
              <div className="meta-key">Email</div>
              <div className="meta-val">{doctorProfile.email}</div>
            </div>
            <div className="meta-item">
              <div className="meta-key">Gender</div>
              <div className="meta-val">{doctorProfile.gender || "-"}</div>
            </div>
            <div className="meta-item">
              <div className="meta-key">Languages</div>
              <div className="meta-val">
                {doctorProfile.languages?.join(", ") || "-"}
              </div>
            </div>
            <div className="meta-item">
              <div className="meta-key">Rating</div>
              <div className="meta-val">{renderStars(doctorProfile.rating)}</div>
            </div>
          </div>
        </div>

        <aside className="doctor-side">
          <div className="price">
            <div className="price-label">Consultation Fee</div>
            <div className="price-val">
              ₹{doctorProfile.fee ? doctorProfile.fee : "-"}
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

      {/* 📅 Availability Section */}
      <div className="availability-details">
        <h3 className="slots-title">Slots Available</h3>

        {/* 🗓️ Day Tabs */}
        {availabilityData.length > 0 ? (
          <div className="date-tabs">
            {availabilityData.map((day) => (
              <div
                key={day.id}
                className={getTabClass(day)}
                onClick={() => {
                  setSelectedDayId(day.id);
                  setSelectedSlot(null);
                }}
              >
                <span className="day-date">{day.date}</span>
                <strong>{day.dayName}</strong>
                <span>
                  {day.slots > 0
                    ? `${day.slots} slots available`
                    : "No slots available"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-slots-view">
            <p>This doctor has no available slots.</p>
          </div>
        )}

        {/* ⏱️ Slots List */}
        {selectedDayData && (
          selectedDayData.slots === 0 ? (
            <div className="no-slots-view">
              <p>No slots available</p>
            </div>
          ) : (
            <div className="slots-view">
              <div className="slots-grid">
                {selectedDayData.availableSlots.map((slot) => (
                  <button
                    key={slot}
                    className={`slot-btn ${
                      selectedSlot === slot ? "slot-selected" : ""
                    }`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )
        )}
      </div>

      
      <br />
      <h2 className="hehe">Clinic Location</h2>
      {doctorProfile.address && <Map address={doctorProfile.address} />}
      <br />
      <h2 className="hehe" id="reviews">Reviews</h2>
     <ReviewCard reviews={reviews}/>

    
        <a id="down" href="#reviews"><svg xmlns="http://www.w3.org/2000/svg" fill="white"  viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
</svg>
</a>
        <a id="up" href="#book"><svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
</svg>
</a>
        

    
    </div>
  );
}
