import { useLocation, Link } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { FiBell } from "react-icons/fi";
import bg from "../../assets/icon.png"
import "./navbar.css";

export default function Navbar({ src, usertype = "patient" }) {
  const location = useLocation();
  const basePath = `/${usertype}`;

  let activePage = "";
  if (location.pathname.includes(`${basePath}/home`)) activePage = "home";
  else if (location.pathname.includes(`${basePath}/appointments`)) activePage = "appointments";
  else if (location.pathname.includes(`${basePath}/getdoctors`)) activePage = "finddoctor";
  else if (location.pathname.includes(`${basePath}/timeslots`)) activePage = "timeslots";
  else if (location.pathname.includes(`${basePath}/payments`)) activePage = "Payments";

  const renderLinks = () => {
    if (usertype === "doctor") {
      return (
        <ul className="navbar-links">
          <li>
            <Link to={`${basePath}/home`} className={activePage === "home" ? "active" : ""}>
              Home
            </Link>
          </li>
          <li>
            <Link to={`${basePath}/timeslots`} className={activePage === "timeslots" ? "active" : ""}>
              Time Slots
            </Link>
          </li>
          <li>
            <Link to={`${basePath}/appointments`} className={activePage === "appointments" ? "active" : ""}>
              Appointments
            </Link>
          </li>
        </ul>
      );
    } else {
      return (
        <ul className="navbar-links">
          <li>
            <Link to={`${basePath}/home`} className={activePage === "home" ? "active" : ""}>
              Home
            </Link>
          </li>
          <li>
            <Link to={`${basePath}/appointments`} className={activePage === "appointments" ? "active" : ""}>
              Appointments
            </Link>
          </li>
          <li>
            <Link to={`${basePath}/getdoctors`} className={activePage === "finddoctor" ? "active" : ""}>
              Find a Doctor
            </Link>
          </li>
          <li>
            <Link to={`${basePath}/payments`} className={activePage === "Payments" ? "active" : ""}>
              Payments
            </Link>
          </li>
        </ul>
      );
    }
  };

  return (
    <nav className="main-navbar">
      <div className="navbar-left">
        
        <Link to="/" className="navbar-logo">
        <img style={{width:"50px",height:"50px"}} src={bg} alt="" />
          Hello <span>Dr.</span>
        </Link>
        {renderLinks()}
      </div>

      <div className="navbar-right">
        <button className="icon-button"><FiBell /></button>
        <Link to={`${basePath}/profile`} className="profile-link">
          {!src ? <FaUser /> : <img src={src} alt="Profile" className="profile-pic" />}
        </Link>
      </div>
    </nav>
  );
}

