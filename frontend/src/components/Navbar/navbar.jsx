import { useState, useEffect } from "react";
import Sidebar from "../../pages/Sidebar.jsx";
import { useLocation, Link } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { FiBell } from "react-icons/fi";
import bg from "../../assets/icon.png";
import "./navbar.css";
import { useSocket } from "../../pages/SocketContext.jsx";

export default function Navbar({ src, usertype = "patient" }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const basePath = `/${usertype}`;
  const {socket,socketId}=useSocket()

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
        } else {
          console.error("Failed to load notifications:", data.message);
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchNotifications();
  }, [sidebarOpen]); 


  useEffect(()=>{

  if(!socket)return;

  const notifydot=(data)=>{
    console.log(data.msg)
    setUnreadCount((prev)=>prev+1);
  }
  socket.on("notification",notifydot)

 return () => {
    socket.off("notification", notifydot);
  };

  },[socket,socketId])




  let activePage = "";
  if (location.pathname.includes(`${basePath}/home`)) activePage = "home";
  else if (location.pathname.includes(`${basePath}/appointments`)) activePage = "appointments";
  else if (location.pathname.includes(`${basePath}/getdoctors`)) activePage = "finddoctor";
  else if (location.pathname.includes(`${basePath}/timeslots`)) activePage = "timeslots";
  else if (location.pathname.includes(`${basePath}/payments`)) activePage = "Payments";

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const renderLinks = () => {
    if (usertype === "doctor") {
      return (
        <ul className="navbar-links">
          <li><Link to={`${basePath}/home`} className={activePage === "home" ? "active" : ""}>Home</Link></li>
          <li><Link to={`${basePath}/timeslots`} className={activePage === "timeslots" ? "active" : ""}>Time Slots</Link></li>
          <li><Link to={`${basePath}/appointments`} className={activePage === "appointments" ? "active" : ""}>Appointments</Link></li>
        </ul>
      );
    } else {
      return (
        <ul className="navbar-links">
          <li><Link to={`${basePath}/home`} className={activePage === "home" ? "active" : ""}>Home</Link></li>
          <li><Link to={`${basePath}/appointments`} className={activePage === "appointments" ? "active" : ""}>Appointments</Link></li>
          <li><Link to={`${basePath}/getdoctors`} className={activePage === "finddoctor" ? "active" : ""}>Find a Doctor</Link></li>
          <li><Link to={`${basePath}/payments`} className={activePage === "Payments" ? "active" : ""}>Payments</Link></li>
        </ul>
      );
    }
  };

  return (
    <>
      <nav className="main-navbar">
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            <img style={{ width: "50px", height: "50px" }} src={bg} alt="" />
            Hello <span>Dr.</span>
          </Link>
          {renderLinks()}
        </div>

        <div className="navbar-right">
          {/* Notification Bell */}
          <div className="notification-wrapper">
            <button className="icon-button" onClick={toggleSidebar}>
              <FiBell />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>
          </div>

          {/* Profile Icon */}
          <Link to={`${basePath}/profile`} className="profile-link">
            {!src ? <FaUser /> : <img src={src} alt="Profile" className="profile-pic" />}
          </Link>
        </div>
      </nav>

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        basePath={basePath}
        notifications={notifications}
      />
    </>
  );
}
