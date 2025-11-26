import { useState, useEffect, useRef } from "react";
import Sidebar from "../../pages/Sidebar.jsx";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { FaUser, FaBars, FaTimes } from "react-icons/fa";
import { FiBell } from "react-icons/fi";
import bg from "../../assets/icon.png";
import "./navbar.css";
import { useSocket } from "../../pages/SocketContext.jsx";
import { useAuth } from "../../pages/AuthContext.jsx";

export default function Navbar({ src, usertype = "patient" }) {
  const location = useLocation();
  const { role, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket, socketId } = useSocket();
  const basePath = `/${usertype}`;
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${API}/getnotify`, {
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeMenu = () => {
    setMenuOpen(false);
  };

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
  else if (location.pathname.includes(`${basePath}/appointments`))
    activePage = "appointments";
  else if (location.pathname.includes(`${basePath}/getdoctors`))
    activePage = "finddoctor";
  else if (location.pathname.includes(`${basePath}/timeslots`))
    activePage = "timeslots";
  else if (location.pathname.includes(`${basePath}/payments`))
    activePage = "Payments";

  const renderLinks = (closeMenu) => {
    if (usertype === "doctor") {
      return (
        <>
          <Link
            onClick={closeMenu}
            to={`${basePath}/home`}
            className={activePage === "home" ? "active" : ""}
          >
            Home
          </Link>
          <Link
            onClick={closeMenu}
            to={`${basePath}/timeslots`}
            className={activePage === "timeslots" ? "active" : ""}
          >
            Time Slots
          </Link>
          <Link
            onClick={closeMenu}
            to={`${basePath}/appointments`}
            className={activePage === "appointments" ? "active" : ""}
          >
            Appointments
          </Link>
        </>
      );
    }
    return (
      <>
        <Link
          onClick={closeMenu}
          to={`${basePath}/home`}
          className={activePage === "home" ? "active" : ""}
        >
          Home
        </Link>
        {isAuthenticated && (
          <Link
            onClick={closeMenu}
            to={`${basePath}/appointments`}
            className={activePage === "appointments" ? "active" : ""}
          >
            Appointments
          </Link>
        )}
        <Link
          onClick={closeMenu}
          to={`${basePath}/getdoctors`}
          className={activePage === "finddoctor" ? "active" : ""}
        >
          Find Doctors
        </Link>
        {isAuthenticated && (
          <Link
            onClick={closeMenu}
            to={`${basePath}/payments`}
            className={activePage === "Payments" ? "active" : ""}
          >
            Payments
          </Link>
        )}
      </>
    );
  };

  const handleProfileClick = () => {
    if (role === "patient") {
      setProfileDropdownOpen(!profileDropdownOpen);
    } else {
      navigate(`${basePath}/profile`);
    }
  };

  const handleDropdownItemClick = (path) => {
    setProfileDropdownOpen(false);
    navigate(path);
  };

  return (
    <>
      <nav className="main-navbar">
        <div className="navbar-left">
          <div className="hamburger" onClick={() => setMenuOpen(true)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="black"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </div>
          <Link to="/" className="navbar-logo">
            <svg
              className="navbar-logo-img"
              viewBox="0 0 70 70"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_495_3740)">
                <path
                  d="M64.9511 16.4914H53.5086V5.04886C53.5086 2.26596 51.2426 0 48.4597 0H21.5364C18.7535 0 16.4875 2.26596 16.4875 5.04886V16.4914H5.04886C2.26596 16.4914 0 18.7535 0 21.5403V48.4636C0 51.2465 2.26596 53.5125 5.04886 53.5125H16.4914V64.955C16.4914 67.7379 18.7535 70.0039 21.5403 70.0039H48.4636C51.2465 70.0039 53.5125 67.7379 53.5125 64.955V53.5125H64.955C67.7379 53.5125 70.0039 51.2465 70.0039 48.4636V21.5403C70 18.7535 67.734 16.4914 64.9511 16.4914ZM64.613 48.1255H53.5086V27.2576H48.1255V64.613H21.8745V53.5086H42.7385V48.1255H5.38312V21.8745H16.4875V42.7385H21.8706V5.38312H48.1177V16.4875H27.2615V21.8706H64.6169V48.1255H64.613Z"
                  fill="url(#paint0_linear_495_3740)"
                />
              </g>
              <defs>
                <linearGradient
                  id="paint0_linear_495_3740"
                  x1="-1.69238e-07"
                  y1="3.58994"
                  x2="76.3966"
                  y2="18.4545"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#0EBE7E" />
                  <stop offset="1" stopColor="#07D9AD" />
                </linearGradient>
                <clipPath id="clip0_495_3740">
                  <rect width="70" height="70" fill="white" />
                </clipPath>
              </defs>
            </svg>

            <span>
              Hello<strong className="company">Dr</strong>
            </span>
          </Link>

          <div className="navbar-links desktop-only">{renderLinks()}</div>
        </div>

        {isAuthenticated ? (
          <>
            <div className="navbar-right">
              <button
                className="icon-button"
                onClick={() => setSidebarOpen(true)}
              >
                <FiBell />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>

              <div className="profile-wrapper" ref={dropdownRef}>
                <button
                  onClick={handleProfileClick}
                  className="profile-button"
                >
                  {!src ? (
                    <FaUser className="profile-default" />
                  ) : (
                    <img src={src} className="profile-pic" alt="" />
                  )}
                </button>

                {role === "patient" && profileDropdownOpen && (
                  <div className="profile-dropdown">
                    <button
                      onClick={() =>
                        handleDropdownItemClick(`${basePath}/profile`)
                      }
                      className="dropdown-item"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="dropdown-icon"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                        />
                      </svg>
                      My Profile
                    </button>
                    <button
                    onClick={() =>
                        handleDropdownItemClick(`${basePath}/favourites`)
                      }
                      className="dropdown-item"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="dropdown-icon"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                        />
                      </svg>
                      Favourites
                    </button>
                    <button
                      onClick={() =>
                        handleDropdownItemClick(`${basePath}/prescriptions`)
                      }
                      className="dropdown-item"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="dropdown-icon"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                        />
                      </svg>
                      Prescriptions
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="navbar-right">
            <button
              className="l"
              onClick={() => {
                navigate("/patient/login");
              }}
            >
              Login
            </button>
            <button
              className="l"
              onClick={() => {
                navigate("/patient/signup");
              }}
            >
              Signup
            </button>
          </div>
        )}
      </nav>

      <div className={`mobile-menu ${menuOpen ? "show" : ""}`}>
        <div className="mobile-menu-header">
          <FaTimes
            className="close-icon"
            onClick={() => setMenuOpen(false)}
          />
        </div>
        <div className="mobile-menu-links">{renderLinks(closeMenu)}</div>
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