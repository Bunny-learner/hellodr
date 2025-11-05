// src/components/PatientAppointments.jsx
import React, { useState, useEffect } from 'react';
import "../../css/patientappointments.css"; // We will use the new CSS
import toast from 'react-hot-toast';
import HeartLoader from '../../components/Loaders/heartloader'; // Using HeartLoader as in your code
import { useNavigate } from 'react-router-dom';
import { 
    FiCalendar, FiClock, FiMapPin, FiVideo, FiStar, 
    FiMessageSquare, FiWifi, FiHome 
} from 'react-icons/fi';

// --- Helper Functions (No Change) ---
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

// --- Card Components (No Change) ---
const TodayOnlineCard = ({ app, onJoin }) => (
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
            <div className="pa-card-detail"><FiVideo /><span>Video Consultation</span></div>
        </div>
        <div className="pa-card-footer">
            <button className="pa-btn pa-btn-primary" onClick={() => onJoin(app._id)}>Join Call</button>
            <button className="pa-btn pa-btn-secondary"><FiMessageSquare /> Chat</button>
        </div>
    </div>
);
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
    const [page, setPage] = useState('today'); // Default to 'today'
    const [modeFilter, setModeFilter] = useState('all'); // NEW: Mode filter state
    const navigate = useNavigate();

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
                        doc.status === "accepted" && doc.date.startsWith(today)
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

    const handleJoinCall = (appId) => {
        toast.success("Joining call...");
        // navigate(`/patient/consultation/${appId}`);
    };

    // --- Render Logic (UPDATED) ---

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
                        <TodayOnlineCard key={app._id} app={app} onJoin={handleJoinCall} /> :
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
                            onChange={(e) => setReviewText(e.target.value)}
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