import React, { useState } from 'react';
import { fetchAllNotifications } from '../../Service/NotificationService';

const NotificationFetcher = () => {
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    const token = window.prompt('Enter your token:');
    if (!token) return;
    setLoading(true);
    try {
      const notifications = await fetchAllNotifications(token);
      window.alert(JSON.stringify(notifications, null, 2));
    } catch (err) {
      window.alert('Failed to fetch notifications: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleFetch} disabled={loading}>
      {loading ? 'Loading...' : 'Fetch Notifications'}
    </button>
  );
};

export default NotificationFetcher;
