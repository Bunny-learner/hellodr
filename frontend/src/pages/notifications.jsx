import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaCalendarCheck,
  FaCommentDots,
  FaCog,
  FaCheckCircle,
  FaTrash,
} from "react-icons/fa";
import "../css/notifications.css";

const Notifications = () => {
  const [notifList, setNotifList] = useState([]);
  const [loading, setLoading] = useState(true);

  // =====================
  // FETCH FROM BACKEND
  // =====================
  const fetchNotifications = async () => {
    try {
      const res = await axios.get("/getallnotifications");
      setNotifList(res.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // =====================
  // HELPERS
  // =====================
  const unreadNotifications = notifList.filter((n) => !n.isRead);
  const readNotifications = notifList.filter((n) => n.isRead);

  const getIcon = (type) => {
    switch (type) {
      case "appointment":
        return <FaCalendarCheck className="icon-appointment" />;
      case "chat":
        return <FaCommentDots className="icon-chat" />;
      case "system":
        return <FaCog className="icon-system" />;
      default:
        return <FaCog className="icon-default" />;
    }
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
    if (notification.isRead) return;
    try {
      await axios.post(`/notification/${notification.id}/mark-read`);
      setNotifList(
        notifList.map((n) =>
          n.id === notification.id ? { ...n, isRead: true } : n
        )
      );
    } catch (err) {
      console.log("Mark single read error", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.post("/notification/mark-all-read");
      setNotifList(notifList.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.log("Mark all read error", err);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/notification/${notificationId}`);
      setNotifList(notifList.filter((n) => n.id !== notificationId));
    } catch (err) {
      console.log("Delete error", err);
    }
  };

  // =====================
  // UI
  // =====================

  if (loading) return <p>Loading...</p>;

  return (
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
          </div>
        ) : (
          <>
            {/* NEW */}
            {unreadNotifications.length > 0 && (
              <div className="notification-group">
                <h3>New</h3>

                {unreadNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`notification-item unread`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div className="notif-icon-wrapper">
                      {getIcon(notif.type)}
                    </div>

                    <div className="notif-content">
                      <p className="notif-message">{notif.message}</p>
                      <span className="notif-timestamp">
                        {timeAgo(notif.timestamp)}
                      </span>
                    </div>

                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNotification(notif.id);
                      }}
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
                    key={notif.id}
                    className="notification-item"
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div className="notif-icon-wrapper">
                      {getIcon(notif.type)}
                    </div>

                    <div className="notif-content">
                      <p className="notif-message">{notif.message}</p>
                      <span className="notif-timestamp">
                        {timeAgo(notif.timestamp)}
                      </span>
                    </div>

                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNotification(notif.id);
                      }}
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
  );
};

export default Notifications;
