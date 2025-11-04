import React, { useState, useEffect, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
    FiCalendar,
    FiClock,
    FiPlus,
    FiXCircle,
    FiCheckCircle,
    FiWifi,
    FiWifiOff,
    FiFilter,
} from 'react-icons/fi';
import { FaRupeeSign } from "react-icons/fa";
import "../../css/doctortimeslots.css"; 

import HeartLoader from '../../components/Loaders/heartloader';
// Assuming you have a NavBar component
// import NavBar from '../../components/Navbar/navbar'; 


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
    const [filterMode, setFilterMode] = useState('all'); 

<<<<<<< Updated upstream
    const [formData, setFormData] = useState({
        Day: 'Monday',
        StartTime: '',
        EndTime: '',
        fee: '',
        mode: 'offline', 
    });
=======
>>>>>>> Stashed changes

   const [formData, setFormData] = useState({
    Day: 'Monday',
    StartTime: '',
    EndTime: '',
    fee: '',
    limit: 10,
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

    // Fetch data on component mount
    useEffect(() => {
        fetchTimeSlots();
    }, []);

    // Filter and Group time slots
    const groupedTimeSlots = useMemo(() => {
        const filteredSlots = allTimeSlots.filter(slot => {
            if (filterMode === 'all') return true;
            return slot.mode === filterMode;
        });

        const groups = {};
        DAYS_OF_WEEK.forEach(day => { groups[day] = []; }); 

        filteredSlots.forEach(slot => {
            if (groups[slot.Day]) {
                groups[slot.Day].push(slot);
            }
        });

<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
        for (const day in groups) {
            groups[day].sort((a, b) => a.StartTime.localeCompare(b.StartTime));
        }

        return groups;
    }, [allTimeSlots, filterMode]); 

<<<<<<< Updated upstream
    // Handles changes for all form fields
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handles the sliding mode toggle for the Add New Slot form
    const handleFormModeToggle = (modeValue) => {
        setFormData(prev => ({ ...prev, mode: modeValue }));
    };
    
    // Handles Add New Slot form submission
=======

   const handleFormChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
};



>>>>>>> Stashed changes
    const handleAddSlot = async (e) => {
        e.preventDefault();
        if (!formData.StartTime || !formData.EndTime || !formData.fee || !formData.limit) {
            toast.error("Please fill out all fields.");
            return;
        }
<<<<<<< Updated upstream
        setIsSubmitting(true); 
        
        try {
            const response = await fetch('http://localhost:8000/doctor/addtimeslot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData), 
            });
            if (!response.ok) throw new Error("Failed to add slot.");

            toast.success("Time slot added successfully!");
            setFormData({ Day: 'Monday', StartTime: '', EndTime: '', fee: '', mode: 'offline' }); 
            fetchTimeSlots(); 
        } catch (err) {
            console.error("Submit error:", err);
            toast.error(err.message || "Failed to add time slot.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- NEW: Unified Update Function ---
    // This single function handles all updates (status, mode, etc.)
    const handleUpdateSlot = async (timeslotID, updatePayload) => {
        try {
            const response = await fetch('http://localhost:8000/doctor/changestatus', {
                method: 'PUT', 
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                // Send the ID and the specific fields to update
                body: JSON.stringify({ timeslotID, ...updatePayload }),
            });
            if (!response.ok) throw new Error("Failed to update slot.");

            // Optimistically update the UI
            setAllTimeSlots(prevSlots =>
                prevSlots.map(slot =>
                    slot._id === timeslotID ? { ...slot, ...updatePayload } : slot
                )
            );
            
            // Show a specific toast based on what was updated
            if (updatePayload.status) {
                toast.success(`Slot has been ${updatePayload.status}.`);
            } else if (updatePayload.mode) {
                toast.success(`Slot mode changed to ${updatePayload.mode}.`);
            } else {
                toast.success("Slot updated.");
            }

        } catch (err) {
            console.error("Update error:", err);
            toast.error("Failed to update slot.");
        }
    };

    // --- Wrapper function for changing status ---
    const handleStatusChange = (timeslotID, newStatus) => {
        handleUpdateSlot(timeslotID, { status: newStatus });
    };

    // --- Wrapper function for changing mode ---
    const handleModeChange = (timeslotID, currentMode) => {
        const newMode = currentMode === 'online' ? 'offline' : 'online';
        handleUpdateSlot(timeslotID, { mode: newMode });
    };


    return (
        <>
            {/* <NavBar /> */}
            <Toaster position="top-right" reverseOrder={false} />
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
                        
                        {/* --- Sliding Mode Toggle Button --- */}
                        <div className="form-group">
                            <label>Mode</label>
                            <div className="mode-toggle-container">
                                <div 
                                    className={`mode-option ${formData.mode === 'offline' ? 'active' : ''}`}
                                    onClick={() => handleFormModeToggle('offline')}
                                >
                                    Offline
                                </div>
                                <div 
                                    className={`mode-option ${formData.mode === 'online' ? 'active' : ''}`}
                                    onClick={() => handleFormModeToggle('online')}
                                >
                                    Online
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="StartTime"><FiClock /> Start Time</label>
                            <input
                                type="time"
                                name="StartTime"
                                value={formData.StartTime}
                                onChange={handleFormChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="EndTime"><FiClock /> End Time</label>
                            <input
                                type="time"
                                name="EndTime"
                                value={formData.EndTime}
                                onChange={handleFormChange}
                                required
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
                                required
                            />
                        </div>
                        <button type="submit" className="submit-button" disabled={isSubmitting}>
                             {isSubmitting ? "Adding..." : <><FiPlus /> Add Slot</>}
                        </button>
                    </form>
                </div>

                {/* --- Column 2: Schedule Display --- */}
                <div className="schedule-container">
                    <div className="schedule-header">
                        <h2 className="section-title">Your Weekly Schedule</h2>
                        <div className="filter-group">
                            <label htmlFor="mode-filter"><FiFilter /> Show Mode</label>
                            <select 
                                id="mode-filter" 
                                value={filterMode} 
                                onChange={(e) => setFilterMode(e.target.value)}
                            >
                                <option value="all">All</option>
                                <option value="online">Online</option>
                                <option value="offline">Offline</option>
                            </select>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="loader-container">
                            <HeartLoader />
                        </div>
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
                                                        <span 
                                                            className={`mode mode-${slot.mode} clickable`}
                                                            onClick={() => handleModeChange(slot._id, slot.mode)}
                                                            title={`Click to change to ${slot.mode === 'online' ? 'Offline' : 'Online'}`}
                                                        >
                                                            {slot.mode === 'online' ? <FiWifi /> : <FiWifiOff />}
                                                            {slot.mode.charAt(0).toUpperCase() + slot.mode.slice(1)}
                                                        </span>
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
=======

    
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
        setFormData({ Day: 'Monday', StartTime: '', EndTime: '', fee: '',limit:10 }); // Reset form
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
>>>>>>> Stashed changes
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
                    <div className="form-group">
                        <label htmlFor="limit"><FiPlus /> Limit</label>
                        <input
                            type="number"
                            name="limit"
                            placeholder="e.g., 5"
                            min="1"
                            value={formData.limit}
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
                                                    <span className='fee'>Limit:{slot.limit}</span>
                                                    <span className='fee'>Booked:{slot.booked}</span>
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