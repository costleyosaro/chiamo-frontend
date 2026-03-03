// src/context/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();   

export const useNotifications = () => {        
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ FIXED: Check if user is authenticated before making API calls
  const isAuthenticated = () => {
    const accessToken = localStorage.getItem("access");
    const refreshToken = localStorage.getItem("refresh");
    return !!(user && (accessToken || refreshToken));
  };

  // Load notifications from Django backend
  const loadNotifications = async () => {      
    // ✅ FIXED: Check authentication first
    if (!isAuthenticated()) {
      console.log("User not authenticated, clearing notifications");
      setNotifications([]);
      setUnreadCount(0);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await API.get('/orders/notifications/');
      
      // ✅ FIXED: Handle Django pagination format properly
      let notificationData = response.data;
      let notifications = [];
      
      console.log('Raw notification response:', notificationData);
      
      if (Array.isArray(notificationData)) {
        // Direct array response
        notifications = notificationData;
      } else if (notificationData && Array.isArray(notificationData.results)) {
        // Django pagination format: {count: 0, next: null, previous: null, results: []}
        notifications = notificationData.results;
        console.log('Using paginated results:', notifications);
      } else {
        console.warn('Unexpected notification data format:', notificationData);
        notifications = [];
      }
      
      setNotifications(notifications);
      setUnreadCount(notifications.filter(n => !n.is_read).length);
      
      // ✅ Store in localStorage for persistence
      if (user?.id) {
        localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifications));
      }
      
    } catch (error) {
      console.error('Failed to load notifications:', error);
      
      // ✅ FIXED: Better error handling for authentication issues
      if (error.response?.status === 401) {
        console.log("Authentication failed, clearing notifications");
        setNotifications([]);
        setUnreadCount(0);
        setError(null); // Don't show error for auth issues
        return;
      }
      
      // ✅ Load from localStorage as fallback for other errors
      if (user?.id) {
        const cached = localStorage.getItem(`notifications_${user.id}`);
        if (cached) {
          try {
            const cachedNotifications = JSON.parse(cached);
            setNotifications(cachedNotifications);
            setUnreadCount(cachedNotifications.filter(n => !n.is_read).length);
            console.log('Loaded notifications from cache:', cachedNotifications);
          } catch (parseError) {
            console.error('Failed to parse cached notifications:', parseError);
            setNotifications([]);
            setUnreadCount(0);
          }
        } else {
          setNotifications([]);
          setUnreadCount(0);
        }
      }
      
      // Handle different error types (but not auth errors)
      if (error.response?.status === 404) {
        setError('Notifications feature not available yet');
      } else if (error.code === 'ECONNABORTED') {
        setError('Request timeout - please try again');
      } else if (error.code === 'ERR_NETWORK') {
        setError('Network error - please check your connection');
      } else if (error.response?.status !== 401) {
        setError('Failed to load notifications');
      }
    } finally {
      setLoading(false);
    }
  };

  // Create notification for order events (called from order context)
  const createOrderNotification = async (orderId, event = 'placed', orderTotal = null) => {
    if (!isAuthenticated()) return;

    const messages = {
      placed: {
        title: 'Order Placed Successfully! 🎉',
        message: `Your order #${orderId}${orderTotal ? ` for ₦${orderTotal.toLocaleString()}` : ''} has been placed and is being processed.`,
        type: 'order'
      },
      confirmed: {
        title: 'Order Confirmed! ✅',
        message: `Your order #${orderId} has been confirmed and is being prepared.`,
        type: 'order'
      },
      shipped: {
        title: 'Order Shipped! 🚚',
        message: `Good news! Your order #${orderId} is on the way to you.`,
        type: 'delivery'
      },
      delivered: {
        title: 'Order Delivered! 📦',
        message: `Your order #${orderId} has been delivered successfully. Enjoy your purchase!`,
        type: 'delivery'
      },
      cancelled: {
        title: 'Order Cancelled ❌',
        message: `Your order #${orderId} has been cancelled. If you have any questions, please contact support.`,
        type: 'order'
      }
    };

    const notificationData = messages[event] || messages.placed;
    
    // ✅ Create local notification immediately for instant feedback
    const tempNotification = {
      id: `temp_${Date.now()}`,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type,
      is_read: false,
      created_at: new Date().toISOString(),
      order_id: orderId
    };

    setNotifications(prev => [tempNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
    playNotificationSound();

    // ✅ Try to create on backend (Django will handle this via signals)
    try {
      await API.post('/orders/notifications/', {
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        order_id: orderId
      });
      
      // Refresh notifications to get the real one from backend
      setTimeout(() => {
        if (isAuthenticated()) {
          loadNotifications();
        }
      }, 2000);
    } catch (error) {
      console.warn('Failed to create notification on backend:', error);
      // Keep the local notification even if backend fails
    }
  };

  // Create cart reminder notification
  const createCartReminder = (itemCount) => {
    if (!isAuthenticated()) return;

    const notification = {
      id: `cart_${Date.now()}`,
      title: 'Items in your cart! 🛒',
      message: `You have ${itemCount} item${itemCount > 1 ? 's' : ''} waiting in your cart. Complete your order now!`,
      type: 'system',
      is_read: false,
      created_at: new Date().toISOString()
    };

    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    playNotificationSound();
    
    // ✅ Update localStorage
    if (user?.id) {
      const updatedNotifications = [notification, ...notifications];
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updatedNotifications));
    }
  };

  // Create promotional notification
  const createPromoNotification = (title, message) => {
    if (!isAuthenticated()) return;

    const notification = {
      id: `promo_${Date.now()}`,
      title: title,
      message: message,
      type: 'promo',
      is_read: false,
      created_at: new Date().toISOString()
    };

    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    playNotificationSound();
    
    // ✅ Update localStorage
    if (user?.id) {
      const updatedNotifications = [notification, ...notifications];
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updatedNotifications));
    }
  };

  // Mark as read using Django endpoint
  const markAsRead = async (notificationId) => {
    if (!isAuthenticated() || !notificationId) return;
    
    // ✅ Update local state immediately
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, is_read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    // ✅ Update localStorage
    const updatedNotifications = notifications.map(n =>
      n.id === notificationId ? { ...n, is_read: true } : n
    );
    if (user?.id) {
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updatedNotifications));
    }
    
    // ✅ Sync with backend (only for real notifications, not temp ones)
    if (typeof notificationId === 'number') {
      try {
        await API.patch(`/orders/notifications/${notificationId}/mark_read/`);
      } catch (error) {
        console.error('Failed to mark notification as read on backend:', error);
      }
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!isAuthenticated()) return;

    // ✅ Update local state immediately
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
    
    // ✅ Update localStorage
    const updatedNotifications = notifications.map(n => ({ ...n, is_read: true }));
    if (user?.id) {
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updatedNotifications));
    }

    // ✅ Sync with backend for real notifications
    try {
      const realNotifications = notifications.filter(n => typeof n.id === 'number');
      for (const notification of realNotifications) {
        await API.patch(`/orders/notifications/${notification.id}/mark_read/`);
      }
    } catch (error) {
      console.error('Failed to mark all as read on backend:', error);
    }
  };

  // Delete notification (works for both local and backend)
  const deleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.is_read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    
    // ✅ Update localStorage
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    if (user?.id) {
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updatedNotifications));
    }
  };

  // Play notification sound
  const playNotificationSound = () => {        
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);       
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  };

  // ✅ FIXED: Better useEffect with proper authentication checks
  useEffect(() => {
    if (isAuthenticated()) {
      // ✅ Load from localStorage first for instant display
      const cached = localStorage.getItem(`notifications_${user.id}`);
      if (cached) {
        try {
          const cachedNotifications = JSON.parse(cached);
          setNotifications(cachedNotifications);
          setUnreadCount(cachedNotifications.filter(n => !n.is_read).length);
        } catch (error) {
          console.error('Failed to parse cached notifications:', error);
        }
      }
      
      // Then load from backend
      loadNotifications();
      
      // Poll for new notifications every 2 minutes (only if authenticated)
      const interval = setInterval(() => {
        if (isAuthenticated()) {
          loadNotifications();
        }
      }, 120000);

      return () => clearInterval(interval);
    } else {
      // ✅ Clear everything when not authenticated
      console.log("User not authenticated, clearing notification state");
      setNotifications([]);
      setUnreadCount(0);
      setError(null);
      setLoading(false);
    }
  }, [user]); // ✅ Only depend on user, not authentication tokens

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    playNotificationSound,
    // Ecommerce-specific notification creators
    createOrderNotification,
    createCartReminder,
    createPromoNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};