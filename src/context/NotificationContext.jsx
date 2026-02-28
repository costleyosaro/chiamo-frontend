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

  // Load notifications from Django backend
  const loadNotifications = async () => {      
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await API.get('/orders/notifications/');
      
      // Handle Django response format
      let notificationData = response.data;
      
      if (Array.isArray(notificationData)) {
        setNotifications(notificationData);
        setUnreadCount(notificationData.filter(n => !n.is_read).length);
      } else {
        console.warn('Unexpected notification data format:', notificationData);
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      
      // Handle different error types
      if (error.response?.status === 401) {
        setError('Please log in to view notifications');
      } else if (error.response?.status === 404) {
        setError('Notifications feature not available yet');
      } else if (error.code === 'ECONNABORTED') {
        setError('Request timeout - please try again');
      } else if (error.code === 'ERR_NETWORK') {
        setError('Network error - please check your connection');
      } else {
        setError('Failed to load notifications');
      }
      
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Create notification for order events (called from order context)
  const createOrderNotification = async (orderId, event = 'placed', orderTotal = null) => {
    if (!user) return;

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
    
    // Add to local state immediately for instant UI feedback
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

    // The Django backend will create the actual notification
    // when the order is created, so we'll refresh to get the real one
    setTimeout(() => {
      loadNotifications();
    }, 2000);
  };

  // Create cart reminder notification
  const createCartReminder = (itemCount) => {
    if (!user) return;

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
  };

  // Create promotional notification
  const createPromoNotification = (title, message) => {
    if (!user) return;

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
  };

  // Mark as read using Django endpoint
  const markAsRead = async (notificationId) => {
    if (!user || !notificationId) return;
    
    try {
      await API.patch(`/orders/notifications/${notificationId}/mark_read/`);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!user) return;

    try {
      // Mark all unread notifications as read
      const unreadNotifications = notifications.filter(n => !n.is_read);
      
      for (const notification of unreadNotifications) {
        if (typeof notification.id === 'number') { // Only mark real notifications, not temp ones
          await API.patch(`/orders/notifications/${notification.id}/mark_read/`);
        }
      }

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // Delete notification (local only for temp notifications)
  const deleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.is_read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Auto-cleanup old local notifications (keep only last 50)
  const cleanupOldNotifications = () => {
    setNotifications(prev => {
      const sorted = prev.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return sorted.slice(0, 50);
    });
  };

  // Play notification sound
  const playNotificationSound = () => {        
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Create a pleasant notification sound  
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

  // Load notifications when user changes
  useEffect(() => {
    if (user) {
      loadNotifications();
      
      // Poll for new notifications every 2 minutes
      const interval = setInterval(() => {
        if (user) {
          loadNotifications();
        }
      }, 120000);

      // Cleanup old notifications every 10 minutes
      const cleanupInterval = setInterval(cleanupOldNotifications, 600000);

      return () => {
        clearInterval(interval);
        clearInterval(cleanupInterval);
      };
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setError(null);
    }
  }, [user]);

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