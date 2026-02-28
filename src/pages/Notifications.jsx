// src/pages/Notifications.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";
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
  FiChevronLeft,
  FiGift,
  FiInfo
} from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi";
import "./Notifications.css";

// Get notification icon based on Django backend type
const getNotificationIcon = (type) => {
  switch (type) {
    case 'order':
      return <FiShoppingCart className="notif-icon order" />;
    case 'delivery':
      return <FiTruck className="notif-icon delivery" />;
    case 'payment':
      return <FiCheckCircle className="notif-icon payment" />;
    case 'support':
      return <FiAlertCircle className="notif-icon support" />;
    case 'promo':
      return <FiGift className="notif-icon promo" />;
    case 'system':
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

// Extract order ID from notification message
const extractOrderId = (message) => {
  const match = message.match(/#(\d+)/);
  return match ? match[1] : null;
};

// Enhanced NotificationCard component
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
    
    // Extract order ID from message or use order_id field
    const orderId = notification.order_id || extractOrderId(notification.message);
    
    if (orderId && (notification.type === 'order' || notification.type === 'delivery')) {
      // Navigate to orders page with order ID for highlighting
      navigate(`/orders?highlight=${orderId}`);
    } else if (notification.type === 'promo') {
      navigate('/all-products');
    } else if (notification.type === 'support') {
      navigate('/support');
    }
  };

  // Determine if notification is clickable
  const isClickable = notification.type === 'order' || 
                     notification.type === 'delivery' || 
                     notification.type === 'promo' || 
                     notification.type === 'support';

  return (
    <div 
      className={`notification-card ${!notification.is_read ? 'unread' : 'read'} ${isRemoving ? 'removing' : ''} ${isClickable ? 'clickable' : ''}`}
      onClick={isClickable ? handleCardClick : handleMarkAsRead}
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
        
        {/* Show order info for order-related notifications */}
        {(notification.type === 'order' || notification.type === 'delivery') && (
          <div className="notif-order-info">
            <FiPackage />
            <span>Order #{notification.order_id || extractOrderId(notification.message)}</span>
            {isClickable && <span className="notif-view-order">Tap to view order</span>}
          </div>
        )}

        {/* Show action button for promotional notifications */}
        {notification.type === 'promo' && (
          <div className="notif-action-info">
            <FiGift />
            <span className="notif-action-text">Tap to view offers</span>
          </div>
        )}

        {/* Show action button for support notifications */}
        {notification.type === 'support' && (
          <div className="notif-action-info">
            <FiInfo />
            <span className="notif-action-text">Tap for support</span>
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
  
  const { 
    notifications, 
    loading, 
    error, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    deleteNotification,
    loadNotifications
  } = useNotifications();

  // Add sample notifications for testing (remove this in production)
  useEffect(() => {
    // Only add sample notifications if there are no real notifications
    if (notifications.length === 0 && !loading && !error) {
      // You can remove this in production - it's just for testing
      console.log("No notifications found - this is normal if backend doesn't have any");
    }
  }, [notifications, loading, error]);

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // Delete notification
  const handleDeleteNotification = (notificationId) => {
    deleteNotification(notificationId);
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  // Clear all notifications
  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to delete all notifications?")) {
      notifications.forEach(notification => {
        deleteNotification(notification.id);
      });
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.is_read;
    if (filter === 'read') return notification.is_read;
    return true;
  });

  const currentUnreadCount = notifications.filter(n => !n.is_read).length;

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
        {notifications.length > 0 && (
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
      {notifications.length > 0 && (
        <div className="notif-filters">
          <button 
            className={`notif-filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({notifications.length})
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
            Read ({notifications.length - currentUnreadCount})
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