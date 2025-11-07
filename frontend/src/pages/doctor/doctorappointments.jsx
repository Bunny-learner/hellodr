// src/components/DoctorAppointments.jsx
import React, { useState, useEffect, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

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
  FiMic,
  FiMessageSquare,
  FiFilter
} from 'react-icons/fi';

import '../../css/DoctorAppointments.css';
import Bubbles from '../../components/Loaders/bubbles';
import { useSocket } from '../../pages/SocketContext.jsx';

// ---------- Helpers ----------
const toDateOnlyKey = (d) => {
  const dd = new Date(d);
  dd.setHours(0, 0, 0, 0);
  return dd.toISOString().split('T')[0];
};
const formatDatePretty = (d) =>
  new Date(d).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
// --------------------------------

// ========== PENDING CARD ==========
const PendingAppointmentCard = ({ app, onUpdateStatus }) => {
  return (
    <div className="pending-card">
      <div className="pending-card-header">
        <div className="patient-avatar"><FiUser size={30} /></div>
        <div className="patient-info">
          <h3>{app.name}</h3>
          <span>{app.age} yrs, {app.gender}</span>
        </div>
        <span className={`mode-badge mode-${(app.mode || '').toLowerCase()}`}>
          {(app.mode || '').toLowerCase() === 'online' ? <FiWifi size={14} /> : <FiHome size={14} />}
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
          <p><FiCalendar size={14} /> <span>{formatDatePretty(app.date)}</span></p>
          <p>
            <FiClock size={14} />
            <strong>
              {app.TimeSlot
                ? `${app.TimeSlot.StartTime} - ${app.TimeSlot.EndTime}`
                : new Date(app.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
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
                    onClick={() => onUpdateStatus(app._id, 'cancelled', 'pending')}
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

// ========== ARCHIVE/GENERAL CARD ==========
const ArchivedAppointmentCard = ({ app, onUpdateStatus, onJoin }) => {
  const status = (app.status || '').toLowerCase();
  const isOnline = (app.mode || '').toLowerCase() === 'online';

  return (
    <div className={`appointment-card status-${status}`}>
      <div className="card-header">
        <div className="patient-avatar"><FiUser size={24} /></div>
        <div className="patient-info">
          <h3>{app.name}</h3>
          <span>{app.age} yrs, {app.gender}</span>
          <span className={`mode-badge-small mode-${(app.mode || '').toLowerCase()}`} style={{ marginLeft: 8 }}>
            {isOnline ? <FiWifi size={12} /> : <FiHome size={12} />} {app.mode}
          </span>
        </div>
        <span className={`status-badge status-${status}`}>{app.status}</span>
      </div>

      <div className="card-body">
        <p><strong>Symptoms:</strong> {app.symptoms}</p>
      </div>

      <div className="card-footer">
        <div className="time-slot">
          <FiCalendar /> <span>{formatDatePretty(app.date)}</span>
          <strong style={{ marginLeft: '10px' }}>
            <FiClock style={{ marginRight: '4px', verticalAlign: 'middle' }} size={14} />
            {app.TimeSlot
              ? `${app.TimeSlot.StartTime} - ${app.TimeSlot.EndTime}`
              : new Date(app.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </strong>
        </div>

        {/* Actions: If accepted → allow Complete/Cancel; If online & accepted → quick join buttons */}
        <div className="action-buttons">
          {status === 'accepted' && isOnline && (
            <>
              <button className="btn-action btn-cancel" title="Chat" onClick={() => onJoin(app, 'chat')}>
                <FiMessageSquare />
              </button>
              <button className="btn-action btn-cancel" title="Audio" onClick={() => onJoin(app, 'audio')}>
                <FiMic />
              </button>
            </>
          )}

          {status === 'accepted' && (
            <>
              <button className="btn-action btn-complete" onClick={() => onUpdateStatus(app._id, 'completed', 'accepted')}>Complete</button>
              <button className="btn-action btn-cancel" onClick={() => onUpdateStatus(app._id, 'cancelled', 'accepted')}>Cancel</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ========== MAIN ==========
export default function DoctorAppointments() {
  const navigate = useNavigate();
  const { socket } = useSocket() || {}; // sockets preserved

  const [allAppointments, setAllAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sidebar filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('accepted'); // default view
  const [modeFilter, setModeFilter] = useState('all');          // all | online | offline
  const [sortOrder, setSortOrder] = useState('asc');            // asc | desc

  // Date filter (hidden calendar)
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null); // null => no date filter

  // ========== Fetch ==========
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
          navigate("/doctor/login?Session has expired please login again");
          return;
        }
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        setAllAppointments(result.data || []);
      } catch (err) {
        setError(err.message);
        toast.error('Failed to fetch appointments.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAppointments();
  }, [navigate]);

  // ========== Sockets ==========
  useEffect(() => {
    if (!socket) return;

    const onCreated = (appt) => setAllAppointments((prev) => [appt, ...prev]);
    const onStatusChanged = ({ appointmentID, status }) =>
      setAllAppointments((prev) => prev.map((a) => (a._id === appointmentID ? { ...a, status } : a)));
    const onUpdated = (appt) =>
      setAllAppointments((prev) => prev.map((a) => (a._id === appt._id ? { ...a, ...appt } : a)));

    // Adjust event names if needed
    socket.on?.('appointment:created', onCreated);
    socket.on?.('appointment:statusChanged', onStatusChanged);
    socket.on?.('appointment:updated', onUpdated);

    return () => {
      socket.off?.('appointment:created', onCreated);
      socket.off?.('appointment:statusChanged', onStatusChanged);
      socket.off?.('appointment:updated', onUpdated);
    };
  }, [socket]);

  // ========== Filtering ==========
  const filteredAppointments = useMemo(() => {
    let list = [...allAppointments];

    // 0) Optional Date filter (only if a date is selected)
    if (selectedDate) {
      const dayKey = toDateOnlyKey(selectedDate);
      list = list.filter((app) => toDateOnlyKey(app.date) === dayKey);
    }

    // 1) Status filter
    list = list.filter((app) => {
      const status = (app.status || '').toLowerCase();
      switch (statusFilter.toLowerCase()) {
        case 'pending':
          return status === 'pending';
        case 'accepted':
          return status === 'accepted';
        case 'completed':
          return status === 'completed';
        case 'rejected':
          return status === 'rejected' || status === 'cancelled';
        case 'all':
        default:
          return true;
      }
    });

    // 2) Mode filter
    list = list.filter((app) =>
      modeFilter === 'all' ? true : (app.mode || '').toLowerCase() === modeFilter
    );

    // 3) Search
    const q = (searchTerm || '').toLowerCase();
    if (q) {
      list = list.filter(
        (a) =>
          (a.name || '').toLowerCase().includes(q) ||
          (a.email || '').toLowerCase().includes(q) ||
          (a.phone || '').includes(q)
      );
    }

    // 4) Sort by time
    list.sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sortOrder === 'asc' ? da - db : db - da;
    });

    return list;
  }, [allAppointments, selectedDate, statusFilter, modeFilter, searchTerm, sortOrder]);

  // ========== APIs for Status Updates ==========
  const handleUpdateStatus = async (appointmentID, newStatus, fromStatus) => {
    let endpoint = 'http://localhost:8000/appointment/changestatus';
    let confirmNeeded = false;
    let title = 'Are you sure?';
    let text = 'This action will notify the patient.';
    let confirmText = 'Yes, continue';

    // Completed accepted → proceed payment
    if (newStatus === 'completed' && fromStatus === 'accepted') {
      endpoint = 'http://localhost:8000/appointment/changestatus?info=proceed';
      confirmNeeded = true;
      text = 'Completing will trigger payment transfer to your account.';
      confirmText = 'Yes, complete';
    }

    // Cancel accepted → refund
    if (newStatus === 'cancelled' && fromStatus === 'accepted') {
      endpoint = 'http://localhost:8000/appointment/changestatus?info=cancel';
      confirmNeeded = true;
      text = 'Cancelling will refund the patient and notify them.';
      confirmText = 'Yes, cancel';
    }

    if (confirmNeeded) {
      const res = await Swal.fire({
        title,
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: confirmText,
        cancelButtonText: 'Close',
      });
      if (!res.isConfirmed) return;
    }

    const t = toast.loading('Updating status...');
    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ appointmentID, status: newStatus }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to update');

      setAllAppointments((prev) =>
        prev.map((a) => (a._id === appointmentID ? { ...a, status: newStatus } : a))
      );

      toast.success('Status updated', { id: t });
    } catch (err) {
      toast.error(err.message || 'Could not update.', { id: t });
    }
  };

  // Join handlers kept
  const handleJoin = (app, joinType) => {
    // context save
    const patientDetails = {
      name: app.name, age: app.age, gender: app.gender,
      email: app.email, phone: app.phone, symptoms: app.symptoms,
      mode: app.mode, status: app.status
    };
    localStorage.setItem('current', JSON.stringify(patientDetails));

    if (joinType === 'chat') navigate(`/chat/${app.doctor.roomid}?consultationId=${app._id}`);
    else if (joinType === 'audio') navigate(`/audio/${app.doctor.roomid}`);
    else if (joinType === 'video') navigate(`/video/${app.doctor.roomid}`);
  };

  // View details placeholder
  const handleViewDetails = (appointmentID) => {
    toast(`Viewing details for ${appointmentID}`);
    // navigate(`/doctor/appointment/${appointmentID}`);
  };

  // Clear date filter
  const clearDate = () => {
    setSelectedDate(null);
    setShowDateFilter(false);
  };

  // ========== Render ==========
  return (
    <>
      <Toaster position="top-right" />
      <section className="appointments-layout">
        {/* ========== LEFT SIDEBAR (280px) ========== */}
        <aside className="appointments-sidebar">
          <h2 className="sidebar-title">Filters</h2>

          {/* Search */}
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search name, email, phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Date filter button */}
          <div className="date-filter-block">
            <button
              className={`date-filter-btn ${selectedDate ? 'active' : ''}`}
              onClick={() => setShowDateFilter((s) => !s)}
              title={selectedDate ? `Selected: ${formatDatePretty(selectedDate)}` : 'Filter by Date'}
            >
              <FiFilter />
              {selectedDate ? formatDatePretty(selectedDate) : 'Filter by Date'}
            </button>

            {/* Calendar appears only when clicked */}
            {showDateFilter && (
              <div className="calendar-popover">
                <Calendar
                  onChange={(d) => { setSelectedDate(d); setShowDateFilter(false); }}
                  value={selectedDate || new Date()}
                  className="calendar-ui"
                />
                <div className="calendar-actions">
                  <button className="btn-clear-date" onClick={clearDate}>Clear date</button>
                </div>
              </div>
            )}
          </div>

          {/* Mode Filters */}
          <div className="mode-filters">
            <span className="filter-label">Mode</span>
            {['all', 'offline', 'online'].map((f) => (
              <button
                key={f}
                className={`filter-chip mode-chip ${modeFilter === f ? 'active' : ''}`}
                onClick={() => setModeFilter(f)}
              >
                {f === 'all' && 'All'}
                {f === 'offline' && (<><FiHome size={14} /> Offline</>)}
                {f === 'online' && (<><FiWifi size={14} /> Online</>)}
              </button>
            ))}
          </div>

          {/* Status Filters (no 'today') */}
          <div className="status-filters">
            <span className="filter-label">Status</span>
            {['pending', 'accepted', 'completed', 'rejected', 'all'].map((f) => (
              <button
                key={f}
                className={`filter-chip ${statusFilter.toLowerCase() === f ? 'active' : ''}`}
                onClick={() => setStatusFilter(f)}
              >
                {f === 'pending' && <FiClock />}
                {f === 'accepted' && <FiCalendar />}
                {f === 'completed' && <FiCheckSquare />}
                {f === 'rejected' && <FiXCircle />}
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="sort-control">
            <button
              className="sort-button"
              onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
            >
              {sortOrder === 'asc' ? <FiArrowUp /> : <FiArrowDown />} Sort by Time
            </button>
          </div>
        </aside>

        {/* ========== RIGHT CONTENT ========== */}
        <main className="appointments-content">
          <div className="content-header">
            <h2 className="section-title">Appointments</h2>
            {selectedDate && (
              <div className="active-date-chip">
                <FiCalendar />
                <span>{formatDatePretty(selectedDate)}</span>
                <button onClick={clearDate} className="clear-chip">×</button>
              </div>
            )}
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
              <div
                className={`appointments-grid ${
                  statusFilter === 'pending' ? 'pending-view' : 'archive-view'
                }`}
              >
                {filteredAppointments.map((app) => {
                  if (statusFilter === 'pending') {
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
                      onJoin={handleJoin}
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
