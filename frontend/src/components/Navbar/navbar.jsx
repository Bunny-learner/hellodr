import { useState, useEffect } from "react";
import Sidebar from "../../pages/Sidebar.jsx";
import { useLocation, Link } from "react-router-dom";
import { FaUser, FaBars, FaTimes } from "react-icons/fa";
import { FiBell } from "react-icons/fi";
import bg from "../../assets/icon.png";
import "./navbar.css";
import { useSocket } from "../../pages/SocketContext.jsx";
import { useAuth } from "../../pages/AuthContext.jsx";

export default function Navbar({ src, usertype = "patient" }) {
  const location = useLocation();
  const { role } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket, socketId } = useSocket();
  const basePath = `/${usertype}`;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("http://localhost:8000/getnotify", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (data.success) {
          setNotifications(data.notifications);
          setUnreadCount(data.count || 0);
        }
      } catch (err) {}
    };
    fetchNotifications();
  }, [sidebarOpen]);

  useEffect(() => {
    if (!socket) return;
    const notifyDot = () => setUnreadCount((p) => p + 1);
    if (role === "patient") socket.on("patientnotification", notifyDot);
    else socket.on("doctornotification", notifyDot);
    return () => {
      socket.off("patientnotification", notifyDot);
      socket.off("doctornotification", notifyDot);
    };
  }, [socket, socketId, role]);

  let activePage = "";
  if (location.pathname.includes(`${basePath}/home`)) activePage = "home";
  else if (location.pathname.includes(`${basePath}/appointments`)) activePage = "appointments";
  else if (location.pathname.includes(`${basePath}/getdoctors`)) activePage = "finddoctor";
  else if (location.pathname.includes(`${basePath}/timeslots`)) activePage = "timeslots";
  else if (location.pathname.includes(`${basePath}/payments`)) activePage = "Payments";

  const renderLinks = () => {
    if (usertype === "doctor") {
      return (
        <>
          <Link to={`${basePath}/home`} className={activePage === "home" ? "active" : ""}>Home</Link>
          <Link to={`${basePath}/timeslots`} className={activePage === "timeslots" ? "active" : ""}>Time Slots</Link>
          <Link to={`${basePath}/appointments`} className={activePage === "appointments" ? "active" : ""}>Appointments</Link>
        </>
      );
    }
    return (
      <>
        <Link to={`${basePath}/home`} className={activePage === "home" ? "active" : ""}>Home</Link>
        <Link to={`${basePath}/appointments`} className={activePage === "appointments" ? "active" : ""}>Appointments</Link>
        <Link to={`${basePath}/getdoctors`} className={activePage === "finddoctor" ? "active" : ""}>Find a Doctor</Link>
        <Link to={`${basePath}/payments`} className={activePage === "Payments" ? "active" : ""}>Payments</Link>
      </>
    );
  };

  return (
    <>
      <nav className="main-navbar">
        <div className="navbar-left">
          <div className="hamburger" onClick={() => setMenuOpen(true)}>
            <FaBars />
          </div>
          <Link to="/" className="navbar-logo">
            <img className="navbar-logo-img" src={bg} alt="" />
            <span>Hello Dr.</span>
          </Link>
        </div>

        <div className="navbar-links desktop-only">
          {renderLinks()}
        </div>

        <div className="navbar-right">
          <button className="icon-button" onClick={() => setSidebarOpen(true)}>
            <FiBell />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          <Link to={`${basePath}/profile`} className="profile-link">
            {!src ? <FaUser className="profile-default" /> : <img src={src} className="profile-pic" alt="" />}
          </Link>
        </div>
      </nav>

      <div className={`mobile-menu ${menuOpen ? "show" : ""}`}>
        <div className="mobile-menu-header">
          <FaTimes className="close-icon" onClick={() => setMenuOpen(false)} />
        </div>
        <div className="mobile-menu-links">
          {renderLinks()}
        </div>
      </div>

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        basePath={basePath}
        notifications={notifications}
      />
    </>
  );
}
