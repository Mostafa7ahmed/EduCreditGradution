
import React, { useState } from 'react';
import { useNotificationService } from '../../Service/NotificationService';
import styles from './NotificationBell.module.css';

export default function NotificationBell() {
  const { notifications, loading, error, refetch } = useNotificationService();
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <div className={styles.notificationContainer}>
      {/* Notification Bell */}
      <div className={styles.notificationBell} onClick={toggleNotifications}>
        <i className="far fa-bell"></i>
        {Array.isArray(notifications) && notifications.length > 0 && (
          <span className={styles.notificationBadge}>{notifications.length}</span>
        )}
      </div>

      {/* Notification Popup */}
      {showNotifications && (
        <div className={styles.notificationPopup}>
          <div className={styles.notificationHeader}>
            <h3>Notifications</h3>
            <button className={styles.clearButton} onClick={refetch}>
              Refresh
            </button>
          </div>
          <div className={styles.notificationList}>
            {loading && <div>Loading...</div>}
            {error && <div style={{ color: 'red' }}>Error: {error}</div>}
            {(!Array.isArray(notifications) || notifications.length === 0) && !loading && !error && (
              <div className={styles.noNotifications}>No notifications</div>
            )}
            {Array.isArray(notifications) && notifications.length > 0 && (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {notifications.filter(n => n && typeof n === 'object' && n.title && n.message && n.createdAt).map((n, idx) => (
                  <li key={String(n.createdAt) + idx} className={styles.notificationItem}>
                    <strong>{String(n.title)}</strong>
                    <p>{String(n.message)}</p>
                    <small>{new Date(n.createdAt).toLocaleString()}</small>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 