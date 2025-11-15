// src/components/PatientAppointments.jsx
import React, { useState, useEffect, useContext } from 'react'; // Added useContext
import "../../css/patientappointments.css";
import toast from 'react-hot-toast';
import HeartLoader from '../../components/Loaders/heartloader';
import { useNavigate } from 'react-router-dom';
import { useSocket } from "../../pages/SocketContext.jsx";
import {
    FiCalendar, FiClock, FiMapPin, FiVideo, FiStar,
    FiMessageSquare, FiWifi, FiHome
} from 'react-icons/fi';
import { PatientContext } from './patientcontext'; 


const getTodayString = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to midnight
    return today.toISOString().split('T')[0];
};
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};
const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const standardHours = h % 12 || 12;
    return `${standardHours}:${minutes} ${ampm}`;
};


const TodayOnlineCard = ({ app, onJoin, isJoinable }) => (
    <div className="pa-card today-card today-online">
        <div className="pa-card-header">
            <img src={app.doctor.profilePic || "/default-doctor.png"} alt={app.doctor.name} className="pa-doctor-image" />
            <div className="pa-doctor-info">
                <h4>Dr. {app.doctor.name}</h4>
                <span>{app.doctor.speciality || "Specialist"}</span>
            </div>
            <span className="pa-card-tag-online"><FiVideo /> Online</span>
        </div>
        <div className="pa-card-body">
            <div className="pa-card-detail"><FiClock /><span>{formatTime(app.TimeSlot?.StartTime)} - {formatTime(app.TimeSlot?.EndTime)}</span></div>
        </div>
        <div className="pa-card-footer">
          
            <button
    className="pa-btn pa-btn-primary"
    onClick={() => onJoin(app)}
    disabled={!isJoinable}
    style={{
        opacity: isJoinable ? 1 : 0.4,
        cursor: isJoinable ? "pointer" : "not-allowed"
    }}
>
    <FiMessageSquare />
    {isJoinable ? "Join Chat" : 
        (app.status.toLowerCase() === "accepted" ? "Scheduled" : "Waiting...")}
</button>

        </div>
    </div>
);

// --- TodayOfflineCard (No Change) ---
const TodayOfflineCard = ({ app }) => (
    <div className="pa-card today-card today-offline">
        <div className="pa-card-header">
            <img src={app.doctor.profilePic || "/default-doctor.png"} alt={app.doctor.name} className="pa-doctor-image" />
            <div className="pa-doctor-info">
                <h4>Dr. {app.doctor.name}</h4>
                <span>{app.doctor.speciality || "Specialist"}</span>
            </div>
            <span className="pa-card-tag-offline"><FiMapPin /> In-Clinic</span>
        </div>
        <div className="pa-card-body">
            <div className="pa-card-detail"><FiClock /><span>{formatTime(app.TimeSlot?.StartTime)} - {formatTime(app.TimeSlot?.EndTime)}</span></div>
            <div className="pa-card-detail"><FiMapPin /><span>{app.doctor.address || "Clinic Address Not Provided"}</span></div>
        </div>
        <div className="pa-card-footer">
            <button className="pa-btn pa-btn-secondary">Get Directions</button>
        </div>
    </div>
);

// --- AppointmentCard (No Change) ---
const AppointmentCard = ({ app }) => (
    <div className="pa-card status-card">
        <div className="pa-card-header">
            <img src={app.doctor.profilePic || "/default-doctor.png"} alt={app.doctor.name} className="pa-doctor-image" />
            <div className="pa-doctor-info">
                <h4>Dr. {app.doctor.name}</h4>
                <span>{app.doctor.speciality || "Specialist"}</span>
            </div>
            <span className={`pa-status-badge status-${app.status.toLowerCase()}`}>{app.status}</span>
        </div>
        <div className="pa-card-body">
            <div className="pa-card-detail"><FiCalendar /><span>{formatDate(app.date)}</span></div>
            <div className="pa-card-detail"><FiClock /><span>{formatTime(app.TimeSlot?.StartTime)} - {formatTime(app.TimeSlot?.EndTime)}</span></div>
            <div className="pa-card-detail"><FiMapPin /><span>{app.mode === 'Online' ? 'Online Consultation' : (app.doctor.clinicAddress || 'In-Clinic')}</span></div>
            <p><strong>Symptoms:</strong> {app.symptoms || "N/A"}</p>
        </div>
    </div>
);

// --- PastAppointmentCard (No Change) ---
const PastAppointmentCard = ({ app, onAddReview }) => (
    <div className="pa-card status-card">
        <div className="pa-card-header">
            <img src={app.doctor.profilePic || "/default-doctor.png"} alt={app.doctor.name} className="pa-doctor-image" />
            <div className="pa-doctor-info">
                <h4>Dr. {app.doctor.name}</h4>
                <span>{app.doctor.speciality || "Specialist"}</span>
            </div>
            <span className={`pa-status-badge status-${app.status.toLowerCase()}`}>{app.status}</span>
        </div>
        <div className="pa-card-body">
            <div className="pa-card-detail"><FiCalendar /><span>{formatDate(app.date)}</span></div>
            <div className="pa-card-detail"><FiClock /><span>{formatTime(app.TimeSlot?.StartTime)} - {formatTime(app.TimeSlot?.EndTime)}</span></div>
            <p><strong>Symptoms:</strong> {app.symptoms || "N/A"}</p>
        </div>
        {app.status === 'completed' && (
            <div className="pa-card-footer">
                <button className="pa-btn pa-btn-primary" onClick={() => onAddReview(app)}><FiStar /> Add Review</button>
            </div>
        )}
    </div>
);

