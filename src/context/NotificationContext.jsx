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

  // Load notifications with comprehensive error handling
  const loadNotifications = async () => {      
    // Don't try to load notifications if user is not logged in
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
      
      // ✅ FIXED: Comprehensive data validation
      let notificationData = response.data;
      
      // Handle different response formats
      if (Array.isArray(notificationData)) {
        setNotifications(notificationData);
        setUnreadCount(notificationData.filter(n => !n.is_read).length);
      } else if (notificationData && Array.isArray(notificationData.results)) {
        setNotifications(notificationData.results);
        setUnreadCount(notificationData.results.filter(n => !n.is_read).length);
      } else if (notificationData && typeof notificationData === 'object') {
        // If it's an object but not an array, wrap it
        const notifications = [notificationData];
        setNotifications(notifications);
        setUnreadCount(notifications.filter(n => !n.is_read).length);
      } else {
        console.warn('Unexpected notification data format:', notificationData);
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      
      // Handle different error types
      if (error.response?.status === 401) {
        console.warn('User not authenticated for notifications');
        setError('Please log in to view notifications');
      } else if (error.response?.status === 404) {
        console.warn('Notifications endpoint not found');
        setError('Notifications feature not available yet');
      } else if (error.code === 'ECONNABORTED') {
        setError('Request timeout - please try again');
      } else if (error.code === 'ERR_NETWORK') {
        setError('Network error - please check your connection');
      } else {
        setError('Failed to load notifications');
      }
      
      // Always set to empty array on error to prevent crashes
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Add new notification
  const addNotification = (notification) => {
    if (!notification || typeof notification !== 'object') {
      console.warn('Invalid notification data:', notification);
      return;
    }

    setNotifications(prev => [notification, ...prev]);
    if (!notification.is_read) {
      setUnreadCount(prev => prev + 1);        
    }
    
    // Play notification sound
    playNotificationSound();
  };

  // Mark as read
  const markAsRead = async (notificationId) => {
    if (!user || !notificationId) return;
    
    try {
      await API.patch(`/orders/notifications/${notificationId}/`, { is_read: true });
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Don't throw error, just log it
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

  // Poll for new notifications only when user is logged in
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setError(null);
      return;
    }

    // Load notifications immediately
    loadNotifications();

    // Set up polling interval - reduced frequency to reduce server load
    const interval = setInterval(() => {
      if (user) { // Double check user is still logged in
        loadNotifications();
      }
    }, 60000); // ✅ Check every 60 seconds instead of 30

    return () => clearInterval(interval);      
  }, [user]); // Only depend on user, not the function

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    addNotification,
    markAsRead,
    loadNotifications,
    playNotificationSound
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};