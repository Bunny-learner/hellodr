// ----------------------- IMPORTS -----------------------
import React, { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import jsQR from "jsqr";
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
  FiPlay,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { QrCode } from "lucide-react";

const API = import.meta.env.VITE_API_URL;
import "../../css/doctorappointments.css";
import Bubbles from "../../components/Loaders/bubbles";
import { useSocket } from "../../pages/SocketContext.jsx";

// QR Scanner Component
const QRScanner = ({ onScanSuccess, onScanError }) => {
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const [hasPermission, setHasPermission] = React.useState(null);

  React.useEffect(() => {
    let stream = null;
    let animationId = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
          scanQRCode();
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setHasPermission(false);
        onScanError?.(err);
      }
    };

    const scanQRCode = () => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      const scan = () => {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code) {
            onScanSuccess(code.data); // THIS WILL TRIGGER YOUR VERIFY FLOW
            return; // stop scanning loop
          }

        }
        animationId = requestAnimationFrame(scan);
      };

      scan();
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [onScanError]);

  const handleManualInput = () => {
    // Fallback: Manual QR code input
    const qrData = prompt("Enter QR code data (or paste scanned text):");
    if (qrData) {
      onScanSuccess?.(qrData);
    }
  };

  if (hasPermission === false) {
    return (
      <div className="qr-permission-denied">
        <FiAlertCircle size={48} />
        <h3>Camera Access Denied</h3>
        <p>Please enable camera permissions to scan QR codes</p>
        <button className="manual-input-btn" onClick={handleManualInput}>
          Enter Code Manually
        </button>
      </div>
    );
  }

  return (
    <div className="qr-video-container">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="qr-video"
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <div className="qr-scan-frame"></div>
      <button className="manual-input-link" onClick={handleManualInput}>
        Enter code manually
      </button>
    </div>
  );
};

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
const STATUS_TABS = [
  { value: "today", label: "Today", icon: <FiCheckSquare /> },
  { value: "accepted", label: "Upcoming", icon: <FiCalendar /> },
  { value: "pending", label: "Pending", icon: <FiClock /> },
  { value: "all", label: "All", icon: <FiFilter /> },
];

const HISTORY_TABS = [
  { value: "completed", label: "Completed", icon: <FiCheckSquare /> },
  { value: "no_show", label: "No Show", icon: <FiClock /> },
  { value: "rejected", label: "Rejected", icon: <FiXCircle /> },
  { value: "skipped", label: "Skipped", icon: <FiSkipForward /> },
];

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

