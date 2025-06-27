import React, { useState } from 'react';
import { useNotificationService } from '../../Service/NotificationService';
import styles from './NotificationBell.module.css';

export default function NotificationBell() {
  const { notifications, isConnected, clearNotification } = useNotificationService();
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleClearNotification = () => {
    clearNotification();
    setShowNotifications(false);
  };

  return (
    <div className={styles.notificationContainer}>
      {/* Connection Status Indicator */}
      <div className={styles.connectionStatus}>
        <span className={`${styles.statusDot} ${isConnected ? styles.connected : styles.disconnected}`}></span>
        <span className={styles.statusText}>{isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>

      {/* Notification Bell */}
      <div className={styles.notificationBell} onClick={toggleNotifications}>
        <i className="far fa-bell"></i>
        {notifications && (
          <span className={styles.notificationBadge}>1</span>
        )}
      </div>

      {/* Notification Popup */}
      {showNotifications && (
        <div className={styles.notificationPopup}>
          <div className={styles.notificationHeader}>
            <h3>Notifications</h3>
            <button className={styles.clearButton} onClick={handleClearNotification}>
              Clear
            </button>
          </div>
          <div className={styles.notificationList}>
            {notifications ? (
              <div className={styles.notificationItem}>
                <p>{notifications}</p>
                <span className={styles.notificationTime}>
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            ) : (
              <div className={styles.noNotifications}>
                No notifications
                <div className={styles.connectionInfo}>
                  Status: {isConnected ? '✅ Connected' : '❌ Disconnected'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 