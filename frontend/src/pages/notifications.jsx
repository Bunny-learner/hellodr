import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaCalendarCheck,
  FaCommentDots, 
  FaCog,
  FaCheckCircle,
  FaTrash,
} from "react-icons/fa";
import Circle1 from "../components/Loaders/circle1";
import "../css/notifications.css"; 

const Notifications = () => {
  const [notifList, setNotifList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
   await fetch("http://localhost:8000/getallnotify", {
                  method: "GET",
                  credentials: "include",
                })
      .then(async(res)=>{
        const data=await res.json()
        if(res.status==200)
              setNotifList(data.notifications);
        else
          console.log(`response status is ${res.status}`)
      })
      .catch((err)=>console.log(err))
  
    } catch (error) {
      console.error("Error fetching notifications:", error);
      // Handle error, e.g., show a toast notification
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

 
  const unreadNotifications = notifList.filter((n) => !n.isread);
  const readNotifications = notifList.filter((n) => n.isread);

  // CHANGED: Updated logic to use the notification object and `isappointment`
  const getIcon = (notif) => {
    if (notif.isappointment) {
      return <FaCalendarCheck className="icon-appointment" />;
    }
    // Default icon for other types (e.g., chat, system)
    // You can expand this logic if more booleans are added (e.g., `isChat`)
    return <FaCommentDots className="icon-chat" />;
  };

  const timeAgo = (isoString) => {
    const date = new Date(isoString);
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return Math.floor(seconds / 60) + "m ago";
    if (seconds < 86400) return Math.floor(seconds / 3600) + "h ago";
    if (seconds < 2592000) return Math.floor(seconds / 86400) + "d ago";
    if (seconds < 31536000) return Math.floor(seconds / 2592000) + "mo ago";
    return Math.floor(seconds / 31536000) + "y ago";
  };

  // =====================
  // ACTIONS
  // =====================

  const handleNotificationClick = async (notification) => {
    // CHANGED: Use `isread`
    if (notification.isread) return;

    try {
      // Optimistic UI update
      setNotifList(
        notifList.map((n) =>
          // CHANGED: Use `_id` and `isread`
          n._id === notification._id ? { ...n, isread: true } : n
        )
      );
      // CHANGED: Use `_id`
      await fetch(`http://localhost:8000/markread/${notification._id}`,{
        method:"GET",
        credentials:"include"
      });
    } catch (err) {
      console.log("Mark single read error", err);
      // Rollback on error
      setNotifList(
        notifList.map((n) =>
          // CHANGED: Use `_id` and `isread`
          n._id === notification._id ? { ...n, isread: false } : n
        )
      );
    }
  };

  const handleMarkAllRead = async () => {
    try {

      setNotifList(notifList.map((n) => ({ ...n, isread: true })));
      await fetch("http://localhost:8000/markallread",{
  method:"POST",
  credentials: "include"
      });
    } catch (err) {
      console.log("Mark all read error", err);
      setNotifList(notifList.map((n) => ({ ...n, isread: false })));
    }
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    
    try {
    
      setNotifList(notifList.filter((n) => n._id !== notificationId));
      await fetch(`http://localhost:8000/deletenotify/${notificationId}`,{
        method:"DELETE",
        credentials:"include"

      });
    } catch (err) {
      console.log("Delete error", err);
      // Handle rollback if needed
    }
  };

  

  if (loading) {
    return <div className="notification-panel-loading"><Circle1/></div>;
  }

  return (
    <div className="notification-page-container">
      <div className="notification-panel">
        <div className="panel-header">
          <h2>Notifications</h2>
          {unreadNotifications.length > 0 && (
            <button className="mark-read-btn" onClick={handleMarkAllRead}>
              Mark all as read
            </button>
          )}
        </div>

        <div className="panel-body">
          {notifList.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <FaCheckCircle />
              </div>
              <p>You're all caught up!</p>
              <span>You have no new notifications.</span>
            </div>
          ) : (
            <>
              {/* NEW */}
              {unreadNotifications.length > 0 && (
                <div className="notification-group">
                  <h3>New</h3>
                  {unreadNotifications.map((notif) => (
                    <div
                      // CHANGED: Use `_id`
                      key={notif._id}
                      className="notification-item unread"
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className="notif-icon-wrapper">
                        {/* CHANGED: Pass the whole `notif` object */}
                        {getIcon(notif)}
                      </div>

                      <div className="notif-content">
                        <p className="notif-message">{notif.message}</p>
                        <span className="notif-timestamp">
                          {/* CHANGED: Use `sentat` */}
                          {timeAgo(notif.sentat)}
                        </span>
                      </div>

                      <button
                        className="delete-btn"
                        // CHANGED: Use `_id`
                        onClick={(e) => handleDeleteNotification(e, notif._id)}
                        title="Delete notification"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* EARLIER */}
              {readNotifications.length > 0 && (
                <div className="notification-group">
                  <h3>Earlier</h3>
                  {readNotifications.map((notif) => (
                    <div
                      // CHANGED: Use `_id`
                      key={notif._id}
                      className="notification-item"
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className="notif-icon-wrapper">
                        {/* CHANGED: Pass the whole `notif` object */}
                        {getIcon(notif)}
                      </div>

                      <div className="notif-content">
                        <p className="notif-message">{notif.message}</p>
                        <span className="notif-timestamp">
                          {/* CHANGED: Use `sentat` */}
                          {timeAgo(notif.sentat)}
                        </span>
                      </div>

                      <button
                        className="delete-btn"
                        // CHANGED: Use `_id`
                        onClick={(e) => handleDeleteNotification(e, notif._id)}
                        title="Delete notification"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;