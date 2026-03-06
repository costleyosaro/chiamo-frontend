// src/context/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import API from "../services/api";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

// ✅ Map frontend types → backend types
const mapTypeToBackend = (type) => {
  const typeMap = {
    order_placed: "order",
    order_confirmed: "order",
    order_shipped: "delivery",
    order_delivered: "delivery",
    order_cancelled: "order",
    payment_success: "payment",
    payment_failed: "payment",
    cart_reminder: "system",
    promotion: "promo",
    support_update: "support",
  };
  return typeMap[type] || type || "system";
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAuthenticated = useCallback(() => {
    const accessToken = localStorage.getItem("access");
    const refreshToken = localStorage.getItem("refresh");
    return !!(user && (accessToken || refreshToken));
  }, [user]);

  // ============ LOAD NOTIFICATIONS FROM BACKEND ============
  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated()) {
      setNotifications([]);
      setUnreadCount(0);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await API.get("/orders/notifications/");
      let data = response.data;
      let items = [];

      if (Array.isArray(data)) {
        items = data;
      } else if (data && Array.isArray(data.results)) {
        items = data.results;
      } else {
        items = [];
      }

      setNotifications(items);
      setUnreadCount(items.filter((n) => !n.is_read).length);

      // Cache locally
      if (user?.id) {
        localStorage.setItem(
          `notifications_${user.id}`,
          JSON.stringify(items)
        );
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);

      if (err.response?.status === 401) {
        setNotifications([]);
        setUnreadCount(0);
        setError(null);
        return;
      }

      // Fallback to cache
      if (user?.id) {
        const cached = localStorage.getItem(`notifications_${user.id}`);
        if (cached) {
          try {
            const cachedItems = JSON.parse(cached);
            setNotifications(cachedItems);
            setUnreadCount(cachedItems.filter((n) => !n.is_read).length);
          } catch {
            setNotifications([]);
            setUnreadCount(0);
          }
        }
      }

      if (err.response?.status === 404) {
        setError("Notifications not available yet");
      } else if (err.code === "ERR_NETWORK") {
        setError("Network error — check your connection");
      } else if (err.response?.status !== 401) {
        setError("Failed to load notifications");
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // ============ ✅ ADD NOTIFICATION (used by Cart.jsx) ============
  const addNotification = useCallback(
    async (notificationData) => {
      if (!isAuthenticated()) return;

      // Map type for backend compatibility
      const backendType = mapTypeToBackend(notificationData.type);

      // 1) Instantly show locally
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const localNotif = {
        ...notificationData,
        id: tempId,
        type: backendType,
        is_read: false,
        created_at: notificationData.created_at || new Date().toISOString(),
      };

      setNotifications((prev) => [localNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // 2) POST to backend to persist in database
      try {
        const payload = {
          title: notificationData.title,
          message: notificationData.message,
          type: backendType,
          order_id: notificationData.order_id
            ? String(notificationData.order_id)
            : null,
        };

        const response = await API.post("/orders/notifications/", payload);

        // Replace temp notification with real one from backend
        if (response.data && response.data.id) {
          setNotifications((prev) =>
            prev.map((n) => (n.id === tempId ? response.data : n))
          );
        }

        console.log("✅ Notification saved to database:", response.data);
      } catch (err) {
        console.warn(
          "⚠️ Failed to save notification to backend (kept locally):",
          err
        );
        // Keep the local notification even if backend fails
      }

      // Update cache
      if (user?.id) {
        setNotifications((current) => {
          localStorage.setItem(
            `notifications_${user.id}`,
            JSON.stringify(current)
          );
          return current;
        });
      }
    },
    [isAuthenticated, user]
  );

  // ============ CREATE ORDER NOTIFICATION ============
  const createOrderNotification = useCallback(
    async (orderId, event = "placed", orderTotal = null) => {
      if (!isAuthenticated()) return;

      const messages = {
        placed: {
          title: "Order Placed Successfully! 🎉",
          message: `Your order #${orderId}${
            orderTotal
              ? ` for ₦${Number(orderTotal).toLocaleString()}`
              : ""
          } has been placed and is being processed.`,
          type: "order",
        },
        confirmed: {
          title: "Order Confirmed! ✅",
          message: `Your order #${orderId} has been confirmed and is being prepared.`,
          type: "order",
        },
        shipped: {
          title: "Order Shipped! 🚚",
          message: `Good news! Your order #${orderId} is on the way to you.`,
          type: "delivery",
        },
        delivered: {
          title: "Order Delivered! 📦",
          message: `Your order #${orderId} has been delivered successfully.`,
          type: "delivery",
        },
        cancelled: {
          title: "Order Cancelled ❌",
          message: `Your order #${orderId} has been cancelled.`,
          type: "order",
        },
      };

      const data = messages[event] || messages.placed;

      await addNotification({
        ...data,
        order_id: orderId,
      });

      playNotificationSound();
    },
    [isAuthenticated, addNotification]
  );

  // ============ CREATE CART REMINDER ============
  const createCartReminder = useCallback(
    async (itemCount) => {
      if (!isAuthenticated()) return;

      await addNotification({
        title: "Items in your cart! 🛒",
        message: `You have ${itemCount} item${
          itemCount > 1 ? "s" : ""
        } waiting in your cart. Complete your order now!`,
        type: "system",
      });
    },
    [isAuthenticated, addNotification]
  );

  // ============ CREATE PROMO NOTIFICATION ============
  const createPromoNotification = useCallback(
    async (title, message) => {
      if (!isAuthenticated()) return;

      await addNotification({
        title,
        message,
        type: "promo",
      });
    },
    [isAuthenticated, addNotification]
  );

  // ============ MARK AS READ ============
  const markAsRead = useCallback(
    async (notificationId) => {
      if (!isAuthenticated() || !notificationId) return;

      // Update locally first
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Sync with backend (only for real DB IDs, not temp_ IDs)
      if (typeof notificationId === "number") {
        try {
          await API.patch(
            `/orders/notifications/${notificationId}/mark_read/`
          );
        } catch (err) {
          console.error("Failed to mark as read on backend:", err);
        }
      }

      // Update cache
      if (user?.id) {
        setNotifications((current) => {
          localStorage.setItem(
            `notifications_${user.id}`,
            JSON.stringify(current)
          );
          return current;
        });
      }
    },
    [isAuthenticated, user]
  );

  // ============ MARK ALL AS READ ============
  const markAllAsRead = useCallback(async () => {
    if (!isAuthenticated()) return;

    // Update locally
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true }))
    );
    setUnreadCount(0);

    // Sync with backend — single endpoint
    try {
      await API.post("/orders/notifications/mark-all-read/");
    } catch (err) {
      console.error("Failed to mark all as read on backend:", err);
    }

    // Update cache
    if (user?.id) {
      setNotifications((current) => {
        localStorage.setItem(
          `notifications_${user.id}`,
          JSON.stringify(current)
        );
        return current;
      });
    }
  }, [isAuthenticated, user]);

  // ============ DELETE NOTIFICATION ============
  const deleteNotification = useCallback(
    async (notificationId) => {
      if (!notificationId) return;

      // Check if unread before removing
      const notif = notifications.find((n) => n.id === notificationId);
      if (notif && !notif.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      // Remove locally
      setNotifications((prev) =>
        prev.filter((n) => n.id !== notificationId)
      );

      // Delete from backend (only for real DB IDs)
      if (typeof notificationId === "number") {
        try {
          await API.delete(
            `/orders/notifications/${notificationId}/delete/`
          );
        } catch (err) {
          console.error("Failed to delete on backend:", err);
        }
      }

      // Update cache
      if (user?.id) {
        setNotifications((current) => {
          localStorage.setItem(
            `notifications_${user.id}`,
            JSON.stringify(current)
          );
          return current;
        });
      }
    },
    [isAuthenticated, notifications, user]
  );

  // ============ DELETE ALL NOTIFICATIONS ============
  const deleteAllNotifications = useCallback(async () => {
    if (!isAuthenticated()) return;

    setNotifications([]);
    setUnreadCount(0);

    try {
      await API.delete("/orders/notifications/delete-all/");
    } catch (err) {
      console.error("Failed to delete all on backend:", err);
    }

    if (user?.id) {
      localStorage.removeItem(`notifications_${user.id}`);
    }
  }, [isAuthenticated, user]);

  // ============ PLAY SOUND ============
  const playNotificationSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(800, ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.01,
        ctx.currentTime + 0.4
      );

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch (err) {
      console.warn("Could not play notification sound:", err);
    }
  }, []);

  // ============ LOAD ON MOUNT + POLL ============
  useEffect(() => {
    if (isAuthenticated()) {
      // Load from cache first for instant display
      const cached = localStorage.getItem(`notifications_${user.id}`);
      if (cached) {
        try {
          const cachedItems = JSON.parse(cached);
          setNotifications(cachedItems);
          setUnreadCount(cachedItems.filter((n) => !n.is_read).length);
        } catch {
          // ignore parse errors
        }
      }

      // Then load from backend
      loadNotifications();

      // Poll every 2 minutes
      const interval = setInterval(() => {
        if (isAuthenticated()) {
          loadNotifications();
        }
      }, 120000);

      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setError(null);
      setLoading(false);
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const value = {
    notifications,
    unreadCount,
    loading,
    error,

    // ✅ Core functions
    loadNotifications,
    addNotification, // ← Cart.jsx uses this
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    playNotificationSound,

    // ✅ Higher-level helpers
    createOrderNotification,
    createCartReminder,
    createPromoNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};