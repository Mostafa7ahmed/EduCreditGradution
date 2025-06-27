import { useState, useEffect, useRef, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';

// Custom hook for SignalR notifications (React equivalent of the Angular service)
export const useNotificationService = () => {
  const [notifications, setNotifications] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const hubConnectionRef = useRef(null);
  const isStartedRef = useRef(false);

  const startConnection = useCallback(() => {
    if (isStartedRef.current) return;

    const hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://educredit.runasp.net/notificationHub', {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .build();

    hubConnectionRef.current = hubConnection;

    hubConnection
      .start()
      .then(() => {
        isStartedRef.current = true;
        setIsConnected(true);
        console.log('✅ SignalR Connected');
      })
      .catch(err => {
        setIsConnected(false);
        console.error('❌ SignalR Error:', err);
      });

    // Listen for enrollment status updates
    hubConnection.on('EnrollmentStatusUpdated', (data) => {
      const formatted = `🧑‍🎓 Status: ${data.Status}, Notes: ${data.GuideNotes}`;
      setNotifications(formatted);
    });

    // Listen for student enrollment changes
    hubConnection.on('StudentEnrollmentChanged', (message) => {
      const formatted = `👨‍🏫 ${message}`;
      setNotifications(formatted);
    });

    // Connection lifecycle events
    hubConnection.onclose(() => {
      isStartedRef.current = false;
      setIsConnected(false);
      console.log('SignalR connection closed');
    });

    hubConnection.onreconnecting(() => {
      setIsConnected(false);
      console.log('SignalR reconnecting...');
    });

    hubConnection.onreconnected(() => {
      setIsConnected(true);
      console.log('SignalR reconnected!');
    });

  }, []);

  useEffect(() => {
    startConnection();

    return () => {
      if (hubConnectionRef.current) {
        hubConnectionRef.current.stop();
        isStartedRef.current = false;
      }
    };
  }, [startConnection]);

  return {
    notifications,
    isConnected,
    clearNotification: () => setNotifications(null)
  };
};

// Alternative: Context-based approach (similar to Angular service singleton)
import { createContext, useContext } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const notificationService = useNotificationService();
  
  return (
    <NotificationContext.Provider value={notificationService}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Direct service class approach (closest to Angular service)
class NotificationService {
  constructor() {
    this.hubConnection = null;
    this.isStarted = false;
    this.notifications = null;
    this.subscribers = new Set();
  }

  startConnection() {
    if (this.isStarted) return;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://educredit.runasp.net/notificationHub', {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .build();

    this.hubConnection
      .start()
      .then(() => {
        this.isStarted = true;
        console.log('✅ SignalR Connected');
        this.notifySubscribers({ type: 'connected' });
      })
      .catch(err => {
        console.error('❌ SignalR Error:', err);
        this.notifySubscribers({ type: 'error', error: err });
      });

    this.hubConnection.on('EnrollmentStatusUpdated', (data) => {
      const formatted = `🧑‍🎓 Status: ${data.Status}, Notes: ${data.GuideNotes}`;
      this.notifications = formatted;
      this.notifySubscribers({ type: 'notification', message: formatted });
    });

    this.hubConnection.on('StudentEnrollmentChanged', (message) => {
      const formatted = `👨‍🏫 ${message}`;
      this.notifications = formatted;
      this.notifySubscribers({ type: 'notification', message: formatted });
    });
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers(data) {
    this.subscribers.forEach(callback => callback(data));
  }

  getNotifications() {
    return this.notifications;
  }

  clearNotifications() {
    this.notifications = null;
    this.notifySubscribers({ type: 'cleared' });
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// React hook to use the service
export const useNotificationServiceClass = () => {
  const [notifications, setNotifications] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Start connection
    notificationService.startConnection();

    // Subscribe to updates
    const unsubscribe = notificationService.subscribe((data) => {
      switch (data.type) {
        case 'notification':
          setNotifications(data.message);
          break;
        case 'connected':
          setIsConnected(true);
          break;
        case 'error':
          setIsConnected(false);
          break;
        case 'cleared':
          setNotifications(null);
          break;
      }
    });

    return unsubscribe;
  }, []);

  return {
    notifications,
    isConnected,
    clearNotification: () => notificationService.clearNotifications()
  };
}; 