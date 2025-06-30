import { useState, useEffect } from 'react';


// Custom hook to fetch notifications from API and return as a list
export const useNotificationService = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://educredit.runasp.net/api/Notifications', {
        headers: {
          'accept': '*/*',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return {
    notifications,
    loading,
    error,
    refetch: fetchNotifications,
  };
};


// (Optional) Context-based approach can be re-added if needed, but removed for simplicity