import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext"; // ✅ Use the context
import UniversalBackButton from "../components/UniversalBackButton";
import { 
  FiBell, 
  FiCheck, 
  FiPackage, 
  FiShoppingCart, 
  FiTruck, 
  FiAlertCircle,
  FiTrash2,
  FiCheckCircle,
  FiClock,
  FiX,
  FiChevronLeft
} from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi";
import "./Notifications.css";

// Get notification icon based on type
const getNotificationIcon = (type) => {
  switch (type) {
    case 'order_placed':
    case 'order_confirmed':
      return <FiShoppingCart className="notif-icon order" />;
    case 'order_shipped':
    case 'order_delivered':
      return <FiTruck className="notif-icon delivery" />;
    case 'order_cancelled':
      return <FiX className="notif-icon cancelled" />;
    case 'payment_success':
      return <FiCheckCircle className="notif-icon success" />;
    case 'payment_failed':
      return <FiAlertCircle className="notif-icon error" />;
    default:
      return <FiBell className="notif-icon default" />;
  }
};

// Format notification time
const formatNotificationTime = (timestamp) => {
  const now = new Date();
  const notifTime = new Date(timestamp);
  const diffInMinutes = Math.floor((now - notifTime) / (1000 * 60));
  
  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return notifTime.toLocaleDateString();
};

// Update the NotificationCard component
const NotificationCard = ({ notification, onMarkAsRead, onDelete }) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const navigate = useNavigate();

  const handleDelete = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onDelete(notification.id);
    }, 300);
  };

  const handleMarkAsRead = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
  };

  const handleCardClick = () => {
    handleMarkAsRead();
    
    // ✅ FIXED: Navigate to order if order_id exists
    if (notification.order_id) {
      navigate(`/orders?orderId=${notification.order_id}`);
    }
  };

  return (
    <div 
      className={`notification-card ${!notification.is_read ? 'unread' : 'read'} ${isRemoving ? 'removing' : ''}`}
      onClick={handleCardClick}
      style={{ cursor: notification.order_id ? 'pointer' : 'default' }}
    >
      <div className="notif-icon-wrapper">
        {getNotificationIcon(notification.type)}
        {!notification.is_read && <div className="unread-dot"></div>}
      </div>
      
      <div className="notif-content">
        <div className="notif-header">
          <h3 className="notif-title">{notification.title}</h3>
          <span className="notif-time">
            <FiClock />
            {formatNotificationTime(notification.created_at)}
          </span>
        </div>
        
        <p className="notif-message">{notification.message}</p>
        
        {notification.order_id && (
          <div className="notif-order-info">
            <FiPackage />
            <span>Order #{notification.order_id}</span>
            <span className="notif-view-order">Tap to view order</span>
          </div>
        )}
      </div>
      
      <div className="notif-actions">
        {!notification.is_read && (
          <button 
            className="notif-action-btn mark-read"
            onClick={(e) => {
              e.stopPropagation();
              handleMarkAsRead();
            }}
            title="Mark as read"
          >
            <FiCheck />
          </button>
        )}
        <button 
          className="notif-action-btn delete"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          title="Delete notification"
        >
          <FiTrash2 />
        </button>
      </div>
    </div>
  );
};

// Empty state component
const EmptyNotifications = () => (
  <div className="notif-empty-state">
    <div className="notif-empty-icon">
      <FiBell />
      <HiOutlineSparkles className="sparkle" />
    </div>
    <h3 className="notif-empty-title">No notifications yet</h3>
    <p className="notif-empty-text">
      You'll see order updates and important messages here
    </p>
  </div>
);

// Main notifications component
export default function Notifications() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // all, unread, read
  
  // ✅ FIXED: Use the NotificationContext instead of direct API calls
  const { 
    notifications, 
    loading, 
    error, 
    unreadCount, 
    markAsRead, 
    loadNotifications,
    playNotificationSound 
  } = useNotifications();

  // ✅ FIXED: Handle delete notification (fallback to local state if API fails)
  const [localNotifications, setLocalNotifications] = useState([]);
  
  useEffect(() => {
    setLocalNotifications(notifications);
  }, [notifications]);

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // Delete notification (local only since API might not support it)
  const handleDeleteNotification = (notificationId) => {
    setLocalNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      // Mark all unread notifications as read
      const unreadNotifications = localNotifications.filter(n => !n.is_read);
      for (const notification of unreadNotifications) {
        await markAsRead(notification.id);
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  // Clear all notifications (local only)
  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to delete all notifications?")) {
      setLocalNotifications([]);
    }
  };

  // ✅ FIXED: Use localNotifications and ensure it's always an array
  const safeNotifications = Array.isArray(localNotifications) ? localNotifications : [];
  
  // Filter notifications
  const filteredNotifications = safeNotifications.filter(notification => {
    if (filter === 'unread') return !notification.is_read;
    if (filter === 'read') return notification.is_read;
    return true;
  });

  const currentUnreadCount = safeNotifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="notifications-page">
        <div className="notif-header">
          <button className="notif-back-btn" onClick={() => navigate(-1)}>
            <FiChevronLeft />
          </button>
          <h1 className="notif-page-title">Notifications</h1>
        </div>
        <div className="notif-loading">
          <div className="notif-skeleton">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="notif-skeleton-item">
                <div className="notif-skeleton-icon"></div>
                <div className="notif-skeleton-content">
                  <div className="notif-skeleton-title"></div>
                  <div className="notif-skeleton-message"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notifications-page">
        <div className="notif-header">
          <button className="notif-back-btn" onClick={() => navigate(-1)}>
            <FiChevronLeft />
          </button>
          <h1 className="notif-page-title">Notifications</h1>
        </div>
        <div className="notif-error">
          <FiAlertCircle />
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button onClick={() => loadNotifications()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      {/* Header */}
      <div className="notif-header">
        <button className="notif-back-btn" onClick={() => navigate(-1)}>
          <FiChevronLeft />
        </button>
        <div className="notif-header-content">
          <h1 className="notif-page-title">Notifications</h1>
          {currentUnreadCount > 0 && (
            <span className="notif-unread-badge">{currentUnreadCount}</span>
          )}
        </div>
        {safeNotifications.length > 0 && (
          <div className="notif-header-actions">
            <button 
              className="notif-action-btn secondary"
              onClick={handleMarkAllAsRead}
              disabled={currentUnreadCount === 0}
            >
              <FiCheck />
              Mark all read
            </button>
            <button 
              className="notif-action-btn danger"
              onClick={handleClearAll}
            >
              <FiTrash2 />
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      {safeNotifications.length > 0 && (
        <div className="notif-filters">
          <button 
            className={`notif-filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({safeNotifications.length})
          </button>
          <button 
            className={`notif-filter-btn ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread ({currentUnreadCount})
          </button>
          <button 
            className={`notif-filter-btn ${filter === 'read' ? 'active' : ''}`}
            onClick={() => setFilter('read')}
          >
            Read ({safeNotifications.length - currentUnreadCount})
          </button>
        </div>
      )}

      {/* Content */}
      <div className="notif-content">
        {filteredNotifications.length === 0 ? (
          <EmptyNotifications />
        ) : (
          <div className="notif-list">
            {filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDeleteNotification}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom spacer */}
      <div className="notif-bottom-spacer"></div>
    </div>
  );
}