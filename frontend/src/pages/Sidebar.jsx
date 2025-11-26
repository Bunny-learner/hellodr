import React from 'react';
import '../css/sidebar.css';
import {useNavigate} from "react-router-dom"
import {
FaBell,
FaCalendarCheck,
FaCommentDots,
FaCog,
FaCheckCircle,
FaTimes,
FaArrowRight
} from 'react-icons/fa';

const API = import.meta.env.VITE_API_URL;

// --- Helper: Get Icon ---
const getIcon = (type) => {
  switch (type) {
    case "doctor":
      return <FaCalendarCheck className="sidebar-notif-icon doctor-icon" />;
    case "system":
      return <FaCog className="sidebar-notif-icon system-icon" />;
    case "patient":
      return <FaCommentDots className="sidebar-notif-icon patient-icon" />;
    default:
      return <FaBell className="sidebar-notif-icon default-icon" />;
  }
};


// --- Helper: Time Ago ---
const timeAgo = (isoString) => {
const date = new Date(isoString);
const seconds = Math.floor((new Date() - date) / 1000);
let interval = seconds / 3600;
if (interval > 1) return Math.floor(interval) + "h ago";
interval = seconds / 60;
if (interval > 1) return Math.floor(interval) + "m ago";
return "Just now";
};

// --- Notification Item ---
const NotificationItem = ({ notification, onClick }) => {

  const typeClass =
    notification.type === "system"
      ? "sidebar-notif-system"
      : notification.type === "doctor"
      ? "sidebar-notif-doctor"
      : notification.type === "patient"
      ? "sidebar-notif-patient"
      : "sidebar-notif-default";

  return (
    <div
      className={`sidebar-notification-item 
                  ${typeClass} 
                  ${notification.read ? "" : "sidebar-unread"}`}
      onClick={() => onClick(notification)}
      role="button"
      tabIndex={0}
    >
      {getIcon(notification.type)}

      <div className="sidebar-notif-content">
        <p className="sidebar-notif-message">{notification.message}</p>
        <span className="sidebar-notif-timestamp">
          {timeAgo(notification.timestamp)}
        </span>
      </div>

      {!notification.read && <div className="sidebar-unread-dot"></div>}
    </div>
  );
};


// --- Main Sidebar ---
export default function Sidebar({ isOpen, onClose, notifications = mockNotifications, basePath = '' }) {
const navigate = useNavigate();

const handleNotificationClick = (notification) => {
navigate(notification.link);
onClose();
};

const handleViewAll = () => {
navigate(`${basePath}/notifications`);
onClose();
};

const handleMarkAllAsRead = async () => {
try {
  console.log("markallread")
const response = await fetch(`${API}/markallread`, { method: 'POST', credentials: 'include'});
if (response.ok) {
onClose();
} else {
console.error('Failed to mark all notifications as read.');
}
} catch (error) {
console.error('Error marking all notifications as read:', error);
}
};

const unreadNotifications = notifications.filter(n => !n.read);
const readNotifications = notifications.filter(n => n.read);

return (
<>
{/* Backdrop */}
<div className={`sidebar-backdrop ${isOpen ? 'sidebar-backdrop-show' : ''}`} onClick={onClose} />


  {/* Sidebar Panel */}  
  <aside className={`sidebar-panel ${isOpen ? 'sidebar-panel-open' : ''}`}>  
    {/* Header */}  
    <div className="sidebar-header">  
      <div className="sidebar-title-group">  
        <h2>Notifications</h2>  
        {unreadNotifications.length > 0 && (  
          <button className="sidebar-mark-all-btn" onClick={handleMarkAllAsRead}>Mark all as read</button>  
        )}  
      </div>  
      <button className="sidebar-close-btn" onClick={onClose}><FaTimes /></button>  
    </div>  

    {/* Body */}  
    <div className="sidebar-body">  
      {notifications.length === 0 ? (  
        <div className="sidebar-empty-state">  
          <div className="sidebar-empty-icon"><FaCheckCircle /></div>  
          <p>You're all caught up!</p>  
          <span>You have no new notifications.</span>  
        </div>  
      ) : (  
        <>  
          {unreadNotifications.length > 0 && (  
            <div className="sidebar-notification-group">  
              <h3>New</h3>  
              {unreadNotifications.map(notif => (  
                <NotificationItem key={notif.id} notification={notif} onClick={handleNotificationClick} />  
              ))}  
            </div>  
          )}  
          {readNotifications.length > 0 && (  
            <div className="sidebar-notification-group">  
              <h3>Earlier</h3>  
              {readNotifications.map(notif => (  
                <NotificationItem key={notif.id} notification={notif} onClick={handleNotificationClick} />  
              ))}  
            </div>  
          )}  
        </>  
      )}  
    </div>  

    {/* Footer */}  
    <div className="sidebar-footer">  
      <button className="sidebar-view-all-btn" onClick={handleViewAll}>  
        View All Notifications <FaArrowRight />  
      </button>  
    </div>  
  </aside>  
</>  


);
}
