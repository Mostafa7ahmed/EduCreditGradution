import React from 'react';
import { 
  useNotificationService, 
  useNotificationServiceClass, 
  NotificationProvider, 
  useNotifications 
} from '../../Service/NotificationService';

// Example 1: Using the custom hook directly
const NotificationExample1 = () => {
  const { notifications, isConnected, clearNotification } = useNotificationService();

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px', borderRadius: '8px' }}>
      <h3>Example 1: Custom Hook</h3>
      <p>Connection Status: {isConnected ? '✅ Connected' : '❌ Disconnected'}</p>
      <p>Latest Notification: {notifications || 'None'}</p>
      <button onClick={clearNotification}>Clear Notification</button>
    </div>
  );
};

// Example 2: Using the service class approach
const NotificationExample2 = () => {
  const { notifications, isConnected, clearNotification } = useNotificationServiceClass();

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px', borderRadius: '8px' }}>
      <h3>Example 2: Service Class</h3>
      <p>Connection Status: {isConnected ? '✅ Connected' : '❌ Disconnected'}</p>
      <p>Latest Notification: {notifications || 'None'}</p>
      <button onClick={clearNotification}>Clear Notification</button>
    </div>
  );
};

// Example 3: Using the context provider approach (component that consumes the context)
const NotificationExample3 = () => {
  const { notifications, isConnected, clearNotification } = useNotifications();

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px', borderRadius: '8px' }}>
      <h3>Example 3: Context Provider</h3>
      <p>Connection Status: {isConnected ? '✅ Connected' : '❌ Disconnected'}</p>
      <p>Latest Notification: {notifications || 'None'}</p>
      <button onClick={clearNotification}>Clear Notification</button>
    </div>
  );
};

// Main component showing all examples
const NotificationUsageExample = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>SignalR Notification Service - React Examples</h2>
      <p>These examples show different ways to use the React equivalent of the Angular NotificationService.</p>
      
      {/* Example 1 & 2 work independently */}
      <NotificationExample1 />
      <NotificationExample2 />
      
      {/* Example 3 needs to be wrapped in the provider */}
      <NotificationProvider>
        <NotificationExample3 />
      </NotificationProvider>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h4>Usage Instructions:</h4>
        <ul>
          <li><strong>Custom Hook</strong>: Use <code>useNotificationService()</code> directly in any component</li>
          <li><strong>Service Class</strong>: Use <code>useNotificationServiceClass()</code> for singleton behavior similar to Angular</li>
          <li><strong>Context Provider</strong>: Wrap your app with <code>&lt;NotificationProvider&gt;</code> and use <code>useNotifications()</code> in child components</li>
        </ul>
        
        <h4>Events Listened:</h4>
        <ul>
          <li><code>EnrollmentStatusUpdated</code> - Shows status and guide notes with 🧑‍🎓 emoji</li>
          <li><code>StudentEnrollmentChanged</code> - Shows enrollment changes with 👨‍🏫 emoji</li>
        </ul>
        
        <h4>SignalR Configuration:</h4>
        <ul>
          <li>URL: <code>https://educredit.runasp.net/notificationHub</code></li>
          <li>Transport: WebSockets only</li>
          <li>Skip Negotiation: true</li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationUsageExample; 