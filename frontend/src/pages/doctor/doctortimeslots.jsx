// === DoctorTimeSlots.jsx (FULL UPDATED UI + LOGIC SAFE) === //

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
    FiHash,
    FiEdit2,
    FiSave
} from 'react-icons/fi';
import { FaRupeeSign } from "react-icons/fa";
import "../../css/doctortimeslots.css";
import CustomCalendar from '../../components/Calendar/customcalendar';
import HeartLoader from '../../components/Loaders/heartloader';
const API = import.meta.env.VITE_API_URL;

const DAYS_OF_WEEK = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
];

const formatDisplayTime = (timeStr) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":");
    const date = new Date(0, 0, 0, h, m);
    return date.toLocaleTimeString('en-US', { hour: "2-digit", minute: "2-digit", hour12: true });
};

const formatToHHMM = (date) => {
    const h = date.getHours().toString().padStart(2, "0");
    const m = date.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
};

export default function DoctorTimeSlots() {

    const [allTimeSlots, setAllTimeSlots] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [filterMode, setFilterMode] = useState("all");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [editSlotId, setEditSlotId] = useState(null);
    const [editedLimit, setEditedLimit] = useState("");

    const selectedDayName = DAYS_OF_WEEK[selectedDate.getDay()];  // FIXED DAY BUG

    const fetchTimeSlots = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API}/doctor/gettimeslots`, { credentials: "include" });
            const result = await res.json();
            setAllTimeSlots(result.data || []);
        } catch {
            toast.error("Failed to load time slots.");
        }
        setIsLoading(false);
    };

    useEffect(() => { fetchTimeSlots(); }, []);

    const filteredSlots = useMemo(() =>
        allTimeSlots.filter(slot => {
            if (slot.Day !== selectedDayName) return false;
            if (filterMode === "all") return true;
            return slot[filterMode] || slot.mode === filterMode || slot.status === filterMode;
        }),
        [allTimeSlots, selectedDayName, filterMode]
    );

    const [formData, setFormData] = useState({
        StartTime: "",
        EndTime: "",
        fee: "",
        mode: "offline",
        duration: "",
        slots: "",
        limit: ""
    });

    const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const resetForm = () =>
        setFormData({ StartTime: "", EndTime: "", fee: "", mode: formData.mode, duration: "", slots: "", limit: "" });

    const handleAddSlot = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (formData.mode === "offline") {
                if (!formData.StartTime || !formData.EndTime || !formData.fee || !formData.limit)
                    return toast.error("Fill all offline fields.");

                await fetch(`${API}/doctor/addtimeslot`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        Day: selectedDayName,
                        StartTime: formData.StartTime,
                        EndTime: formData.EndTime,
                        fee: formData.fee,
                        mode: "offline",
                        limit: Number(formData.limit)
                    })
                });

                toast.success("Offline slot added");
            } else {
                if (!formData.StartTime || !formData.duration || !formData.slots || !formData.fee)
                    return toast.error("Fill all online fields.");

                let current = new Date(0, 0, 0, ...formData.StartTime.split(":"));
                const duration = Number(formData.duration);

                for (let i = 0; i < Number(formData.slots); i++) {
                    const end = new Date(current);
                    end.setMinutes(current.getMinutes() + duration);

                    await fetch(`${API}/doctor/addtimeslot`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({
                            Day: selectedDayName,
                            StartTime: formatToHHMM(current),
                            EndTime: formatToHHMM(end),
                            fee: formData.fee,
                            mode: "online"
                        })
                    });

                    current = end;
                }

                toast.success(`${formData.slots} online slots created`);
            }

            resetForm();
            fetchTimeSlots();
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateSlot = async (payload) => {
        await fetch(`${API}/doctor/changestatus`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload)
        });
        fetchTimeSlots();
    };

    const cancelSlot = (slot) => {
        if (slot.booked > 0)
            return toast.error("Cannot cancel. Patients already booked.");
        updateSlot({ timeslotID: slot._id, status: "cancelled" });
        toast.success("Slot cancelled");
    };

    const reactivateSlot = (slot) => {
        updateSlot({ timeslotID: slot._id, status: "available" });
        toast.success("Slot reactivated");
    };

    const toggleMode = (slot) => {
        updateSlot({ timeslotID: slot._id, mode: slot.mode === "online" ? "offline" : "online" });
        toast.success("Mode changed");
    };

    const saveLimit = (slot) => {
        if (!editedLimit || editedLimit < slot.booked)
            return toast.error("Limit must be ≥ booked");
        updateSlot({ timeslotID: slot._id, limit: Number(editedLimit) });
        toast.success("Limit updated");
        setEditSlotId(null);
    };

    return (
        <>
            <Toaster position="top-right" />

            <section className="timeslots-page">

                {/* === LEFT ADD SLOT FORM === */}
                <div className="timeslot-form-card">

                    <h2 className="form-title">Add Time Slot</h2>

                    <label className="label-title"><FiCalendar /> Select Date</label>
                    <CustomCalendar
                        value={selectedDate}
                        onChange={setSelectedDate}
                        minDate={new Date()}    // DISABLE PAST DATES
                        className="calendar-styled"
                    />

                    <div className="form-group">
                        <label>Day</label>
                        <input type="text" value={selectedDayName} readOnly />
                    </div>

                    <div className="mode-toggle">
                        <button className={formData.mode === "offline" ? "active" : ""} onClick={() => setFormData({ ...formData, mode: "offline" })}>Offline</button>
                        <button className={formData.mode === "online" ? "active" : ""} onClick={() => setFormData({ ...formData, mode: "online" })}>Online</button>
                    </div>

                    <form onSubmit={handleAddSlot}>
                        <div className="form-group">
                            <label><FiClock /> Start Time</label>
                            <input type="time" name="StartTime" value={formData.StartTime} onChange={handleFormChange} required />
                        </div>

                        <div className="form-group">
                            <label><FaRupeeSign /> Fee</label>
                            <input type="number" name="fee" value={formData.fee} onChange={handleFormChange} required />
                        </div>

                        {formData.mode === "offline" ? (
                            <>
                                <div className="form-group">
                                    <label><FiClock /> End Time</label>
                                    <input type="time" name="EndTime" value={formData.EndTime} onChange={handleFormChange} required />
                                </div>
                                <div className="form-group">
                                    <label><FiHash /> Limit</label>
                                    <input type="number" name="limit" value={formData.limit} onChange={handleFormChange} min="1" required />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="form-group">
                                    <label><FiClock /> Duration (mins)</label>
                                    <input type="number" name="duration" value={formData.duration} onChange={handleFormChange} required />
                                </div>
                                <div className="form-group">
                                    <label><FiHash /> Number of Slots</label>
                                    <input type="number" name="slots" value={formData.slots} onChange={handleFormChange} required />
                                </div>
                            </>
                        )}

                        <button type="submit" className="submit-btn" disabled={isSubmitting}>
                            {isSubmitting ? "Adding..." : <><FiPlus /> Add Slot</>}
                        </button>
                    </form>
                </div>

                {/* === RIGHT SIDE — SCHEDULE PANEL === */}
                <div className="schedule-container">

                    <div className="schedule-header">
                        <h2>{selectedDayName} Schedule</h2>

                        <div className="filter-bar">
                            {["all", "online", "offline", "available", "cancelled"].map(mode => (
                                <button
                                    key={mode}
                                    className={filterMode === mode ? "filter-active" : ""}
                                    onClick={() => setFilterMode(mode)}
                                >
                                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="loader-container"><HeartLoader /></div>
                    ) : (
                        <div className="slots-grid">
                            {filteredSlots.length ? filteredSlots.map(slot => (
                                <div key={slot._id} className={`slot-card ${slot.status}`}>

                                    {slot.status === "cancelled" && <span className="badge-cancel">Cancelled</span>}

                                    <p className="slot-time">{formatDisplayTime(slot.StartTime)} - {formatDisplayTime(slot.EndTime)}</p>
                                    <p className="slot-fee">₹{slot.fee}</p>

                                    <div className="limit-edit-row">
                                        {editSlotId === slot._id ? (
                                            <>
                                                <input
                                                    type="number"
                                                    className="limit-input"
                                                    value={editedLimit}
                                                    min={slot.booked}
                                                    onChange={(e) => setEditedLimit(e.target.value)}
                                                />
                                                <button className="save-limit-btn" onClick={() => saveLimit(slot)}>
                                                    <FiSave />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <p className="slot-booking">Booked: {slot.booked || 0} / {slot.limit || 1}</p>
                                                <button className="edit-limit-btn" onClick={() => { setEditSlotId(slot._id); setEditedLimit(slot.limit || 1); }}>
                                                    <FiEdit2 />
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    <div className="slot-footer">
                                        <button className="mode-btn" disabled={slot.status === "cancelled"} onClick={() => toggleMode(slot)}>
                                            {slot.mode === "online" ? <FiWifi /> : <FiWifiOff />} {slot.mode}
                                        </button>

                                        {slot.status === "available" ? (
                                            <button className="cancel-btn" disabled={slot.booked > 0} onClick={() => cancelSlot(slot)}>
                                                <FiXCircle />
                                            </button>
                                        ) : (
                                            <button className="activate-btn" onClick={() => reactivateSlot(slot)}>
                                                <FiCheckCircle />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )) : <p className="no-slots">No Slots Found</p>}
                        </div>
                    )}
                </div>

            </section>
        </>
    );
}
