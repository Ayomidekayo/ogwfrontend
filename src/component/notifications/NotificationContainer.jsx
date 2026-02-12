// src/component/NotificationContainer.jsx
import React from "react";

const NotificationContainer = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="bg-white shadow-lg rounded-md p-4 w-80 flex justify-between items-center animate-slideIn"
        >
          <div>
            <h4 className="font-bold capitalize">{n.type || "Notification"}</h4>
            <p className="text-sm">{n.message}</p>
          </div>
          <button
            onClick={() => removeNotification(n.id)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
