// src/pages/Notifications.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";
import {
  FiBell,
  FiPackage,
  FiShoppingCart,
  FiTruck,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiGift,
  FiInfo,
  FiChevronLeft,
  FiTrash2,
  FiCheck,
} from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi";
import "./Notifications.css";

// ─── Notification Icon ───────────────────────────────────────────────────────
const getNotificationIcon = (type) => {
  const icons = {
    order:    { icon: <FiShoppingCart />, cls: "order"    },
    delivery: { icon: <FiTruck />,        cls: "delivery" },
    payment:  { icon: <FiCheckCircle />,  cls: "payment"  },
    support:  { icon: <FiAlertCircle />,  cls: "support"  },
    promo:    { icon: <FiGift />,         cls: "promo"    },
  };
  const match = icons[type] || { icon: <FiBell />, cls: "default" };
  return (
    <span className={`notif-icon-inner ${match.cls}`}>
      {match.icon}
    </span>
  );
};

// ─── Time Formatter ──────────────────────────────────────────────────────────
const formatTime = (timestamp) => {
  const diff = Math.floor((new Date() - new Date(timestamp)) / 60000);
  if (diff < 1)  return "Just now";
  if (diff < 60) return `${diff}m ago`;
  const h = Math.floor(diff / 60);
  if (h < 24)    return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)     return `${d}d ago`;
  return new Date(timestamp).toLocaleDateString();
};

