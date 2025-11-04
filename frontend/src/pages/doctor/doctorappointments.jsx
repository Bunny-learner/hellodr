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
    FiArrowDown
} from 'react-icons/fi';
import "../../css/DoctorAppointments.css";
import Bubbles from '../../components/Loaders/bubbles';


// Helper functions
const getTodayString = () => new Date().toISOString().split('T')[0];
const formatTime = dateString => new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
const formatDate = dateString => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export default function DoctorAppointments() {
    const navigate=useNavigate()
    const [allAppointments, setAllAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("today");
    const [sortOrder, setSortOrder] = useState("asc");
    

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
                if(response.status==401){
                    console.log(response.status)
                    navigate("/doctor/login?Session has expired please login again")}
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
    }, []);

  
    const filteredAppointments = useMemo(() => {
        const today = getTodayString();
        return allAppointments
            .filter(app => {
                const status = app.status.toLowerCase();
                const filter = statusFilter.toLowerCase();
                let statusMatch = true;

                switch (filter) {
                    case "today":
                        statusMatch = app.date.startsWith(today) && status === "accepted";
                        break;
                    case "pending":
                        statusMatch = status === "pending";
                        break;
                    case "accepted":
                        statusMatch = status === "accepted";
                        break;
                    case "completed":
                        statusMatch = status === "completed";
                        break;
                    case "rejected":
                        statusMatch = status === "rejected"||status=="cancelled";
                        break;
                    case "all":
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


    const handleUpdateStatus = async (appointmentID, newStatus) => {


        if(newStatus=="completed"|| newStatus=="cancelled"){
             let what = newStatus.slice(0, -2) + "ing";

            const result = await Swal.fire({
            title: `${what} Appointment?`,
            html: "Are you sure you want to confirm this appointment?<br><br>" +
                `<strong>By ${what}, you are authorizing the release of the payment to  account.</strong>`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: `Yes, ${what} it!`,
            cancelButtonText: "Cancel"
        });


        if (!result.isConfirmed) return;

    }
       
        const toastId = toast.loading('Updating status...');
         let info=null
         if(newStatus=="completed")info="proceed"
         else if(newStatus=="cancelled")info="cancel"

         let who=info=="completed"?"Your":"Their"
        try {
            const response = await fetch(`http://localhost:8000/appointment/changestatus?info=${info}`, {
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

           

             if(response.status==201 && info)
                toast.success(`Funds transferred to ${who} account successfully`)
             if(response.status!=201)
                toast.error(response.message)

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
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <button className="sort-button" onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}>
                            {sortOrder === 'asc' ? <FiArrowUp /> : <FiArrowDown />} Sort by Time
                        </button>
                    </div>
                </header>

                <div className="status-filters">
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
                        </div>
                    )}

                    {!isLoading && !error && filteredAppointments.length > 0 && (
                        <div className="appointments-grid">
                            {filteredAppointments.map(app => (
                                <div key={app._id} className={`appointment-card status-${app.status.toLowerCase()}`}>
                                    <div className="card-header">
                                        <div className="patient-avatar"><FiUser size={24} /></div>
                                        <div className="patient-info">
                                            <h3>{app.name}</h3>
                                            <span>{app.age} yrs, {app.gender}</span>
                                        </div>
                                        <span className={`status-badge status-${app.status.toLowerCase()}`}>{app.status}</span>
                                    </div>

                                    <div className="card-body">
                                        <p><strong>Symptoms:</strong> {app.symptoms}</p>
                                        <p><strong>Contact:</strong> {app.phone} | {app.email}</p>
                                    </div>

                                    <div className="card-footer">
                                        <div className="time-slot">
                                            <FiCalendar /> <span>{formatDate(app.date)}</span> <strong>{formatTime(app.date)}</strong>
                                        </div>

                                        {/* --- ACTION BUTTONS --- */}
                                        {app.status.toLowerCase() === 'pending' && (
                                            <div className="action-buttons">
                                                <button className="btn-action btn-accept" onClick={() => handleUpdateStatus(app._id, 'accepted')}>Accept</button>
                                                <button className="btn-action btn-reject" onClick={() => handleUpdateStatus(app._id, 'cancelled')}>Reject</button>
                                            </div>
                                        )}
                                        {app.status.toLowerCase() === 'accepted' && (
                                            <div className="action-buttons">
                                                <button className="btn-action btn-complete" onClick={() => handleUpdateStatus(app._id, 'completed')}>Complete</button>
                                                <button className="btn-action btn-cancel" onClick={() => handleUpdateStatus(app._id, 'cancelled')}>Cancel</button>
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
