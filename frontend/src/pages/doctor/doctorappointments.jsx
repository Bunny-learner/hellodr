import React, { useState, useEffect, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import {
  FiSearch,
  FiUser,
  FiCalendar,
  FiCheckSquare,
  FiXCircle,
  FiClock,
  FiArrowUp,
  FiArrowDown,
  FiWifi,
  FiHome,
  FiMail,
  FiPhone,
  FiAlertCircle,
  FiMessageSquare,
  FiFilter,
  FiSkipForward,
} from "react-icons/fi";

import "../../css/doctorappointments.css";
import Bubbles from "../../components/Loaders/bubbles";
import { useSocket } from "../../pages/SocketContext.jsx";

// ---------- Helpers ----------
const toDateOnlyKey = (d) => {
  // Handle null date (for "Show All")
  if (!d) return null;
  const dd = new Date(d);
  dd.setHours(0, 0, 0, 0);
  return dd.toISOString().split("T")[0];
};

const formatDatePretty = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

// --------------------------------------------------------------------
// ---------------------- PENDING APPOINTMENT CARD ---------------------
// --------------------------------------------------------------------
const PendingAppointmentCard = ({ app, onUpdateStatus }) => (
  <div className="pending-card">
    <div className="pending-card-header">
      <div className="patient-avatar">
        <FiUser size={30} />
      </div>
      <div className="patient-info">
        <h3>{app.name}</h3>
        <span>
          {app.age} yrs, {app.gender}
        </span>
      </div>
      <span className={`mode-badge mode-${(app.mode || "").toLowerCase()}`}>
        {(app.mode || "").toLowerCase() === "online" ? (
          <FiWifi size={14} />
        ) : (
          <FiHome size={14} />
        )}
        {app.mode}
      </span>
    </div>

    <div className="pending-card-body">
      <div className="patient-details">
        <h4>Patient Details</h4>
        <p>
          <FiMail size={14} /> <span>{app.email}</span>
        </p>
        <p>
          <FiPhone size={14} /> <span>{app.phone}</span>
        </p>
      </div>

      <div className="appointment-details">
        <h4>Appointment Details</h4>
        <p>
          <FiCalendar size={14} /> <span>{formatDatePretty(app.date)}</span>
        </p>
        <p>
          <FiClock size={14} />
          <strong>
            {app.TimeSlot
              ? `${app.TimeSlot.StartTime} - ${app.TimeSlot.EndTime}`
              : new Date(app.date).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
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
        onClick={() => onUpdateStatus(app._id, "cancelled", "pending")}
      >
        <FiXCircle /> Reject
      </button>

      <button
        className="btn-action btn-accept"
        onClick={() => onUpdateStatus(app._id, "accepted", "pending")}
      >
        <FiCheckSquare /> Accept
      </button>
    </div>
  </div>
);

// --------------------------------------------------------------------
// ---------------------- ARCHIVED (LIVE QUEUE) CARD -------------------
// --------------------------------------------------------------------
const ArchivedAppointmentCard = ({ app, onUpdateStatus, onStartCall }) => {
  const status = (app.status || "").toLowerCase();
  const isOnline = (app.mode || "").toLowerCase() === "online";

  const isJoinEnabled = isOnline && status === "next_up";

  const getStatusLabel = (s) => {
    switch (s) {
      case "next_up":
        return "Next Up";
      case "in_progress":
        return "In Progress";
      case "accepted":
        return "Waiting";
      case "skipped":
        return "Skipped";
      case "no_show":
        return "No-Show";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      case "rejected":
        return "Rejected";
      default:
        // Capitalize any other status
        return s.charAt(0).toUpperCase() + s.slice(1);
    }
  };

  return (
    <div className={`appointment-card status-${status}`}>
      <div className="card-header">
        <div className="patient-avatar">
          <FiUser size={24} />
        </div>

        <div className="patient-info">
          <h3>{app.name}</h3>
          <span>
            {app.age} yrs, {app.gender}
          </span>
          <span
            className={`mode-badge-small mode-${(app.mode || "").toLowerCase()}`}
            style={{ marginLeft: 8 }}
          >
            {isOnline ? <FiWifi size={12} /> : <FiHome size={12} />} {app.mode}
          </span>
        </div>

        <span className={`status-badge status-${status}`}>
          {getStatusLabel(status)}
        </span>
      </div>

      <div className="card-body">
        <p>
          <strong>Symptoms:</strong> {app.symptoms}
        </p>
      </div>

      <div className="card-footer">
        <div className="time-slot">
          <FiCalendar /> <span>{formatDatePretty(app.date)}</span>
          <strong style={{ marginLeft: "10px" }}>
            <FiClock
              size={14}
              style={{ marginRight: "4px", verticalAlign: "middle" }}
            />
            {app.TimeSlot
              ? `${app.TimeSlot.StartTime} - ${app.TimeSlot.EndTime}`
              : new Date(app.date).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
          </strong>
        </div>

        <div className="action-buttons">
          {(status === "accepted" || status === "next_up") && isOnline && (
            <button
              className="btn-action btn-join"
              title={isJoinEnabled ? "Start Chat" : "Waiting for queue..."}
              disabled={!isJoinEnabled}
              onClick={() => onStartCall(app)}
              style={{
                opacity: isJoinEnabled ? 1 : 0.4,
                cursor: isJoinEnabled ? "pointer" : "not-allowed",
              }}
            >
              <FiMessageSquare />
              {isJoinEnabled ? "Start Chat" : "Waiting..."}
            </button>
          )}

          {status === "in_progress" && (
            <button
              className="btn-action btn-complete"
              onClick={() =>
                onUpdateStatus(app._id, "completed", "in_progress")
              }
            >
              Complete
            </button>
          )}

          {status === "next_up" && (
            <button
              className="btn-action btn-skip"
              onClick={() => onUpdateStatus(app._id, "skipped", "next_up")}
              title="Skip this patient"
            >
              <FiSkipForward /> Skip
            </button>
          )}

          {(status === "accepted" ||
            status === "next_up" ||
            status === "in_progress") && (
            <button
              className="btn-action btn-cancel"
              onClick={() => onUpdateStatus(app._id, "cancelled", "accepted")}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
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
  const [statusFilter, setStatusFilter] = useState("accepted"); // LIVE QUEUE
  const [modeFilter, setModeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("asc");

  const [showDateFilter, setShowDateFilter] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // --------------------------------------------------------------------
  // ----------------------- FETCH APPOINTMENTS -------------------------
  // --------------------------------------------------------------------
  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      setError(null);
      setAppointmentsList([]);

      const url = new URL("http://localhost:8000/doctor/appointments");
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

  // --------------------------------------------------------------------
  // -------------------------- SOCKET HANDLERS --------------------------
  // --------------------------------------------------------------------
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

  // --------------------------------------------------------------------
  // -------------------------- CLIENT FILTERS ----------------------------
  // --------------------------------------------------------------------
  const filteredAppointments = useMemo(() => {
    const liveQueueStatuses = ["accepted", "next_up", "in_progress"];
    const selectedDateKey = toDateOnlyKey(selectedDate);

    let list = [...appointmentsList];

    // --- 1. Filter by DATE ---
    if (selectedDateKey) {
      list = list.filter((app) => toDateOnlyKey(app.date) === selectedDateKey);
    }

    // --- 2. Filter by STATUS ---
    if (statusFilter === "accepted") {
      // "Live Queue"
      list = list.filter((app) =>
        liveQueueStatuses.includes((app.status || "").toLowerCase())
      );
    } else if (statusFilter !== "all") {
      // Any other specific status (e.g., "pending", "completed")
      list = list.filter(
        (app) => (app.status || "").toLowerCase() === statusFilter
      );
    }

    // --- 3. Filter by MODE ---
    list = list.filter((app) =>
      modeFilter === "all"
        ? true
        : (app.mode || "").toLowerCase() === modeFilter
    );

    // --- 4. Filter by SEARCH TERM ---
    const q = searchTerm.toLowerCase();
    if (q) {
      list = list.filter(
        (a) =>
          (a.name || "").toLowerCase().includes(q) ||
          (a.email || "").toLowerCase().includes(q) ||
          (a.phone || "").includes(q)
      );
    }

    // --- 5. SORT ---
    list.sort((a, b) => {
      // Prioritize "next_up" and "in_progress" in Live Queue
      if (statusFilter === "accepted") {
        const isANext = (a.status || "").toLowerCase() === "next_up";
        const isBNext = (b.status || "").toLowerCase() === "next_up";
        if (isANext && !isBNext) return -1; // a comes first
        if (!isANext && isBNext) return 1; // b comes first

        const isAProgress = (a.status || "").toLowerCase() === "in_progress";
        const isBProgress = (b.status || "").toLowerCase() === "in_progress";
        if (isAProgress && !isBProgress) return -1; // a comes first
        if (!isAProgress && isBProgress) return 1; // b comes first
      }

      // Default sort by time
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sortOrder === "asc" ? da - db : db - da;
    });

    return list;
  }, [
    appointmentsList,
    modeFilter,
    searchTerm,
    sortOrder,
    statusFilter,
    selectedDate,
  ]);

  // --------------------------------------------------------------------
  // -------------------------- NAVIGATION LOGIC -------------------------
  // --------------------------------------------------------------------
  const navigateToRoom = (app) => {
    console.log(app)
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

  // --------------------------------------------------------------------
  // -------------------------- UPDATE STATUS -----------------------------
  // --------------------------------------------------------------------
  const handleUpdateStatus = async (
    appointmentID,
    newStatus,
    fromStatus,
    skipConfirmation = false
  ) => {
    let endpoint = "http://localhost:8000/appointment/changestatus";
    let confirmNeeded = false;
    let msg = "";

    if (newStatus === "skipped") {
      endpoint += "?info=no_show";
      confirmNeeded = true;
      msg = "Skip this patient?";
    }

    if (
      newStatus === "cancelled" &&
      ["accepted", "next_up", "in_progress"].includes(fromStatus)
    ) {
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
        prev.map((a) =>
          a._id === appointmentID ? { ...a, status: newStatus } : a
        )
      );

      toast.success("Updated", { id: t });
      return true;
    } catch (err) {
      toast.error(err.message, { id: t });
      return false;
    }
  };

  
  const handleStartCall = async (app) => {

    console.log(app)
    console.log("clicked join")
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
      <Toaster position="top-right" />

      <section className="appointments-layout">
        {/* Sidebar */}
        <aside className="appointments-sidebar">
          <h2 className="sidebar-title">Filters</h2>

          {/* Search */}
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input
              placeholder="Search name, email, phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Date */}
          <div className="date-filter-block">
            <button
              className={`date-filter-btn ${selectedDate ? "active" : ""}`}
              onClick={() => setShowDateFilter(!showDateFilter)}
            >
              <FiFilter />
              {selectedDate ? formatDatePretty(selectedDate) : "Filter by Date"}
            </button>

            {showDateFilter && (
              <div className="calendar-popover">
                <Calendar
                  onChange={(d) => {
                    setSelectedDate(d);
                    setShowDateFilter(false);
                  }}
                  value={selectedDate || new Date()}
                />

                <div className="calendar-actions">
                  <button className="btn-clear-date" onClick={clearDate}>
                    Show All Dates
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mode Filter */}
          <div className="mode-filters">
            <span className="filter-label">Mode</span>

            {["all", "offline", "online"].map((f) => (
              <button
                key={f}
                className={`filter-chip ${modeFilter === f ? "active" : ""}`}
                onClick={() => setModeFilter(f)}
              >
                {f === "offline" && (
                  <>
                    <FiHome size={14} /> Offline
                  </>
                )}
                {f === "online" && (
                  <>
                    <FiWifi size={14} /> Online
                  </>
                )}
                {f === "all" && "All"}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="status-filters">
            <span className="filter-label">Status</span>

            {[
              "pending",
              "accepted",
              "completed",
              "skipped",
              "rejected",
              "all",
            ].map((f) => (
              <button
                key={f}
                className={`filter-chip ${statusFilter === f ? "active" : ""}`}
                onClick={() => setStatusFilter(f)}
              >
                {f === "pending" && <FiClock />}
                {f === "accepted" && <FiCalendar />}
                {f === "completed" && <FiCheckSquare />}
                {f === "rejected" && <FiXCircle />}
                {f === "skipped" && <FiSkipForward />}
                {f === "accepted"
                  ? "Live Queue"
                  : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="sort-control">
            <button
              className="sort-button"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              {sortOrder === "asc" ? <FiArrowUp /> : <FiArrowDown />} Sort by
              Time
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="appointments-content">
          <div className="content-header">
            <h2 className="section-title">Appointments</h2>

            {selectedDate && (
              <div className="active-date-chip">
                <FiCalendar />
                <span>{formatDatePretty(selectedDate)}</span>
                <button onClick={clearDate} className="clear-chip">
                  ×
                </button>
              </div>
            )}
          </div>

          <div className="appointments-list-container">
            {isLoading && <Bubbles />}

            {!isLoading && error && (
              <div className="error-message">{error}</div>
            )}

            {!isLoading && !error && filteredAppointments.length === 0 && (
              <div className="no-appointments">
                <FiCalendar size={50} />
                <h3>No appointments found.</h3>
                <p>Try adjusting your filters.</p>
              </div>
            )}

            {!isLoading && !error && filteredAppointments.length > 0 && (
              <div
                className={`appointments-grid ${
                  statusFilter === "pending" ? "pending-view" : "archive-view"
                }`}
              >
                {filteredAppointments.map((app) => {
                  if (statusFilter === "pending") {
                    return (
                      <PendingAppointmentCard
                        key={app._id}
                        app={app}
                        onUpdateStatus={handleUpdateStatus}
                      />
                    );
                  }

                  return (
                    <ArchivedAppointmentCard
                      key={app._id}
                      app={app}
                      onUpdateStatus={handleUpdateStatus}
                      onStartCall={handleStartCall}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </section>
    </>
  );
}