// src/context/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import NotificationPanel from "../component/notifications/NotificationPanel";


// Create context
const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Fetch notifications from backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
          const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/notifications",{
            headers: { Authorization: `Bearer ${token}` },
      });
        setNotifications(res.data); // ✅ axios returns data directly
      } catch (err) {
        console.error("Failed to fetch notifications:", err.message);
      }
    };
    fetchNotifications();
  }, []);

  // Add a new notification locally
  const addNotification = (notif) => {
    setNotifications((prev) => [
      ...prev,
      { ...notif, id: Date.now().toString() },
    ]);
  };

  // Remove notification by id
  const removeNotification = (id) => {
    setNotifications((prev) =>
      prev.filter((n) => n._id !== id && n.id !== id)
    );
  };

  // Mark notification as read (backend + local state)
  const markAsRead = async (id) => {
    try {
       const token = localStorage.getItem("token");
      await axios.patch(`http://localhost:5000/api/notifications/${id}/read`,{
       headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err.message);
    }
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification, markAsRead }}
    >
      {children}
      <NotificationPanel
        
      />
    </NotificationContext.Provider>
  );
};

// Hook for consuming notifications
export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return ctx;
};
