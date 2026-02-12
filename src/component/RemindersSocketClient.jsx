// RemindersSocketClient.jsx
import React, { useEffect } from "react";
import io from "socket.io-client";

const socket = io(); // or io(SERVER_URL)

export default function RemindersSocketClient() {
  useEffect(() => {
    // request notification permission
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    // pre-load sound
    const audio = new Audio("/sounds/notification.mp3"); // put a small mp3 in public/sounds/

    socket.on("connect", () => console.log("connected socket", socket.id));
    socket.on("reminder", (payload) => {
      console.log("Reminder received", payload);

      // show browser notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(payload.title || "Reminder", { body: payload.message || "" });
      }

      // play sound
      audio.currentTime = 0;
      audio.play().catch(err => console.warn("Sound play failed (user gesture required?)", err));

      // optionally show an in-app toast / UI update
    });

    return () => {
      socket.off("reminder");
      socket.disconnect();
    };
  }, []);

  return null;
}