// ─── Extract Order ID ────────────────────────────────────────────────────────
const extractOrderId = (message) => {
  const match = message?.match(/#(\d+)/);
  return match ? match[1] : null;
};

// ─── Type Label ─────────────────────────────────────────────────────────────
const typeLabel = {
  order:    "Order",
  delivery: "Delivery",
  payment:  "Payment",
  support:  "Support",
  promo:    "Promo",
  system:   "System",
};

// ─── Notification Card ───────────────────────────────────────────────────────
const NotificationCard = ({ notification, onMarkAsRead, onDelete }) => {
  const [removing, setRemoving] = useState(false);
  const navigate = useNavigate();

  const handleDelete = (e) => {
    e.stopPropagation();
    setRemoving(true);
    setTimeout(() => onDelete(notification.id), 350);
  };

  const handleRead = (e) => {
    e?.stopPropagation();
    if (!notification.is_read) onMarkAsRead(notification.id);
  };

  const handleCardClick = () => {
    handleRead();
    const orderId =
      notification.order_id || extractOrderId(notification.message);
    if (orderId && ["order", "delivery"].includes(notification.type))
      navigate(`/orders?highlight=${orderId}`);
    else if (notification.type === "promo") navigate("/all-products");
    else if (notification.type === "support") navigate("/support");
  };

  const isClickable = ["order", "delivery", "promo", "support"].includes(
    notification.type
  );

  return (
    <div
      className={`nc ${!notification.is_read ? "nc--unread" : ""} ${
        removing ? "nc--removing" : ""
      } ${isClickable ? "nc--clickable" : ""}`}
      onClick={isClickable ? handleCardClick : handleRead}
    >
      {/* Unread indicator bar */}
      {!notification.is_read && <div className="nc__bar" />}

      {/* Icon */}
      <div className="nc__icon-wrap">
        {getNotificationIcon(notification.type)}
        {!notification.is_read && <span className="nc__dot" />}
      </div>

      {/* Body */}
      <div className="nc__body">
        {/* Top row */}
        <div className="nc__top">
          <span className={`nc__tag nc__tag--${notification.type || "system"}`}>
            {typeLabel[notification.type] || "System"}
          </span>
          <span className="nc__time">
            <FiClock size={11} />
            {formatTime(notification.created_at)}
          </span>
        </div>

        {/* Title */}
        <h3 className="nc__title">{notification.title}</h3>

        {/* Message */}
        <p className="nc__message">{notification.message}</p>

        {/* Order chip */}
        {["order", "delivery"].includes(notification.type) && (
          <div className="nc__chip nc__chip--order">
            <FiPackage size={13} />
            <span>
              Order #
              {notification.order_id ||
                extractOrderId(notification.message)}
            </span>
            {isClickable && (
              <span className="nc__chip-cta">View →</span>
            )}
          </div>
        )}

        {/* Promo chip */}
        {notification.type === "promo" && (
          <div className="nc__chip nc__chip--promo">
            <FiGift size={13} />
            <span>Shop the offer →</span>
          </div>
        )}

        {/* Support chip */}
        {notification.type === "support" && (
          <div className="nc__chip nc__chip--support">
            <FiInfo size={13} />
            <span>Go to support →</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="nc__actions" onClick={(e) => e.stopPropagation()}>
        {!notification.is_read && (
          <button
            className="nc__btn nc__btn--read"
            onClick={handleRead}
            title="Mark as read"
          >
            <FiCheck size={15} />
          </button>
        )}
        <button
          className="nc__btn nc__btn--delete"
          onClick={handleDelete}
          title="Delete"
        >
          <FiTrash2 size={15} />
        </button>
      </div>
    </div>
  );
};

// ─── Empty State ─────────────────────────────────────────────────────────────
const EmptyState = ({ filter }) => (
  <div className="notif-empty">
    <div className="notif-empty__icon-wrap">
      <FiBell size={36} />
      <HiOutlineSparkles className="notif-empty__sparkle" />
    </div>
    <h3 className="notif-empty__title">
      {filter === "unread" ? "All caught up!" : "No notifications yet"}
    </h3>
    <p className="notif-empty__text">
      {filter === "unread"
        ? "You have no unread notifications right now"
        : "Order updates and important messages will appear here"}
    </p>
  </div>
);

// ─── Skeleton ────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="notif-skeleton">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="ns">
        <div className="ns__icon" />
        <div className="ns__body">
          <div className="ns__line ns__line--short" />
          <div className="ns__line ns__line--long" />
          <div className="ns__line ns__line--medium" />
        </div>
      </div>
    ))}
  </div>
);

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function Notifications() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");

  const {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadNotifications,
  } = useNotifications();

  const unread = notifications.filter((n) => !n.is_read).length;
  const read   = notifications.length - unread;

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    if (filter === "read")   return n.is_read;
    return true;
  });

  const handleClearAll = () => {
    if (window.confirm("Delete all notifications?"))
      notifications.forEach((n) => deleteNotification(n.id));
  };

  // ── Header (shared) ──────────────────────────────────────────────────────
  const Header = () => (
    <div className="notif-header">
      <button className="notif-header__back" onClick={() => navigate(-1)}>
        <FiChevronLeft size={22} />
      </button>

      <div className="notif-header__center">
        <h1 className="notif-header__title">Notifications</h1>
        {unread > 0 && (
          <span className="notif-header__badge">{unread}</span>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="notif-header__right">
          <button
            className="notif-header__action notif-header__action--read"
            onClick={markAllAsRead}
            disabled={unread === 0}
            title="Mark all read"
          >
            <FiCheck size={14} />
            <span>Read all</span>
          </button>
          <button
            className="notif-header__action notif-header__action--clear"
            onClick={handleClearAll}
            title="Clear all"
          >
            <FiTrash2 size={14} />
            <span>Clear</span>
          </button>
        </div>
      )}
    </div>
  );

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading)
    return (
      <div className="notifications-page">
        <Header />
        <Skeleton />
      </div>
    );

  // ── Error ────────────────────────────────────────────────────────────────
  if (error)
    return (
      <div className="notifications-page">
        <Header />
        <div className="notif-error">
          <FiAlertCircle size={52} />
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button onClick={loadNotifications}>Try Again</button>
        </div>
      </div>
    );

  // ── Main ─────────────────────────────────────────────────────────────────
  return (
    <div className="notifications-page">
      <Header />

      {/* Summary strip */}
      {notifications.length > 0 && (
        <div className="notif-summary">
          <span className="notif-summary__text">
            {unread > 0 ? (
              <>
                <strong>{unread}</strong> unread of{" "}
                <strong>{notifications.length}</strong> notifications
              </>
            ) : (
              <>All <strong>{notifications.length}</strong> notifications read</>
            )}
          </span>
        </div>
      )}

      {/* Filter pills */}
      {notifications.length > 0 && (
        <div className="notif-pills">
          {[
            { key: "all",    label: "All",    count: notifications.length },
            { key: "unread", label: "Unread", count: unread },
            { key: "read",   label: "Read",   count: read   },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              className={`notif-pill ${filter === key ? "notif-pill--active" : ""}`}
              onClick={() => setFilter(key)}
            >
              {label}
              <span className="notif-pill__count">{count}</span>
            </button>
          ))}
        </div>
      )}

      {/* List */}
      <div className="notif-body">
        {filtered.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <div className="notif-list">
            {filtered.map((n) => (
              <NotificationCard
                key={n.id}
                notification={n}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))}
          </div>
        )}
      </div>

      <div className="notif-spacer" />
    </div>
  );
}