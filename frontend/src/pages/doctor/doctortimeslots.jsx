import React, { useState, useEffect, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
    FiCalendar,
    FiClock,
    FiPlus,
    FiDollarSign,
    FiXCircle,
    FiCheckCircle,
} from 'react-icons/fi';
import { FaRupeeSign } from "react-icons/fa";
import "../../css/doctortimeslots.css";
import Bubbles from '../../components/Loaders/bubbles';
import HeartLoader from '../../components/Loaders/heartloader';
import NavBar from '../../components/Navbar/navbar';


const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Helper to format time (e.g., "3:30" -> "03:30 AM")
const formatDisplayTime = (timeStr) => {
    if (!timeStr) return '';
    const [hour, minute] = timeStr.split(':');
    const date = new Date(0, 0, 0, hour, minute);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

export default function DoctorTimeSlots() {
    const [allTimeSlots, setAllTimeSlots] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    
    const [formData, setFormData] = useState({
        Day: 'Monday',
        StartTime: '',
        EndTime: '',
        fee: '',
    });

    
    const fetchTimeSlots = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:8000/doctor/gettimeslots', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();
            if (result.data) {
                setAllTimeSlots(result.data);
            } else {
                throw new Error(result.message || "Could not fetch time slots.");
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setError(err.message);
            toast.error("Failed to fetch time slots.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- Fetch data on component mount ---
    useEffect(() => {
        fetchTimeSlots();
    }, []);

    // --- Group time slots by day ---
    const groupedTimeSlots = useMemo(() => {
        const groups = {};
        DAYS_OF_WEEK.forEach(day => { groups[day] = []; }); // Initialize all days

        allTimeSlots.forEach(slot => {
            if (groups[slot.Day]) {
                groups[slot.Day].push(slot);
            }
        });

        
        for (const day in groups) {
            groups[day].sort((a, b) => a.StartTime.localeCompare(b.StartTime));
        }

        return groups;
    }, [allTimeSlots]);

    
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    
    const handleAddSlot = async (e) => {
        e.preventDefault();
        if (!formData.StartTime || !formData.EndTime || !formData.fee) {
            toast.error("Please fill out all fields.");
            return;
        }
        setIsLoading(true);
        
        try {
            const response = await fetch('http://localhost:8000/doctor/addtimeslot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error("Failed to add slot.");

            toast.success("Time slot added successfully!");
            setFormData({ Day: 'Monday', StartTime: '', EndTime: '', fee: '' }); // Reset form
            fetchTimeSlots(); // Refetch all slots to show the new one
        } catch (err) {
            console.error("Submit error:", err);
            toast.error(err.message || "Failed to add time slot.");
        } finally {
            setIsLoading(false);
        }
    };

    
    const handleStatusChange = async (timeslotID, newStatus) => {
        try {
            const response = await fetch('http://localhost:8000/doctor/changestatus', {
                method: 'PUT', 
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ timeslotID, status: newStatus }),
            });
            if (!response.ok) throw new Error("Failed to update status.");

            toast.success(`Slot has been ${newStatus}.`);

            
            setAllTimeSlots(prevSlots =>
                prevSlots.map(slot =>
                    slot._id === timeslotID ? { ...slot, status: newStatus } : slot
                )
            );
        } catch (err) {
            console.error("Status change error:", err);
            toast.error("Failed to update status.");
        }
    };

    return (
        <>
            <section className="timeslots-page">
                {/* --- Column 1: Add Time Slot Form --- */}
                <div className="timeslot-form-card">
                    <h2 className="section-title">Add New Time Slot</h2>
                    <form onSubmit={handleAddSlot}>
                        <div className="form-group">
                            <label htmlFor="Day"><FiCalendar /> Day of Week</label>
                            <select name="Day" value={formData.Day} onChange={handleFormChange}>
                                {DAYS_OF_WEEK.map(day => (
                                    <option key={day} value={day}>{day}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="StartTime"><FiClock /> Start Time</label>
                            <input
                                type="time"
                                name="StartTime"
                                value={formData.StartTime}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="EndTime"><FiClock /> End Time</label>
                            <input
                                type="time"
                                name="EndTime"
                                value={formData.EndTime}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="fee"><FaRupeeSign /> Fee</label>
                            <input
                                type="number"
                                name="fee"
                                placeholder="e.g., 400"
                                value={formData.fee}
                                onChange={handleFormChange}
                            />
                        </div>
                        <button type="submit" className="submit-button" disabled={isSubmitting}>
                             <><FiPlus /> Add Slot</>
                        </button>
                    </form>
                </div>

                
                <div className="schedule-container">
                    <h2 className="section-title">Your Weekly Schedule</h2>
                    {isLoading ? (
                        <HeartLoader />
                    ) : error ? (
                        <div className="error-message">
                            <h3>Oops! Something went wrong.</h3>
                            <p>{error}</p>
                        </div>
                    ) : (
                        <div className="day-grid">
                            {DAYS_OF_WEEK.map(day => (
                                <div key={day} className="day-card">
                                    <h3>{day}</h3>
                                    <div className="slots-list">
                                        {groupedTimeSlots[day]?.length > 0 ? (
                                            groupedTimeSlots[day].map(slot => (
                                                <div
                                                    key={slot._id}
                                                    className={`timeslot-item status-${slot.status.toLowerCase()}`}
                                                >
                                                    <div className="timeslot-info">
                                                        <span className="time">
                                                            {formatDisplayTime(slot.StartTime)} - {formatDisplayTime(slot.EndTime)}
                                                        </span>
                                                        <span className="fee">Fee: ₹{slot.fee}</span>
                                                    </div>
                                                    <div className="timeslot-actions">
                                                        {slot.status === 'available' || slot.status === 'scheduled' ? (
                                                            <button
                                                                className="btn-action-slot btn-cancel-slot"
                                                                onClick={() => handleStatusChange(slot._id, 'cancelled')}
                                                                title="Cancel this slot"
                                                            >
                                                                <FiXCircle />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className="btn-action-slot btn-activate-slot"
                                                                onClick={() => handleStatusChange(slot._id, 'available')}
                                                                title="Re-activate this slot"
                                                            >
                                                                <FiCheckCircle />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="no-slots">No slots scheduled.</p>
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