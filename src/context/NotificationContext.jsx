import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/API";

// ✅ CREATE CONTEXT
const NotificationContext = createContext();

// ✅ PROVIDER
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Mark as read
  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}`, { read: true });

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, fetchNotifications, markAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// ✅ CUSTOM HOOK
export const useNotifications = () => {
  return useContext(NotificationContext);
};
