import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../pages/Notifications.css";

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    API.get("/orders/notifications/")
      .then((res) => setNotifications(res.data))
      .catch(() => console.warn("Failed to load notifications"));
  }, []);

  return (
    <div className="notifications-wrapper">
      <div className="notifications-header">
        <button onClick={() => navigate(-1)} className="notifications-back">
          ← Back
        </button>
        <h2 className="notifications-title">Notifications</h2>
      </div>

      {notifications.length === 0 ? (
        <p className="notifications-empty">No new notifications.</p>
      ) : (
        <div className="notifications-list">
          {notifications.map((n, i) => (
            <div
              key={i}
              className={`notification-card ${!n.is_read ? "unread" : ""}`}
            >
              <div className="notification-title">{n.title}</div>
              <div className="notification-message">{n.message}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
