// src/components/DoctorAppointments.jsx
import React, { useState, useEffect, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import {
    FiSearch,
    FiUser,
    FiCalendar,
    FiCheckSquare,
    FiXCircle,
    FiClock,
    FiArrowUp,
    FiArrowDown,
    FiWifi, // For Online
    FiHome,   // For Offline
    FiMail,
    FiPhone,
    FiAlertCircle,
    FiVideo, // For Join Video
    FiMic, // For Join Audio
    FiMessageSquare // For Chat
} from 'react-icons/fi';
// Import your single, final CSS file
import "../../css/DoctorAppointments.css"; 
import Bubbles from '../../components/Loaders/bubbles';


// --- Helper functions ---
const getTodayString = () => new Date().toISOString().split('T')[0];
const formatTime = (dateString) => {
    if (!dateString) return "N_A";
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}
const formatDate = (dateString) => {
    if (!dateString) return "N_A";
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

//todays card
const TodayAppointmentCard = ({ app, onUpdateStatus, onViewDetails }) => {
    
    const isOnline = app.mode.toLowerCase() === 'online';

    const handleJoin = (joinType) => {
        toast.success(`Joining ${joinType} with ${app.name}`);
        // Example navigation:
        // navigate(`/doctor/consultation/${app._id}?mode=${joinType}`);
    };

    return (
        <div className="today-card">
            {/* Left Section: Patient Info */}
            <div className="today-card-left">
                <div className="patient-avatar"><FiUser size={24} /></div>
                <div className="patient-info">
                    <h3 className="today-patient-name">{app.name}</h3>
                    <span className="today-patient-details">
                        {app.age} yrs • {app.phone}
                    </span>
                </div>
            </div>
            
            {/* Middle Section: Time & Mode */}
            <div className="today-card-middle">
                <div className="today-time-slot">
                    <FiClock size={16} />
                    {/* ### MODIFIED: Shows full slot (e.g., 10:00 AM - 10:30 AM) ### */}
                    <strong>
                        {app.TimeSlot ? 
                            `${app.TimeSlot.StartTime} - ${app.TimeSlot.EndTime}` : 
                            formatTime(app.date)
                        }
                    </strong>
                </div>
                <span className={`mode-badge-small mode-${app.mode.toLowerCase()}`}>
                    {isOnline ? <FiWifi size={12} /> : <FiHome size={12} />}
                    {app.mode}
                </span>
            </div>

            {/* Right Section: Actions */}
            <div className="today-card-right">
                {isOnline ? (
                    <div className="today-join-actions">
                        <button className="btn-join" onClick={() => handleJoin('video')} title="Start Video Call"><FiVideo /></button>
                        <button className="btn-join" onClick={() => handleJoin('audio')} title="Start Audio Call"><FiMic /></button>
                        <button className="btn-join" onClick={() => handleJoin('chat')} title="Start Chat"><FiMessageSquare /></button>
                    </div>
                ) : (
                    <div className="today-offline-actions">
                        <button 
                            className="btn-action btn-complete-today"
                            onClick={() => onUpdateStatus(app._id, 'completed', 'accepted')}
                        >
                            <FiCheckSquare /> Mark Done
                        </button>
                    </div>
                )}
                <button className="btn-action btn-view-details" onClick={() => onViewDetails(app._id)}>
                    View Details
                </button>
            </div>
        </div>
    );
};



// ### 2. "INBOX" CARD (For "Pending" Filter)                         

const PendingAppointmentCard = ({ app, onUpdateStatus }) => {
    console.log(app)
    return (
        <div className="pending-card">
            <div className="pending-card-header">
                <div className="patient-avatar"><FiUser size={30} /></div>
                <div className="patient-info">
                    <h3>{app.name}</h3>
                    <span>{app.age} yrs, {app.gender}</span>
                </div>
                <span className={`mode-badge mode-${app.mode.toLowerCase()}`}>
                    {app.mode.toLowerCase() === 'online' ? <FiWifi size={14} /> : <FiHome size={14} />}
                    {app.mode}
                </span>
            </div>

            <div className="pending-card-body">
                <div className="patient-details">
                    <h4>Patient Details</h4>
                    <p><FiMail size={14} /> <span>{app.email}</span></p>
                    <p><FiPhone size={14} /> <span>{app.phone}</span></p>
                </div>
                <div className="appointment-details">
                    <h4>Appointment Details</h4>
                    
                    {/* ### MODIFIED: Shows correct slot time ### */}
                    <p>
                        <FiCalendar size={14} />
                        <span>{formatDate(app.date)}</span>
                    </p>
                    <p>
                        <FiClock size={14} />
                        <strong>
                            {app.TimeSlot ? 
                                `${app.TimeSlot.StartTime} - ${app.TimeSlot.EndTime}` : 
                                formatTime(app.date)
                            }
                        </strong>
                    </p>
                    
                    <p className="symptoms">
                        <FiAlertCircle size={14} />
                        <strong>Symptoms:</strong> {app.symptoms}
                    </p>
                </div>
            </div>

            <div className="pending-card-actions">
                <button
                    className="btn-action btn-reject"
                    onClick={() => onUpdateStatus(app._id, 'rejected', 'pending')}
                >
                    <FiXCircle /> Reject
                </button>
                <button
                    className="btn-action btn-accept"
                    onClick={() => onUpdateStatus(app._id, 'accepted', 'pending')}
                >
                    <FiCheckSquare /> Accept
                </button>
            </div>
        </div>
    );
};


// ### 3. "ARCHIVE" CARD (Uses your .appointment-card styles)         ###

const ArchivedAppointmentCard = ({ app, onUpdateStatus }) => {
    const status = app.status.toLowerCase();
    return (
        // This uses .appointment-card, which is in your main CSS
        <div className={`appointment-card status-${status}`}> 
            <div className="card-header">
                <div className="patient-avatar"><FiUser size={24} /></div>
                <div className="patient-info">
                    <h3>{app.name}</h3>
                    <span>{app.age} yrs, {app.gender}</span>
                </div>
                <span className={`status-badge status-${status}`}>{app.status}</span>
            </div>

            <div className="card-body">
                <p><strong>Symptoms:</strong> {app.symptoms}</p>
                <p>
                    <span className={`mode-badge-small mode-${app.mode.toLowerCase()}`}>
                        {app.mode.toLowerCase() === 'online' ? <FiWifi size={12} /> : <FiHome size={12} />}
                        {app.mode}
                    </span>
                </p>
            </div>

            <div className="card-footer">
                <div className="time-slot">
                    {/* ### MODIFIED: Shows correct slot time ### */}
                    <FiCalendar /> <span>{formatDate(app.date)}</span>
                    <strong style={{ marginLeft: '10px' }}>
                        <FiClock style={{ marginRight: '4px', verticalAlign: 'middle' }} size={14} />
                        {app.TimeSlot ? 
                            `${app.TimeSlot.StartTime} - ${app.TimeSlot.EndTime}` : 
                            formatTime(app.date)
                        }
                    </strong>
                </div>

                {status === 'accepted' && (
                    <div className="action-buttons">
                        <button className="btn-action btn-complete" onClick={() => onUpdateStatus(app._id, 'completed', 'accepted')}>Complete</button>
                        <button className="btn-action btn-cancel" onClick={() => onUpdateStatus(app._id, 'cancelled', 'accepted')}>Cancel</button>
                    </div>
                )}
            </div>
        </div>
    );
};



// ### MAIN DOCTOR APPOINTMENTS COMPONENT                             ###

export default function DoctorAppointments() {
    const navigate = useNavigate();
    const [allAppointments, setAllAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("today");
    const [sortOrder, setSortOrder] = useState("asc");
    const [modeFilter, setModeFilter] = useState("all");

    // Fetch appointments
    useEffect(() => {
        const fetchAppointments = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('http://localhost:8000/doctor/appointments', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                });
                if (response.status === 401) {
                    console.log(response.status)
                    navigate("/doctor/login?Session has expired please login again");
                    return;
                }
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const result = await response.json();
                if (result.data) setAllAppointments(result.data);
                else throw new Error(result.message || "Could not fetch data.");
            } catch (err) {
                console.error("Fetch error:", err);
                setError(err.message);
                toast.error("Failed to fetch appointments.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAppointments();
    }, [navigate]);


    // Filter Logic
    const filteredAppointments = useMemo(() => {
        const todayStr = getTodayString(); // e.g., "2025-11-05"

        return allAppointments
            .filter(app => {
                const status = app.status.toLowerCase();
                const filter = statusFilter.toLowerCase();
                let statusMatch = true;

                switch (filter) {
                    case "today":
                        // ### CORRECTED "TODAY" LOGIC ###
                        const startOfToday = new Date();
                        startOfToday.setHours(0, 0, 0, 0);

                        const startOfTomorrow = new Date(startOfToday);
                        startOfTomorrow.setDate(startOfToday.getDate() + 1);
                        
                        const appDate = new Date(app.date);

                        statusMatch = status === "accepted" && 
                                      appDate >= startOfToday && 
                                      appDate < startOfTomorrow;
                        break;
                    
                    case "pending":
                        statusMatch = status === "pending";
                        break;
                    
                    case "accepted":
                        statusMatch = status === "accepted" && !app.date.startsWith(todayStr);
                        break;
                    
                    case "completed":
                        statusMatch = status === "completed";
                        break;
                    
                    case "rejected":
                        statusMatch = status === "rejected" || status === "cancelled";
                        break;
                    
                    case "all":
                    default:
                        statusMatch = true;
                }

                const modeMatch = modeFilter === 'all'
                    ? true
                    : app.mode.toLowerCase() === modeFilter;

                const search = searchTerm.toLowerCase();
                const searchMatch = !search ? true : (
                    app.name.toLowerCase().includes(search) ||
                    app.email.toLowerCase().includes(search) ||
                    app.phone.toLowerCase().includes(search)
                );

                return statusMatch && modeMatch && searchMatch;
            })
            .sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                if (statusFilter === 'today') {
                    return dateA.getTime() - dateB.getTime();
                }
                return sortOrder === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
            });
    }, [allAppointments, statusFilter, modeFilter, searchTerm, sortOrder]);


    // Status Update Handler
    const handleUpdateStatus = async (appointmentID, newStatus, fromStatus) => {
        // ... (Your existing handleUpdateStatus logic is good, no change needed)
        let what = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
        let title = `${what} Appointment?`;
        let html = `Are you sure you want to ${newStatus} this appointment?`;
        let confirmText = `Yes, ${what} it!`;
        let info = null;
        let showPopup = false;

        if (newStatus === "completed") {
            title = "Complete Appointment?";
            html = "By completing, you are authorizing the final payment transfer.";
            confirmText = "Yes, complete it!";
            info = "proceed";
            showPopup = true;
        } else if (newStatus === "cancelled" && fromStatus === "accepted") {
            what = "Cancel";
            title = "Cancel Accepted Appointment?";
            html = "This will cancel the booking and refund the patient.";
            confirmText = "Yes, cancel it!";
            info = "cancel";
            showPopup = true;
        } else if (newStatus === "rejected") {
            what = "Reject";
            title = "Reject Appointment?";
            html = "This will reject the new request. The patient will be notified.";
            confirmText = "Yes, reject it!";
            info = null;
            newStatus = "rejected";
            showPopup = true;
        } else if (newStatus === "accepted") {
            showPopup = false; 
        }

        if (showPopup) {
            const result = await Swal.fire({
                title: title,
                html: html,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: confirmText,
                cancelButtonText: "Close"
            });
            if (!result.isConfirmed) return;
        }

        const toastId = toast.loading('Updating status...');

        try {
            const endpoint = info
                ? `http://localhost:8000/appointment/changestatus?info=${info}`
                : `http://localhost:8000/appointment/changestatus`;

            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ appointmentID, status: newStatus })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Failed to update status");

            setAllAppointments(prev =>
                prev.map(app => app._id === appointmentID ? { ...app, status: newStatus } : app)
            );

            toast.success('Status updated successfully!', { id: toastId });

            if (response.status === 201 && info) {
                const who = info === "proceed" ? "Your" : "Their";
                toast.success(`Funds transferred to ${who} account successfully`);
            } else if (info && response.status !== 201) {
                toast.error(result.message || "Payment-related error");
            }

        } catch (err) {
            console.error("Update error:", err);
            toast.error(err.message || "Could not update status.", { id: toastId });
        }
    };
    
    // New handler for "View Details"
    const handleViewDetails = (appointmentID) => {
        toast(`Viewing details for ${appointmentID}`);
        // navigate(`/doctor/appointment/${appointmentID}`);
    };

    // --- RENDER FUNCTION ---
    return (
        <>
            <Toaster position="top-right" reverseOrder={false} />
            <section className="appointments-page">
                <header className="appointments-header">
                    <h2 className="section-title">Your Appointments</h2>
                    <div className="filter-bar">
                        <div className="search-bar">
                            <FiSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or phone..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {statusFilter !== 'today' && (
                            <button className="sort-button" onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}>
                                {sortOrder === 'asc' ? <FiArrowUp /> : <FiArrowDown />} Sort by Time
                            </button>
                        )}
                    </div>
                </header>

                <div className="mode-filters">
                    <span className="filter-label">Modes:</span>
                    {['all', 'offline', 'online'].map(f => (
                        <button
                            key={f}
                            className={`filter-chip mode-chip ${modeFilter === f ? 'active' : ''}`}
                            onClick={() => setModeFilter(f)}
                        >
                            {f === 'all' && "All Modes"}
                            {f === 'offline' && <><FiHome size={14} /> Offline</>}
                            {f === 'online' && <><FiWifi size={14} /> Online</>}
                        </button>
                    ))}
                </div>

                <div className="status-filters">
                    <span className="filter-label">Status:</span>
                    {['today', 'pending', 'accepted', 'completed', 'rejected', 'all'].map(f => (
                        <button
                            key={f}
                            className={`filter-chip ${statusFilter.toLowerCase() === f ? 'active' : ''}`}
                            onClick={() => setStatusFilter(f)}
                        >
                            {f === 'today' && <FiClock />}
                            {f === 'pending' && <FiClock />}
                            {f === 'accepted' && <FiCalendar />}
                            {f === 'completed' && <FiCheckSquare />}
                            {f === 'rejected' && <FiXCircle />}
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="appointments-list-container">
                    {isLoading && <Bubbles />}
                    {!isLoading && error && <div className="error-message">{error}</div>}
                    {!isLoading && !error && filteredAppointments.length === 0 && (
                        <div className="no-appointments">
                            <FiCalendar size={50} />
                            <h3>No appointments found.</h3>
                            <p>Try adjusting your filters.</p>
                        </div>
                    )}

                    {!isLoading && !error && filteredAppointments.length > 0 && (
                        <div className={`appointments-grid ${statusFilter === 'today' ? 'today-view' :
                            statusFilter === 'pending' ? 'pending-view' : 'archive-view'
                            }`}>
                            {filteredAppointments.map(app => {
                                // --- Conditional Card Rendering ---
                                if (statusFilter === 'today') {
                                    return <TodayAppointmentCard
                                        key={app._id}
                                        app={app}
                                        onUpdateStatus={handleUpdateStatus}
                                        onViewDetails={handleViewDetails}
                                    />;
                                }

                                if (statusFilter === 'pending') {
                                    return <PendingAppointmentCard
                                        key={app._id}
                                        app={app}
                                        onUpdateStatus={handleUpdateStatus}
                                    />;
                                }

                                // Default: "Accepted", "Completed", "All", etc.
                                return <ArchivedAppointmentCard
                                    key={app._id}
                                    app={app}
                                    onUpdateStatus={handleUpdateStatus}
                                />;
                            })}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}