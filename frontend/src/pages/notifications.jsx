import React, { useEffect, useState } from 'react';
import { FaCalendarCheck, FaCommentDots, FaCog, FaCheckCircle, FaTrash } from 'react-icons/fa';
import '../css/notifications.css';

const NotificationPanel = () => {
  const [notifList, setNotifList] = useState([]);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      // TODO: replace with actual API call
      // const res = await fetch('/api/notifications');
      // const data = await res.json();
      // setNotifList(data.notifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadNotifications = notifList.filter(n => !n.isRead);
  const readNotifications = notifList.filter(n => n.isRead);

  const handleNotificationClick = async (notification) => {
    try {
      // TODO: call backend API to mark as read
      // await fetch(`/api/notifications/${notification.id}/markread`, { method: 'POST' });
      
      setNotifList(notifList.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
      // TODO: navigate to notification.link if needed
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      // TODO: call backend API to mark all as read
      // await fetch('/api/notifications/markallread', { method: 'POST' });
      
      setNotifList(notifList.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      // TODO: call backend API to delete notification
      // await fetch(`/api/notifications/${notificationId}`, { method: 'DELETE' });
      
      setNotifList(notifList.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'appointment': return <FaCalendarCheck className="icon-appointment" />;
      case 'chat': return <FaCommentDots className="icon-chat" />;
      case 'system': return <FaCog className="icon-system" />;
      default: return <FaCog className="icon-default" />;
    }
  };

  const timeAgo = (isoString) => {
    const date = new Date(isoString);
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "Just now";
  };

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
            <div className="empty-icon"><FaCheckCircle /></div>
            <p>You're all caught up!</p>
          </div>
        ) : (
          <>
            {unreadNotifications.length > 0 && (
              <div className="notification-group">
                <h3>New</h3>
                {unreadNotifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`notification-item ${notif.isRead ? '' : 'unread'}`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div className="notif-icon-wrapper">{getIcon(notif.type)}</div>
                    <div className="notif-content">
                      <p className="notif-message">{notif.message}</p>
                      <span className="notif-timestamp">{timeAgo(notif.timestamp)}</span>
                    </div>
                    <button
                      className="delete-btn"
                      onClick={(e) => { e.stopPropagation(); handleDeleteNotification(notif.id); }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {readNotifications.length > 0 && (
              <div className="notification-group">
                <h3>Earlier</h3>
                {readNotifications.map(notif => (
                  <div
                    key={notif.id}
                    className="notification-item"
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div className="notif-icon-wrapper">{getIcon(notif.type)}</div>
                    <div className="notif-content">
                      <p className="notif-message">{notif.message}</p>
                      <span className="notif-timestamp">{timeAgo(notif.timestamp)}</span>
                    </div>
                    <button
                      className="delete-btn"
                      onClick={(e) => { e.stopPropagation(); handleDeleteNotification(notif.id); }}
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

      <div className="panel-footer">
        <a href="/notifications">View All Notifications</a>
      </div>
    </div>
  );
};

export default NotificationPanel;
