import { useNotifications } from "../../context/NotificationContext";

const Notification = () => {
  const { notifications, loading, markAsRead } = useNotifications();

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      {notifications.map((note) => (
        <div key={note._id} className="p-4 shadow rounded mb-3">
          <p>{note.message}</p>
          {!note.read && (
            <button onClick={() => markAsRead(note._id)}>
              Mark as Read
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default Notification;
