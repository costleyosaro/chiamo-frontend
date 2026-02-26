// src/components/NotificationBell.jsx
import React from 'react';
import { FiBell } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import './NotificationBell.css';

const NotificationBell = () => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  return (
    <button 
      className="notification-bell"
      onClick={() => navigate('/notifications')}
      aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
    >
      <FiBell />
      {unreadCount > 0 && (
        <span className="notification-badge">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;