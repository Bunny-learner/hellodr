import React, { useState, useEffect, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
    FiSearch,
    FiUser,
    FiCalendar,
    FiCheckSquare,
    FiXCircle,
    FiClock,
    FiArrowUp,
    FiArrowDown
} from 'react-icons/fi';
import "../../css/DoctorAppointments.css";
import Bubbles from '../../components/Loaders/bubbles';
import NavBar from '../../components/Navbar/navbar';

// Helper function to get today's date in 'YYYY-MM-DD' format
const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
};

// Helper function to format time (e.g., "10:30 AM")
const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

// Helper function to format date (e.g., "Oct 24, 2025")
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export default function DoctorAppointments() {

    const [allAppointments, setAllAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- State for Filters ---
    const [searchTerm, setSearchTerm]=useState("");
    const [statusFilter, setStatusFilter] = useState("Today");
    const [sortOrder, setSortOrder] = useState("asc");

    // --- Data Fetching Effect ---
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

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();

                if (result.data) {
                    setAllAppointments(result.data);
                } else {
                    throw new Error(result.message || "Could not fetch data.");
                }
            } catch (err) {
                console.error("Fetch error:", err);
                setError(err.message);
                toast.error("Failed to fetch appointments.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAppointments();
    }, []);

    // --- Filtering and Sorting Logic ---
    const filteredAppointments = useMemo(() => {
        const today = getTodayString();

        return allAppointments
            .filter(app => {
                let statusMatch = true;
                switch (statusFilter) {
                    case "Today":
                        statusMatch = app.date.startsWith(today) && app.status === "accepted";
                        break;
                    case "Pending":
                        statusMatch = app.status === "Pending";
                        break;
                    case "accepted":
                        statusMatch = app.status === "accepted";
                        break;
                    case "Completed":
                        statusMatch = app.status === "Completed";
                        break;
                    case "rejected":
                        statusMatch = app.status === "rejected";
                        break;
                    case "All":
                    default:
                        statusMatch = true;
                }
                const searchMatch = app.name.toLowerCase().includes(searchTerm.toLowerCase());
                return statusMatch && searchMatch;
            })
            .sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            });
    }, [allAppointments, statusFilter, searchTerm, sortOrder]);

    
    // --- NEW: Function to handle status updates ---
    const handleUpdateStatus = async (appointmentID, newStatus) => {
        const toastId = toast.loading('Updating status...');
        
        try {
            const response = await fetch('http://localhost:8000/appointment/changestatus', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ appointmentID, status: newStatus })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to update status");
            }

            // Update state immediately for a responsive UI
            setAllAppointments(prevApps =>
                prevApps.map(app =>
                    app._id === appointmentID ? { ...app, status: newStatus } : app
                )
            );
            
            toast.success('Status updated successfully!', { id: toastId });

        } catch (err) {
            console.error("Update error:", err);
            toast.error(err.message || "Could not update status.", { id: toastId });
        }
    };


    return (
       <>
            <section className="appointments-page">
                <header className="appointments-header">
                    <h2 className="section-title">Your Appointments</h2>
                    <div className="filter-bar">
                        <div className="search-bar">
                            <FiSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search by patient name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <button
                            className="sort-button"
                            onClick={() => setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'))}
                        >
                            {sortOrder === 'asc' ? <FiArrowUp /> : <FiArrowDown />}
                            Sort by Time
                        </button>
                    </div>
                </header>

                <div className="status-filters">
                    <button
                        className={`filter-chip ${statusFilter === 'Today' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('Today')}
                    >
                        <FiClock /> Today's Accepted
                    </button>
                    <button
                        className={`filter-chip ${statusFilter === 'Pending' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('Pending')}
                    >
                        <FiClock /> Pending
                    </button>
                    <button
                        className={`filter-chip ${statusFilter === 'accepted' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('accepted')}
                    >
                        <FiCalendar /> All Accepted
                    </button>
                    <button
                        className={`filter-chip ${statusFilter === 'Completed' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('Completed')}
                    >
                        <FiCheckSquare /> Completed
                    </button>
                    <button
                        className={`filter-chip ${statusFilter === 'rejected' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('rejected')}
                    >
                        <FiXCircle /> Rejected
                    </button>
                    <button
                        className={`filter-chip ${statusFilter === 'All' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('All')}
                    >
                        All
                    </button>
                </div>

                <div className="appointments-list-container">
                    {isLoading && <Bubbles />}

                    {!isLoading && error && (
                        <div className="error-message">
                            <h3>Oops! Something went wrong.</h3>
                            <p>{error}</p>
                        </div>
                    )}

                    {!isLoading && !error && filteredAppointments.length === 0 && (
                        <div className="no-appointments">
                            <FiCalendar size={50} />
                            <h3>No appointments found.</h3>
                            <p>There are no appointments matching your current filters.</p>
                        </div>
                    )}

                    {!isLoading && !error && filteredAppointments.length > 0 && (
                        <div className="appointments-grid">
                            {filteredAppointments.map(app => (
                                <div key={app._id} className={`appointment-card status-${app.status.toLowerCase()}`}>
                                    <div className="card-header">
                                        <div className="patient-avatar">
                                            <FiUser size={24} />
                                        </div>
                                        <div className="patient-info">
                                            <h3>{app.name}</h3>
                                            <span>{app.age} years old, {app.gender}</span>
                                        </div>
                                        <span className="status-badge">{app.status}</span>
                                    </div>
                                    <div className="card-body">
                                        <p><strong>Symptoms:</strong> {app.symptoms}</p>
                                        <p><strong>Contact:</strong> {app.phone} | {app.email}</p>
                                    </div>
                                    <div className="card-footer">
                                        <div className="time-slot">
                                            <FiCalendar />
                                            <span>{formatDate(app.date)}</span>
                                            <strong>{formatTime(app.date)}</strong>
                                        </div>

                                        {/* --- ACTION BUTTONS WITH onClick HANDLERS --- */}
                                        {app.status === 'Pending' && (
                                            <div className="action-buttons">
                                                <button 
                                                    className="btn-action btn-complete"
                                                    onClick={() => handleUpdateStatus(app._id, 'accepted')}
                                                >
                                                    Accept
                                                </button>
                                                <button 
                                                    className="btn-action btn-cancel"
                                                    onClick={() => handleUpdateStatus(app._id, 'rejected')}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                        
                                        {app.status === 'accepted' && (
                                            <div className="action-buttons">
                                                <button 
                                                    className="btn-action btn-complete"
                                                    onClick={() => handleUpdateStatus(app._id, 'Completed')}
                                                >
                                                    Complete
                                                </button>
                                                <button 
                                                    className="btn-action btn-cancel"
                                                    onClick={() => handleUpdateStatus(app._id, 'rejected')}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}