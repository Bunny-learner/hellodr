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
    FiHash, // Added for new fields
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

// --- NEW HELPER ---
// Helper to format a Date object to "HH:mm" string
const formatToHHMM = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

export default function DoctorTimeSlots() {
    const [allTimeSlots, setAllTimeSlots] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [filterMode, setFilterMode] = useState('all'); 

    // --- MODIFIED: Updated formData state ---
    const [formData, setFormData] = useState({
        Day: 'Monday',
        StartTime: '',
        EndTime: '',   // For offline
        fee: '',
        mode: 'offline', 
        duration: '',  // For online
        slots: '',     // For online
        limit: '',     // For offline
    });

    // --- MODIFIED: New form reset state ---
    const resetForm = () => {
        setFormData({
            Day: formData.Day, // Keep the selected day for convenience
            StartTime: '',
            EndTime: '',
            fee: '',
            mode: formData.mode, // Keep the selected mode
            duration: '',
            slots: '',
            limit: '',
        });
    }

    
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

    // Filter and Group time slots (No changes)
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

        for (const day in groups) {
            groups[day].sort((a, b) => a.StartTime.localeCompare(b.StartTime));
        }

        return groups;
    }, [allTimeSlots, filterMode]); 

    // Handles changes for all form fields (No changes)
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handles the sliding mode toggle for the Add New Slot form (No changes)
    const handleFormModeToggle = (modeValue) => {
        setFormData(prev => ({ ...prev, mode: modeValue }));
    };
    
    // --- MODIFIED: handleAddSlot function ---
    // This function now handles both 'offline' (single slot) and 'online' (multiple slots)
    const handleAddSlot = async (e) => {
        e.preventDefault();
        setIsSubmitting(true); 
        
        try {
            if (formData.mode === 'offline') {
                // --- OFFLINE LOGIC ---
                if (!formData.StartTime || !formData.EndTime || !formData.fee || !formData.limit) {
                    toast.error("Please fill out all fields for offline slot.");
                    setIsSubmitting(false);
                    return;
                }
                
                const payload = {
                    Day: formData.Day,
                    StartTime: formData.StartTime,
                    EndTime: formData.EndTime,
                    fee: formData.fee,
                    mode: 'offline',
                    limit: parseInt(formData.limit, 10)
                };

                const response = await fetch('http://localhost:8000/doctor/addtimeslot', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(payload), 
                });
                if (!response.ok) throw new Error("Failed to add offline slot.");
                
                toast.success("Offline slot added successfully!");

            } else {
                // --- ONLINE LOGIC ---
                if (!formData.StartTime || !formData.fee || !formData.duration || !formData.slots) {
                    toast.error("Please fill out all fields for online slots.");
                    setIsSubmitting(false);
                    return;
                }

                const [startHour, startMinute] = formData.StartTime.split(':').map(Number);
                const durationInMins = parseInt(formData.duration, 10);
                const numSlots = parseInt(formData.slots, 10);

                if (isNaN(durationInMins) || durationInMins <= 0 || isNaN(numSlots) || numSlots <= 0) {
                    toast.error("Duration and number of slots must be positive numbers.");
                    setIsSubmitting(false);
                    return;
                }

                const slotsToCreate = [];
                let currentStartTime = new Date(0, 0, 0, startHour, startMinute);

                for (let i = 0; i < numSlots; i++) {
                    let currentEndTime = new Date(currentStartTime);
                    currentEndTime.setMinutes(currentStartTime.getMinutes() + durationInMins);

                    slotsToCreate.push({
                        Day: formData.Day,
                        StartTime: formatToHHMM(currentStartTime),
                        EndTime: formatToHHMM(currentEndTime),
                        fee: formData.fee,
                        mode: 'online',
                        // limit: 1 // Backend schema now defaults to 1
                    });

                    // Set start time for the *next* slot
                    currentStartTime = currentEndTime;
                }

                // Send all generated slots to the backend
                const promises = slotsToCreate.map(slot =>
                    fetch('http://localhost:8000/doctor/addtimeslot', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify(slot),
                    })
                );

                const responses = await Promise.all(promises);

                const failedResponses = responses.filter(res => !res.ok);
                if (failedResponses.length > 0) {
                    throw new Error(`Failed to add ${failedResponses.length} out of ${numSlots} slots.`);
                }
                
                toast.success(`${numSlots} online slots added successfully!`);
            }
            
            // Common success logic: Reset form and fetch new slots
            resetForm(); // Use the new reset function
            fetchTimeSlots(); 

        } catch (err) {
            console.error("Submit error:", err);
            toast.error(err.message || "Failed to add time slot(s).");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Unified Update Function (No changes) ---
    const handleUpdateSlot = async (timeslotID, updatePayload) => {
        try {
            const response = await fetch('http://localhost:8000/doctor/changestatus', {
                method: 'PUT', 
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ timeslotID, ...updatePayload }),
            });
            if (!response.ok) throw new Error("Failed to update slot.");

            setAllTimeSlots(prevSlots =>
                prevSlots.map(slot =>
                    slot._id === timeslotID ? { ...slot, ...updatePayload } : slot
                )
            );
            
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

    // --- Wrapper function for changing status (No changes) ---
    const handleStatusChange = (timeslotID, newStatus) => {
        handleUpdateSlot(timeslotID, { status: newStatus });
    };

    // --- Wrapper function for changing mode (No changes) ---
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
                    
                    {/* --- MODIFIED: Form with conditional fields --- */}
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
                            <label htmlFor="fee"><FaRupeeSign /> Fee</label>
                            <input
                                type="number"
                                name="fee"
                                placeholder="e.g., 400"
                                value={formData.fee}
                                onChange={handleFormChange}
                                required
                                min="0"
                            />
                        </div>

                        {/* --- CONDITIONAL FIELDS --- */}
                        {formData.mode === 'offline' ? (
                            <>
                                <div className="form-group">
                                    <label htmlFor="EndTime"><FiClock /> End Time</label>
                                    <input
                                        type="time"
                                        name="EndTime"
                                        value={formData.EndTime}
                                        onChange={handleFormChange}
                                        required={formData.mode === 'offline'}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="limit"><FiHash /> Consultation Limit</label>
                                    <input
                                        type="number"
                                        name="limit"
                                        placeholder="Max. patients for this slot"
                                        value={formData.limit}
                                        onChange={handleFormChange}
                                        required={formData.mode === 'offline'}
                                        min="1"
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="form-group">
                                    <label htmlFor="duration"><FiClock /> Duration (in mins)</label>
                                    <input
                                        type="number"
                                        name="duration"
                                        placeholder="e.g., 10"
                                        value={formData.duration}
                                        onChange={handleFormChange}
                                        required={formData.mode === 'online'}
                                        min="1"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="slots"><FiHash /> Number of Slots</label>
                                    <input
                                        type="number"
                                        name="slots"
                                        placeholder="e.g., 5"
                                        value={formData.slots}
                                        onChange={handleFormChange}
                                        required={formData.mode === 'online'}
                                        min="1"
                                    />
                                </div>
                            </>
                        )}
                        {/* --- END CONDITIONAL FIELDS --- */}
                        
                        <button type="submit" className="submit-button" disabled={isSubmitting}>
                             {isSubmitting ? "Adding..." : <><FiPlus /> Add Slot(s)</>}
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
                                                        
                                                        {/* --- NEW: Show Booked / Limit --- */}
                                                        <span className="booked-info">
                                                            Booked: {slot.booked || 0} / {slot.limit}
                                                        </span>
                                                        {/* --- END NEW --- */}

                                                        <span 
                                                            className={`mode mode-${slot.mode} clickable`}
                                                            onClick={() => handleModeChange(slot._id, slot.mode)}
                                                            title={`Click to change to ${slot.mode === 'online' ? 'Offline' : 'Online'}`}
                                                        >
                                                            {slot.mode === 'online' ? <FiWifi /> : <FiWifiOff />}
                                                            {slot.mode.charAt(0).toUpperCase() + slot.mode.slice(1)}
                                                        </span>
                                                    </div>

                                                    {/* --- MODIFIED: ACTION BUTTON LOGIC --- */}
                                                    <div className="timeslot-actions">
                                                        {/* Check if slot is full first */}
                                                        {(slot.booked >= slot.limit && slot.limit > 0) ? (
                                                            <span className="booked-info" title="Slot is full and cannot be modified.">
                                                                Full
                                                            </span>
                                                        ) : (
                                                            // If NOT full, show Cancel or Re-activate
                                                            <>
                                                                {slot.status === 'available' || slot.status === 'scheduled' ? (
                                                                    <button
                                                                        className="btn-action-slot btn-cancel-slot"
                                                                        onClick={() => handleStatusChange(slot._id, 'cancelled')}
                                                                        title={slot.booked > 0 ? "Cannot cancel: Slot has bookings" : "Cancel this slot"}
                                                                        disabled={slot.booked > 0}
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
                                                            </>
                                                        )}
                                                    </div>
                                                    {/* --- END MODIFICATION --- */}

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