//--- Main Component ---

export default function PatientAppointments() {
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState('today');
    const [modeFilter, setModeFilter] = useState('all');
    const navigate = useNavigate();
    const { socketId, socket } = useSocket()
    // --- ACCESSED CONTEXT ---
    const { doctors } = useContext(PatientContext);

    // Store appointments by category
    const [todayAppointments, setTodayAppointments] = useState([]);
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [pendingAppointments, setPendingAppointments] = useState([]);
    const [completedAppointments, setCompletedAppointments] = useState([]);
    const [cancelledAppointments, setCancelledAppointments] = useState([]);

    // Review Modal State
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewText, setReviewText] = useState("");

    // --- NEW STATE ---
    // Stores a Set of appointment IDs that are allowed to join
    const [joinableAppointments, setJoinableAppointments] = useState(new Set());

    // --- fetchAppointments (No Change) ---
    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                setLoading(true);
                const res = await fetch("http://localhost:8000/patient/appointments", {
                    method: "GET",
                    credentials: 'include',
                });
                const data = await res.json();

                if (res.status === 401) {
                    navigate('/patient/login?alert=Session expired please login again !');
                    return;
                }

                if (res.status === 200) {
                    const today = getTodayString();

                  const todayApps = data.data.filter(doc =>
    ["accepted", "next_up", "in_progress"].includes(doc.status.toLowerCase()) &&
    doc.date.startsWith(today)
);

                    const upcomingApps = data.data.filter(doc =>
                        doc.status === "accepted" && !doc.date.startsWith(today)
                    );
                    const pendingApps = data.data.filter(doc => doc.status === "pending");
                    const completedApps = data.data.filter(doc => doc.status === "completed");
                    const cancelledApps = data.data.filter(doc => doc.status === "cancelled" || doc.status === "rejected");

                    setTodayAppointments(todayApps);
                    setUpcomingAppointments(upcomingApps);
                    setPendingAppointments(pendingApps);
                    setCompletedAppointments(completedApps);
                    setCancelledAppointments(cancelledApps);

                }
            } catch (err) {
                console.log(err);
                toast.error("Failed to fetch appointments.");
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, [navigate]);


    useEffect(() => {
        if (!socket) return; 

        const handleEnableJoin = (data) => {
            console.log("Socket event 'enable_join_button' received:", data);
            if (data && data.appt_id) {
                toast.success("Doctor is ready, please join!");
                
                // Add the appointmentId to the set of joinable appointments
                setJoinableAppointments(prevSet => {
                    const newSet = new Set(prevSet); 
                    newSet.add(data.appt_id);
                    return newSet;
                });
            }
        };

        socket.on("enable_join_button", handleEnableJoin);

       
        return () => {
            socket.off("enable_join_button", handleEnableJoin);
        };
    }, [socket]);


    // --- Review Modal Handlers (No Change) ---
    const handleOpenReviewModal = (app) => {
        setSelectedAppointment(app);
        setReviewRating(5);
        setReviewText("");
        setShowReviewModal(true);
    };

    const submitReview = async () => {
        if (!reviewText || reviewText.trim() === "") {
            toast.error("Please write something before submitting.");
            return;
        }
        if (reviewRating < 1 || reviewRating > 5) {
            toast.error("Rating must be between 1 and 5.");
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
                    rating: reviewRating,
                    patient: selectedAppointment.patient,
                    review: reviewText,
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
            toast.error("Error submitting review.");
        }
    };

    const handleJoinCall = (appointment) => {

        if (!doctors || doctors.length === 0) {
            toast.error("Doctor list not available. Please refresh the page.");
            return;
        }

        // Get the doctor's ID from the appointment object
        const doctorId = appointment.doctor._id;

        // Find the full doctor profile from the context list
        const fullDoctorProfile = doctors.find(doc => doc._id === doctorId);

        if (!fullDoctorProfile) {
            toast.error("Could not find complete doctor details.");
            return;
        }

        if (!fullDoctorProfile.roomid) {
            toast.error("This doctor's chat room is not available.");
            return;
        }

        socket.emit("join_room", {
            roomid: fullDoctorProfile.roomid
        })
        toast.success("Joining the room...");
        navigate(`/waiting-room/${fullDoctorProfile.roomid}?consultationId=${appointment._id}&user=patient`);

    };


    
    const renderPageContent = () => {
        if (loading) return <HeartLoader />;

        // Helper function to create the "No appointments" message
        const noAppsMessage = (statusText) => {
            const modeText = modeFilter !== 'all' ? `${modeFilter}` : '';
            return `No ${modeText} ${statusText} appointments.`;
        };

        // Helper to filter any list by the current modeFilter
        const filterByMode = (list) => {
            if (modeFilter === 'all') return list;
            return list.filter(app => app.mode.toLowerCase() === modeFilter);
        };

        switch (page) {
            case 'today':
                const filteredToday = filterByMode(todayAppointments);
                return filteredToday.length === 0 ? (
                    <div className='pa-no-appointments'>{noAppsMessage('today\'s')}</div>
                ) : (
                    filteredToday.map((app) => (
                        app.mode === 'online' ?
                            // --- THIS IS THE FIX: Pass isJoinable prop ---
                            <TodayOnlineCard
                                key={app._id}
                                app={app}
                                onJoin={handleJoinCall}
                              isJoinable={
                                 app.patientjoinenabled === true &&
    app.status.toLowerCase() === "next_up" ||
    app.status.toLowerCase() === "in_progress"
}

                            /> :
                            <TodayOfflineCard key={app._id} app={app} />
                    ))
                );

            case 'upcoming':
                const filteredUpcoming = filterByMode(upcomingAppointments);
                return filteredUpcoming.length === 0 ? (
                    <div className='pa-no-appointments'>{noAppsMessage('upcoming')}</div>
                ) : (
                    filteredUpcoming.map((app) => <AppointmentCard key={app._id} app={app} />)
                );

            case 'pending':
                const filteredPending = filterByMode(pendingAppointments);
                return filteredPending.length === 0 ? (
                    <div className='pa-no-appointments'>{noAppsMessage('pending')}</div>
                ) : (
                    filteredPending.map((app) => <AppointmentCard key={app._id} app={app} />)
                );

            case 'completed':
                const filteredCompleted = filterByMode(completedAppointments);
                return filteredCompleted.length === 0 ? (
                    <div className='pa-no-appointments'>{noAppsMessage('completed')}</div>
                ) : (
                    filteredCompleted.map((app) => (
                        <PastAppointmentCard key={app._id} app={app} onAddReview={handleOpenReviewModal} />
                    ))
                );

            case 'cancelled':
                const filteredCancelled = filterByMode(cancelledAppointments);
                return filteredCancelled.length === 0 ? (
                    <div className='pa-no-appointments'>{noAppsMessage('cancelled')}</div>
                ) : (
                    filteredCancelled.map((app) => <PastAppointmentCard key={app._id} app={app} />)
                );

            default:
                return <div className='pa-no-appointments'>Please select a category.</div>;
        }
    };

    // --- Return JSX (No Change) ---
    return (
        <section className="pa-page-container">
            <div className="pa-header">
                <div className='pa-filter-chips'>
                    <button onClick={() => setPage('today')} className={`pa-chip ${page === 'today' ? 'active' : ''}`}>Today</button>
                    <button onClick={() => setPage('upcoming')} className={`pa-chip ${page === 'upcoming' ? 'active' : ''}`}>Upcoming</button>
                    <button onClick={() => setPage('pending')} className={`pa-chip ${page === 'pending' ? 'active' : ''}`}>Pending</button>
                    <button onClick={() => setPage('completed')} className={`pa-chip ${page === 'completed' ? 'active' : ''}`}>Completed</button>
                    <button onClick={() => setPage('cancelled')} className={`pa-chip ${page === 'cancelled' ? 'active' : ''}`}>Cancelled</button>
                </div>
            </div>


            <div className="pa-mode-filters">
                <span className="pa-filter-label">Mode:</span>
                {['all', 'offline', 'online'].map(f => (
                    <button
                        key={f}
                        className={`pa-mode-chip ${modeFilter === f ? 'active' : ''}`}
                        onClick={() => setModeFilter(f)}
                    >
                        {f === 'all' && "All Modes"}
                        {f === 'offline' && <><FiHome size={14} /> Offline</>}
                        {f === 'online' && <><FiWifi size={14} /> Online</>}
                    </button>
                ))}
            </div>

            <div className="pa-appointments-grid">
                {renderPageContent()}
            </div>

            {/* Review Modal (No Change) */}
            {showReviewModal && selectedAppointment && (
                <div className="pa-review-modal-overlay" onClick={() => setShowReviewModal(false)}>
                    <div className="pa-review-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="pa-close-modal-btn" onClick={() => setShowReviewModal(false)}>×</button>
                        <h3>Review Dr. {selectedAppointment.doctor.name}</h3>

                        <div className="pa-rating-input">
                            <label>Rating:</label>
                            <div className="pa-star-rating">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <FiStar
                                        key={star}
                                        className={star <= reviewRating ? 'filled' : ''}
                                        onClick={() => setReviewRating(star)}
                                    />
                                ))}
                            </div>
                        </div>

                        <textarea
                            className="pa-review-textarea"
                            placeholder="Write your review here..."
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)} // Corrected this line from your original code
                        ></textarea>

                        <button className="pa-btn pa-btn-primary" onClick={submitReview}>
                            Submit Review
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}