import React, { useState, useEffect, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import CustomCalendar from "../../components/Calendar/customcalendar.jsx";

import {
  FiSearch,
  FiCalendar,
  FiCheckSquare,
  FiXCircle,
  FiClock,
  FiWifi,
  FiHome,
  FiAlertCircle,
  FiMessageSquare,
  FiFilter,
  FiSkipForward,
  FiX,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";

const API = import.meta.env.VITE_API_URL;
import "../../css/doctorappointments.css";
import Bubbles from "../../components/Loaders/bubbles";
import { useSocket } from "../../pages/SocketContext.jsx";

// ---------- Helpers ----------
const toDateOnlyKey = (d) => {
  if (!d) return null;
  const dd = new Date(d);
  dd.setHours(0, 0, 0, 0);
  return (
    dd.getFullYear() +
    "-" +
    String(dd.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(dd.getDate()).padStart(2, "0")
  );
};

const formatDatePretty = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

// ---------- CONSTANTS ----------
// Live Queue is now FIRST in the array
const STATUS_TABS = [
  { value: "accepted", label: "Live Queue", icon: <FiCheckSquare /> },
  { value: "pending", label: "Pending", icon: <FiClock /> },
  { value: "next_up", label: "Next Up", icon: <FiClock /> },
  { value: "in_progress", label: "In Call", icon: <FiMessageSquare /> },
  { value: "completed", label: "Completed", icon: <FiCheckSquare /> },
  { value: "rejected", label: "Rejected", icon: <FiXCircle /> },
  { value: "skipped", label: "Skipped", icon: <FiSkipForward /> },
  { value: "all", label: "All", icon: <FiFilter /> },
];

// ... (Keep PendingAppointmentCard and ArchivedAppointmentCard exactly as they were) ...
// For brevity in this response, I am assuming the Card components (PendingAppointmentCard, ArchivedAppointmentCard)
// remain exactly the same as your original code. 
// PASTE THE CARD COMPONENTS HERE IF RE-COPYING THE WHOLE FILE.

/* -------------------------------------------------------------------- */
/* ---------------------- PENDING APPOINTMENT CARD --------------------- */
/* -------------------------------------------------------------------- */
const PendingAppointmentCard = ({ app, onUpdateStatus }) => (
  <div className="appt-card pending-card">
    <div className="card-header">
      <div className="patient-avatar-wrapper">
        <div className="patient-avatar">
          {(app.name || "P").charAt(0).toUpperCase()}
        </div>
        <div className="patient-info">
          <h3 className="patient-name">{app.name}</h3>
          <p className="patient-details">
            {app.age} yrs • {app.gender}
          </p>
        </div>
      </div>
      <div className="status-badge pending-badge">
        <FiClock size={14} />
        Pending
      </div>
    </div>

    <div className="card-body">
      <div className="info-grid">
        <div className="info-item">
          <FiCalendar className="info-icon" />
          <div className="info-content">
            <span className="info-label">Date</span>
            <span className="info-value">{formatDatePretty(app.date)}</span>
          </div>
        </div>

        <div className="info-item">
          <FiClock className="info-icon" />
          <div className="info-content">
            <span className="info-label">Time</span>
            <span className="info-value">
              {app.TimeSlot
                ? `${app.TimeSlot.StartTime} - ${app.TimeSlot.EndTime}`
                : "N/A"}
            </span>
          </div>
        </div>

        <div className="info-item">
          {app.mode?.toLowerCase() === "online" ? (
            <FiWifi className="info-icon" />
          ) : (
            <FiHome className="info-icon" />
          )}
          <div className="info-content">
            <span className="info-label">Mode</span>
            <span className="info-value">{app.mode}</span>
          </div>
        </div>
      </div>

      <div className="symptoms-section">
        <span className="symptoms-label">Symptoms</span>
        <p className="symptoms-text">{app.symptoms}</p>
      </div>
    </div>

    <div className="card-actions">
      <button
        className="action-btn reject-btn"
        onClick={() => onUpdateStatus(app._id, "cancelled", "pending")}
      >
        <FiXCircle />
        Reject
      </button>
      <button
        className="action-btn accept-btn"
        onClick={() => onUpdateStatus(app._id, "accepted", "pending")}
      >
        <FiCheckSquare />
        Accept
      </button>
    </div>
  </div>
);

const ArchivedAppointmentCard = ({ app, onUpdateStatus, onStartCall }) => {
  const status = (app.status || "").toLowerCase();
  const isOnline = (app.mode || "").toLowerCase() === "online";

  const isJoinEnabled = isOnline && (status === "next_up" || status === "in_progress");
  const showJoin = (status === "accepted" || status === "next_up" || status === "in_progress") && isOnline;
  const showComplete = status === "in_progress" && !isOnline;
  const showSkip = status === "next_up";
  const showCancel = ["accepted", "next_up", "in_progress"].includes(status);
  const isArchived = ["completed", "cancelled", "rejected", "no_show", "skipped"].includes(status);

  const getStatusLabel = (s) => {
    switch (s) {
      case "next_up":
        return "Next Up";
      case "in_progress":
        return "In Progress";
      case "accepted":
        return "Waiting";
      case "no_show":
        return "No-Show";
      default:
        return s.charAt(0).toUpperCase() + s.slice(1);
    }
  };

  const getStatusIcon = (s) => {
    switch (s) {
      case "next_up":
        return <FiClock />;
      case "in_progress":
        return <FiMessageSquare />;
      case "accepted":
        return <FiCheckSquare />;
      case "completed":
        return <FiCheckSquare />;
      case "cancelled":
      case "rejected":
        return <FiXCircle />;
      case "skipped":
        return <FiSkipForward />;
      default:
        return <FiClock />;
    }
  };

  return (
    <div className={`appt-card archive-card status-${status}`}>
      <div className="card-header">
        <div className="patient-avatar-wrapper">
          <div className="patient-avatar">
            {(app.name || "P").charAt(0).toUpperCase()}
          </div>
          <div className="patient-info">
            <h3 className="patient-name">{app.name}</h3>
            <p className="patient-details">
              {app.age} yrs • {app.gender}
            </p>
          </div>
        </div>
        <div className={`status-badge status-${status}`}>
          {getStatusIcon(status)}
          {getStatusLabel(status)}
        </div>
      </div>

      <div className="card-body">
        <div className="info-grid">
          <div className="info-item">
            <FiCalendar className="info-icon" />
            <div className="info-content">
              <span className="info-label">Date</span>
              <span className="info-value">{formatDatePretty(app.date)}</span>
            </div>
          </div>

          <div className="info-item">
            <FiClock className="info-icon" />
            <div className="info-content">
              <span className="info-label">Time</span>
              <span className="info-value">
                {app.TimeSlot
                  ? `${app.TimeSlot.StartTime} - ${app.TimeSlot.EndTime}`
                  : "N/A"}
              </span>
            </div>
          </div>

          <div className="info-item">
            {isOnline ? (
              <FiWifi className="info-icon" />
            ) : (
              <FiHome className="info-icon" />
            )}
            <div className="info-content">
              <span className="info-label">Mode</span>
              <span className="info-value">{app.mode}</span>
            </div>
          </div>
        </div>

        {isArchived && (
          <div className="symptoms-section archived">
            <span className="symptoms-label">Symptoms</span>
            <p className="symptoms-text">{app.symptoms}</p>
          </div>
        )}
      </div>

      {!isArchived && (
        <div className="card-actions">
          {showJoin && (
            <button
              className={`action-btn join-btn ${!isJoinEnabled ? "disabled" : ""}`}
              title={isJoinEnabled ? "Join Chat" : "Waiting for queue..."}
              disabled={!isJoinEnabled}
              onClick={() => onStartCall(app)}
            >
              <FiMessageSquare />
              {status === "in_progress"
                ? "Re-join"
                : isJoinEnabled
                ? "Start Chat"
                : "Waiting..."}
            </button>
          )}

          {showComplete && (
            <button
              className="action-btn complete-btn"
              onClick={() => onUpdateStatus(app._id, "completed", "in_progress")}
            >
              <FiCheckSquare />
              Complete
            </button>
          )}

          {showSkip && (
            <button
              className="action-btn skip-btn"
              onClick={() => onUpdateStatus(app._id, "skipped", "next_up")}
              title="Skip this patient"
            >
              <FiSkipForward />
              Skip
            </button>
          )}

          {showCancel && (
            <button
              className="action-btn cancel-btn"
              onClick={() => onUpdateStatus(app._id, "cancelled", "accepted")}
            >
              <FiXCircle />
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// --------------------------------------------------------------------
// --------------------------- MAIN COMPONENT --------------------------
// --------------------------------------------------------------------
export default function DoctorAppointments() {
  const navigate = useNavigate();
  const { socket } = useSocket() || {};

  const [appointmentsList, setAppointmentsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("accepted"); // Default is Live Queue
  const [modeFilter, setModeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("asc");

  const [showDateFilter, setShowDateFilter] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // ... (Fetch logic remains the same) ...
  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      setError(null);
      setAppointmentsList([]);

      const url = new URL(`${API}/doctor/appointments`);
      // If accepted, we fetch livequeue items from backend, otherwise standard filter
      if (statusFilter === "accepted") {
        url.searchParams.append("status", "livequeue");
      } else {
        url.searchParams.append("status", statusFilter);
      }

      if (selectedDate) {
        url.searchParams.append("date", toDateOnlyKey(selectedDate));
      }

      try {
        const response = await fetch(url.toString(), {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (response.status === 401) {
          navigate("/doctor/login?Session expired");
          return;
        }

        if (!response.ok) throw new Error("Failed to fetch");

        const result = await response.json();
        setAppointmentsList(result.data || []);
      } catch (err) {
        setError(err.message);
        toast.error("Failed to fetch...");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [navigate, statusFilter, selectedDate]);

  // ... (Socket logic remains same) ...
  useEffect(() => {
    if (!socket) return;
    const onStatusChanged = ({ appointmentID, status }) => {
      setAppointmentsList((prev) =>
        prev.map((a) => (a._id === appointmentID ? { ...a, status } : a))
      );
    };
    socket.on?.("appointment:StatusChanged", onStatusChanged);
    return () => socket.off?.("appointment:StatusChanged", onStatusChanged);
  }, [socket]);

  // ... (Filter Logic - slightly cleaned up but logic same) ...
  const filteredAppointments = useMemo(() => {
    const liveQueueStatuses = ["accepted", "next_up", "in_progress"];
    const selectedDateKey = toDateOnlyKey(selectedDate);
    let list = [...appointmentsList];

    if (selectedDateKey) {
      list = list.filter((app) => toDateOnlyKey(app.date) === selectedDateKey);
    }

    if (statusFilter === "accepted") {
      list = list.filter((app) =>
        liveQueueStatuses.includes((app.status || "").toLowerCase())
      );
    } else if (statusFilter !== "all") {
      list = list.filter(
        (app) => (app.status || "").toLowerCase() === statusFilter
      );
    }

    list = list.filter((app) =>
      modeFilter === "all"
        ? true
        : (app.mode || "").toLowerCase() === modeFilter
    );

    const q = searchTerm.toLowerCase();
    if (q) {
      list = list.filter(
        (a) =>
          (a.name || "").toLowerCase().includes(q) ||
          (a.email || "").toLowerCase().includes(q) ||
          (a.phone || "").includes(q)
      );
    }

    list.sort((a, b) => {
      // Prioritize Next Up / In Progress if in "Live Queue" mode
      if (statusFilter === "accepted") {
        const isANext = (a.status || "").toLowerCase() === "next_up";
        const isBNext = (b.status || "").toLowerCase() === "next_up";
        const isAProgress = (a.status || "").toLowerCase() === "in_progress";
        const isBProgress = (b.status || "").toLowerCase() === "in_progress";
        
        // In Progress floats to top, then Next Up
        if (isAProgress && !isBProgress) return -1;
        if (!isAProgress && isBProgress) return 1;
        if (isANext && !isBNext) return -1;
        if (!isANext && isBNext) return 1;
      }
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sortOrder === "asc" ? da - db : db - da;
    });

    return list;
  }, [appointmentsList, modeFilter, searchTerm, sortOrder, statusFilter, selectedDate]);

  // ... (Nav & Update handlers remain same) ...
  const navigateToRoom = (app) => {
    const details = {
      name: app.name,
      age: app.age,
      gender: app.gender,
      email: app.email,
      phone: app.phone,
      symptoms: app.symptoms,
      mode: app.mode,
      status: app.status,
    };
    localStorage.setItem("current", JSON.stringify(details));
    navigate(
      `/waiting-room/${app.doctor.roomid}?consultationId=${app._id}&user=doctor`
    );
  };

  const handleUpdateStatus = async (appointmentID, newStatus, fromStatus, skipConfirmation = false) => {
    let endpoint = `${API}/appointment/changestatus`;
    let confirmNeeded = false;
    let msg = "";

    if (newStatus === "skipped") {
      endpoint += "?info=no_show";
      confirmNeeded = true;
      msg = "Skip this patient?";
    }
    if (newStatus === "cancelled" && ["accepted", "next_up", "in_progress"].includes(fromStatus)) {
      endpoint += "?info=cancel";
      confirmNeeded = true;
      msg = "Cancel appointment and refund?";
    }
    if (newStatus === "completed") {
      endpoint += "?info=proceed";
      confirmNeeded = true;
      msg = "Complete & proceed payment?";
    }

    if (confirmNeeded && !skipConfirmation) {
      const res = await Swal.fire({
        title: "Are you sure?",
        text: msg,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
      });
      if (!res.isConfirmed) return false;
    }

    const t = toast.loading("Updating...");
    try {
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ appointmentID, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setAppointmentsList((prev) =>
        prev.map((a) => (a._id === appointmentID ? { ...a, status: newStatus } : a))
      );
      toast.success("Updated", { id: t });
      return true;
    } catch (err) {
      toast.error(err.message, { id: t });
      return false;
    }
  };

  const handleStartCall = async (app) => {
    socket.emit("doctor_clicked_join", {
      patientid: app.patient,
      appt_id: app._id,
    });
    navigateToRoom(app);
  };

  const clearDate = () => {
    setSelectedDate(null);
    setShowDateFilter(false);
  };

  return (
    <>
      <section className="appointments-page">
        <div className="appointments-container">
          <aside className="sidebar desktop-sidebar">
            <div className="sidebar-header">
              <h2 className="sidebar-title">
                <FiFilter /> Filters
              </h2>
            </div>
            
            {/* Desktop Search */}
            <div className="filter-section">
              <div className="search-box">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search patient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            {/* Desktop Date */}
            <div className="filter-section">
              <label className="filter-label">Date</label>
              <button
                className={`date-filter-btn ${selectedDate ? "active" : ""}`}
                onClick={() => setShowDateFilter(!showDateFilter)}
              >
                <FiCalendar />
                {selectedDate ? formatDatePretty(selectedDate) : "All Dates"}
              </button>
              {showDateFilter && (
                <div className="calendar-dropdown">
                  <CustomCalendar
                    onChange={(d) => {
                      setSelectedDate(d);
                      setShowDateFilter(false);
                    }}
                    value={selectedDate || new Date()}
                  />
                  <div className="calendar-footer">
                    <button className="clear-date-btn" onClick={clearDate}>
                      Show All Dates
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Status Filters */}
            <div className="filter-section">
              <label className="filter-label">Status</label>
              <div className="filter-chips vertical">
                {STATUS_TABS.map((filter) => (
                  <button
                    key={filter.value}
                    className={`filter-chip ${
                      statusFilter === filter.value ? "active" : ""
                    }`}
                    onClick={() => setStatusFilter(filter.value)}
                  >
                    {filter.icon}
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode & Sort */}
            <div className="filter-section">
               <label className="filter-label">Mode</label>
               <div className="filter-chips">
                 {/* Simplified for desktop sidebar */}
                 <button onClick={() => setModeFilter('all')} className={`filter-chip ${modeFilter === 'all' ? 'active' : ''}`}>All</button>
                 <button onClick={() => setModeFilter('online')} className={`filter-chip ${modeFilter === 'online' ? 'active' : ''}`}>Online</button>
                 <button onClick={() => setModeFilter('offline')} className={`filter-chip ${modeFilter === 'offline' ? 'active' : ''}`}>Offline</button>
               </div>
            </div>
          </aside>

          {/* -------------------- MAIN CONTENT -------------------- */}
          <main className="main-content">
            
            {/* --- MOBILE HEADER: Search & Horizontal Tabs --- */}
          {/* --- MOBILE HEADER: Search, Today Pill & Horizontal Tabs --- */}
<div className="mobile-header">

  {/* Today Badge */}
  <div className="today-pill">
  {selectedDate 
    ? `${formatDatePretty(selectedDate)}`
    : `Today:${formatDatePretty(new Date())}`}
</div>


  <div className="mobile-search-row">
    <div className="search-box mobile-search">
      <FiSearch className="search-icon" />
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
    </div>

    <button
      className={`mobile-date-btn ${selectedDate ? "active" : ""}`}
      onClick={() => setShowDateFilter(!showDateFilter)}
    >
      <FiCalendar size={20} />
    </button>
  </div>

  {/* Mobile Bottom Sheet Calendar */}
 {showDateFilter && (
  <div className="mobile-calendar-wrapper">
    <div className="calendar-overlay" onClick={() => setShowDateFilter(false)}></div>

    <div className="mobile-calendar-bottom">
      <h3 className="calendar-title">Select a Date</h3>

      <CustomCalendar
        onChange={(d) => {
          setSelectedDate(d);
          setShowDateFilter(false);
        }}
        value={selectedDate || new Date()}
      />

      <button className="clear-date-btn" onClick={clearDate}>
        Clear Date
      </button>
    </div>
  </div>
)}


  {/* HORIZONTAL SCROLL TABS */}
  <div className="mobile-status-tabs">
    {STATUS_TABS.map((filter) => (
      <button
        key={filter.value}
        className={`status-tab-item ${
          statusFilter === filter.value ? "active" : ""
        }`}
        onClick={() => setStatusFilter(filter.value)}
      >
        {filter.label}
      </button>
    ))}
  </div>
</div>

            {/* --- END MOBILE HEADER --- */}

            <div className="content-header desktop-only-header">
              <div className="header-left">
                <h1 className="page-title">Appointments</h1>
                <p className="page-subtitle">
                  {filteredAppointments.length} Found
                </p>
              </div>
              {selectedDate && (
                <div className="active-filter-tag">
                   <span>{formatDatePretty(selectedDate)}</span>
                   <FiX onClick={clearDate} style={{cursor:"pointer"}}/>
                </div>
              )}
            </div>

            <div className="appointments-content">
              {isLoading && (
                <div className="loading-state">
                  <Bubbles />
                </div>
              )}

              {!isLoading && error && (
                <div className="error-state">
                  <FiAlertCircle size={48} />
                  <h3>Error</h3>
                  <p>{error}</p>
                </div>
              )}

              {!isLoading && !error && filteredAppointments.length === 0 && (
                <div className="empty-state">
                  <FiCalendar size={64} />
                  <h3>No appointments</h3>
                </div>
              )}

              {!isLoading && !error && filteredAppointments.length > 0 && (
                <div className={`appointments-grid ${statusFilter === "pending" ? "pending-grid" : "default-grid"}`}>
                  {filteredAppointments.map((app) =>
                    statusFilter === "pending" ? (
                      <PendingAppointmentCard
                        key={app._id}
                        app={app}
                        onUpdateStatus={handleUpdateStatus}
                      />
                    ) : (
                      <ArchivedAppointmentCard
                        key={app._id}
                        app={app}
                        onUpdateStatus={handleUpdateStatus}
                        onStartCall={handleStartCall}
                      />
                    )
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </section>
    </>
  );
}