/* -------------------------------------------------------------------- */
/* -------------------------------------------------------------------- */
/* ---------------------- ARCHIVED / ACTIVE CARD ---------------------- */
/* -------------------------------------------------------------------- */
const ArchivedAppointmentCard = ({ app, onUpdateStatus, onStartCall }) => {
  const status = (app.status || "").toLowerCase();
  const isOnline = (app.mode || "").toLowerCase() === "online";
  const isOffline = (app.mode || "").toLowerCase() === "offline";
  const isAccepted = status === "accepted";

  const todayKey = toDateOnlyKey(new Date());
  const isToday = toDateOnlyKey(app.date) === todayKey;

  const isNextUp = status === "next_up";
  const isInProgress = status === "in_progress";

  const isArchived = [
    "completed",
    "cancelled",
    "rejected",
    "no_show",
    "skipped",
  ].includes(status);

  // ---------------- RULES ----------------

  // OFFLINE + ACCEPTED + NOT TODAY → NO BUTTONS
  const hideButtonsForOfflineAccepted = isOffline && isAccepted && !isToday;

  // OFFLINE + ACCEPTED + TODAY → STILL NO BUTTONS
  const hideButtonsForOfflineToday = isOffline && isAccepted && isToday;

  // ONLINE rules stay same
  const canJoin = isOnline && (isNextUp || isInProgress);
  const canSkip = isOnline && isNextUp;
  const canCancel = isOnline && isNextUp;
  const canComplete = isOnline && isInProgress;

  const getStatusLabel = (s) => {
    switch (s) {
      case "accepted":
        return "Waiting";
      case "next_up":
        return "Next Up";
      case "in_progress":
        return "In Progress";
      case "no_show":
        return "No Show";
      case "skipped":
        return "Skipped";
      default:
        return s.charAt(0).toUpperCase() + s.slice(1);
    }
  };

  const getStatusIcon = (s) => {
    switch (s) {
      case "next_up":
        return <FiPlay />;
      case "in_progress":
        return <FiMessageSquare />;
      case "accepted":
        return <FiClock />;
      case "rejected":
      case "cancelled":
        return <FiXCircle />;
      case "completed":
        return <FiCheckSquare />;
      case "skipped":
        return <FiSkipForward />;
      default:
        return <FiClock />;
    }
  };

  const joinButtonLabel = isInProgress ? "Re-join" : "Start Chat";

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
            {isOnline ? <FiWifi className="info-icon" /> : <FiHome className="info-icon" />}
            <div className="info-content">
              <span className="info-label">Mode</span>
              <span className="info-value">{app.mode}</span>
            </div>
          </div>
        </div>

        <div className="symptoms-section archived">
          <span className="symptoms-label">Symptoms</span>
          <p className="symptoms-text">{app.symptoms}</p>
        </div>
      </div>

      {/* ---------------- BUTTON AREA ---------------- */}
      {(!isArchived &&
        !(hideButtonsForOfflineAccepted || hideButtonsForOfflineToday)) && (
          <div className="card-actions">

            {canJoin && (
              <button
                className="action-btn join-btn"
                onClick={() => onStartCall(app)}
              >
                <FiMessageSquare />
                {joinButtonLabel}
              </button>
            )}

            {canComplete && (
              <button
                className="action-btn complete-btn"
                onClick={() =>
                  onUpdateStatus(app._id, "completed", "in_progress")
                }
              >
                <FiCheckSquare />
                Complete
              </button>
            )}

            {canSkip && (
              <button
                className="action-btn skip-btn"
                onClick={() =>
                  onUpdateStatus(app._id, "skipped", status)
                }
              >
                <FiSkipForward />
                Skip
              </button>
            )}

            {canCancel && (
              <button
                className="action-btn cancel-btn"
                onClick={() =>
                  onUpdateStatus(app._id, "cancelled", status)
                }
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
  const [statusFilter, setStatusFilter] = useState("today");
  const [modeFilter, setModeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("asc");

  const [showDateFilter, setShowDateFilter] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // New state for history dropdown
  const [historyExpanded, setHistoryExpanded] = useState(false);

  // --- FETCH APPOINTMENTS ---
  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      setError(null);
      setAppointmentsList([]);

      const url = new URL(`${API}/doctor/appointments`);

      if (statusFilter === "today") {
        url.searchParams.append("status", "livequeue");
      } else if (statusFilter === "accepted") {
        url.searchParams.append("status", "accepted");
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

  // --- SOCKET LISTENERS ---
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

  // --- FILTERING LOGIC ---
  const filteredAppointments = useMemo(() => {
    const todayKey = toDateOnlyKey(new Date());
    const selectedDateKey = toDateOnlyKey(selectedDate);

    let list = [...appointmentsList];

    if (selectedDateKey) {
      list = list.filter((app) => toDateOnlyKey(app.date) === selectedDateKey);
    }

    if (statusFilter === "today") {
      list = list.filter(
        (app) =>
          ["accepted", "next_up", "in_progress"].includes(
            (app.status || "").toLowerCase()
          ) && toDateOnlyKey(app.date) === todayKey
      );
    } else if (statusFilter === "upcoming") {
      list = list.filter(
        (app) =>
          (app.status || "").toLowerCase() === "accepted" &&
          toDateOnlyKey(app.date) !== todayKey &&
          new Date(app.date) > new Date()
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
      if (statusFilter === "today") {
        const priority = { in_progress: 1, next_up: 2, accepted: 3 };
        const pa = priority[a.status?.toLowerCase()] || 99;
        const pb = priority[b.status?.toLowerCase()] || 99;
        if (pa !== pb) return pa - pb;
      }
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

  // --- FUNCTIONS ---
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
      patientid: app.patient,
    };
    localStorage.setItem("current", JSON.stringify(details));
    navigate(
      `/waiting-room/${app.doctor.roomid}?consultationId=${app._id}&user=doctor`
    );
  };

  const handleUpdateStatus = async (appointmentID, newStatus, fromStatus) => {
    const endpoint = `${API}/appointment/changestatus`;
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

  const handleStartCall = (app) => {
    socket?.emit("doctor_clicked_join", {
      patientid: app.patient,
      appt_id: app._id,
    });
    navigateToRoom(app);
  };

  const clearDate = () => {
    setSelectedDate(null);
    setShowDateFilter(false);
  };

  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scanError, setScanError] = useState(null);

  const handleScanQR = () => {
    setShowQRScanner(true);
    setScanError(null);
  };

  const handleQRScanSuccess = async (scannedData) => {
    try {
      // Parse QR data (assuming format: {patientId: "...", appointmentId: "..."})
      const qrData = JSON.parse(scannedData);

      if (!qrData.patientId && !qrData.appointmentId) {
        throw new Error("Invalid QR code format");
      }

      toast.loading("Verifying patient...");


      const response = await fetch(
        `${API}/appointment/verifyqr`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            patientId: qrData.patientId,
            appointmentId: qrData.appointmentId,
            token: qrData.token
          }),
        }
      );
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.message)
        throw new Error("Failed to verify patient QR code");
      }


      toast.dismiss();
      toast.success(result.message);
      setShowQRScanner(false);

    } catch (error) {
      toast.dismiss();
      setScanError(error.message || "Invalid QR code");
      toast.error(error.message || "Invalid QR code");
    }
  };

  const handleQRScanError = (error) => {
    console.error("QR Scan Error:", error);
    setScanError("Failed to scan QR code. Please try again.");
  };

  const closeQRScanner = () => {
    setShowQRScanner(false);
    setScanError(null);
  };

  // --------------------------------------------------------------------
  // ------------------------------ UI ---------------------------------
  // --------------------------------------------------------------------
  return (
    <>
      {/* QR Scanner Modal */}
      {showQRScanner && (
        <div className="qr-scanner-modal">
          <div className="qr-scanner-overlay" onClick={closeQRScanner}></div>
          <div className="qr-scanner-container">
            <div className="qr-scanner-header">
              <h2>Scan Patient QR Code</h2>
              <button className="qr-close-btn" onClick={closeQRScanner}>
                <FiX size={24} />
              </button>
            </div>

            <div className="qr-scanner-body">
              <QRScanner
                onScanSuccess={handleQRScanSuccess}
                onScanError={handleQRScanError}
              />

              {scanError && (
                <div className="qr-error-message">
                  <FiAlertCircle />
                  <span>{scanError}</span>
                </div>
              )}

              <div className="qr-instructions">
                <p>Position the QR code within the frame</p>
                <p className="qr-note">Make sure the QR code is clear and well-lit</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="appointments-page">
        <div className="appointments-container">
          <aside className="sidebar desktop-sidebar">
            <div className="sidebar-header">
              <h2 className="sidebar-title">
                <FiFilter /> Filters
              </h2>
            </div>

            {/* Search */}
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

            {/* Date Filter */}
            <div className="filter-section">
              <label className="filter-label">Date</label>
              <button
                className={`date-filter-btn ${selectedDate ? "active" : ""
                  }`}
                onClick={() => setShowDateFilter(!showDateFilter)}
              >
                <FiCalendar />
                {selectedDate
                  ? formatDatePretty(selectedDate)
                  : "All Dates"}
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

            {/* Status Tabs - Redesigned */}
            <div className="filter-section">
              <label className="filter-label">Appointment Status</label>
              <div className="status-group">
                <div className="status-group-label">Active</div>
                <div className="filter-chips-compact">
                  {STATUS_TABS.map((filter) => (
                    <button
                      key={filter.value}
                      className={`filter-chip-compact ${statusFilter === filter.value ? "active" : ""
                        }`}
                      onClick={() => setStatusFilter(filter.value)}
                    >
                      {filter.icon}
                      <span>{filter.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* History Dropdown */}
              <div className="status-group">
                <button
                  className="status-group-toggle"
                  onClick={() => setHistoryExpanded(!historyExpanded)}
                >
                  <span className="status-group-label">History</span>
                  {historyExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                </button>

                {historyExpanded && (
                  <div className="filter-chips-compact">
                    {HISTORY_TABS.map((filter) => (
                      <button
                        key={filter.value}
                        className={`filter-chip-compact ${statusFilter === filter.value ? "active" : ""
                          }`}
                        onClick={() => setStatusFilter(filter.value)}
                      >
                        {filter.icon}
                        <span>{filter.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mode Filter */}
            <div className="filter-section">
              <label className="filter-label">Consultation Mode</label>
              <div className="mode-toggle-group">
                <button
                  onClick={() => setModeFilter("all")}
                  className={`mode-toggle-btn ${modeFilter === "all" ? "active" : ""
                    }`}
                >
                  All
                </button>
                <button
                  onClick={() => setModeFilter("online")}
                  className={`mode-toggle-btn ${modeFilter === "online" ? "active" : ""
                    }`}
                >
                  <FiWifi size={14} />
                  Online
                </button>
                <button
                  onClick={() => setModeFilter("offline")}
                  className={`mode-toggle-btn ${modeFilter === "offline" ? "active" : ""
                    }`}
                >
                  <FiHome size={14} />
                  Offline
                </button>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="main-content">
            {/* Mobile Header */}
            <div className="mobile-header">
              <div className="today-pill">
                {selectedDate
                  ? formatDatePretty(selectedDate)
                  : `Today: ${formatDatePretty(new Date())}`}
              </div>

              <div className="mobile-search-row">
                <div className="search-cont mobile-search">
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
                  className={`mobile-date-btn ${selectedDate ? "active" : ""
                    }`}
                  onClick={() => setShowDateFilter(!showDateFilter)}
                >
                  <FiCalendar size={20} />
                </button>
              </div>

              <div className="mobile-status-tabs">
                {STATUS_TABS.map((filter) => (
                  <button
                    key={filter.value}
                    className={`status-tab-item ${statusFilter === filter.value ? "active" : ""
                      }`}
                    onClick={() => setStatusFilter(filter.value)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop Header with QR Button */}
            <div className="content-header desktop-only-header">
              <div className="header-left">
                <h1 className="page-title">Appointments</h1>
                <p className="page-subtitle">
                  {filteredAppointments.length} Found
                </p>
              </div>

              <div className="header-right">
                {selectedDate && (
                  <div className="active-filter-tag">
                    <span>{formatDatePretty(selectedDate)}</span>
                    <FiX onClick={clearDate} />
                  </div>
                )}

                <button className="scan-qr-btn" onClick={handleScanQR}>
                  <QrCode size={20} />
                  <span>Scan Patient QR</span>
                </button>
              </div>
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

              {!isLoading &&
                !error &&
                filteredAppointments.length === 0 && (
                  <div className="empty-state">
                    <FiCalendar size={64} />
                    <h3>No appointments</h3>
                  </div>
                )}

              {!isLoading &&
                !error &&
                filteredAppointments.length > 0 && (
                  <div
                    className={`appointments-grid ${statusFilter === "pending"
                        ? "pending-grid"
                        : "default-grid"
                      }`}
                  >
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