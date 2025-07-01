import { useNotificationService } from "../../Service/NotificationService";

const NotificationList = () => {
  const { notifications, loading, error, refetch } = useNotificationService();

  if (loading) return <div>Loading notifications...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!notifications.length) return <div>No notifications found.</div>;

  return (
    <div>
      <h2>Notifications</h2>
      <button onClick={refetch}>Refresh</button>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {notifications.map((n, idx) => (
          <li key={n.createdAt + idx} style={{ marginBottom: 16, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
            <strong>{n.title}</strong>
            <p>{n.message}</p>
            <small>{new Date(n.createdAt).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationList;
