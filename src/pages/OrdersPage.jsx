// src/pages/OrdersPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../services/api";
import PageLoader from "../components/LoadingScreen";
import smartlistAnimation from "../assets/animations/smart-list.json";
import "./Order.css";

// Icons
import {
  FiPackage,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiCheckCircle,
  FiTruck,
  FiBox,
  FiMapPin,
  FiCalendar,
  FiShoppingBag,
  FiRefreshCw,
  FiTrash2,
  FiAlertCircle,
  FiCheck,
  FiX,
  FiMoreVertical,
  FiExternalLink,
} from "react-icons/fi";
import { HiOutlineClipboardCheck, HiOutlineSparkles } from "react-icons/hi";

// ============ CONSTANTS ============
const ORDER_STEPS = [
  { key: "confirmed", label: "Confirmed", icon: FiCheckCircle },
  { key: "processing", label: "Processing", icon: FiBox },
  { key: "shipped", label: "Shipped", icon: FiTruck },
  { key: "out_for_delivery", label: "Out for Delivery", icon: FiMapPin },
  { key: "delivered", label: "Delivered", icon: HiOutlineClipboardCheck },
];

// Map database status to progress number
const STATUS_TO_PROGRESS = {
  'confirmed': 1,
  'order confirmed': 1,
  'pending': 1,
  'processing': 2,
  'shipped': 3,
  'in transit': 3,
  'in_transit': 3,
  'out for delivery': 4,
  'out_for_delivery': 4,
  'delivered': 5,
  'completed': 5,
};

// ============ HELPER FUNCTIONS ============
const formatCurrency = (val) =>
  `₦${Number(val || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getEstimatedDelivery = (createdAt) => {
  const date = new Date(createdAt);
  date.setDate(date.getDate() + 3);
  return formatDate(date);
};

const getStatusColor = (progress) => {
  if (progress >= 5) return "delivered";
  if (progress >= 4) return "delivery";
  if (progress >= 3) return "transit";
  if (progress >= 2) return "processing";
  return "confirmed";
};

/**
 * Get progress number from order status
 * This syncs the database status with the frontend progress tracker
 */
const getProgressFromStatus = (order) => {
  // If order has explicit progress field, use it
  if (order.progress && typeof order.progress === 'number') {
    return order.progress;
  }
  
  // Otherwise, derive from status field
  const status = (order.status || 'confirmed').toLowerCase().trim();
  
  // Check for exact match first
  if (STATUS_TO_PROGRESS[status] !== undefined) {
    return STATUS_TO_PROGRESS[status];
  }
  
  // Check for partial matches
  if (status.includes('deliver') && status.includes('out')) return 4;
  if (status.includes('delivered') || status.includes('complete')) return 5;
  if (status.includes('transit') || status.includes('shipped')) return 3;
  if (status.includes('process')) return 2;
  if (status.includes('confirm') || status.includes('pending')) return 1;
  
  // Default to confirmed
  return 1;
};

/**
 * Get display status label from progress
 */
const getStatusLabel = (progress) => {
  const step = ORDER_STEPS[progress - 1];
  return step ? step.label : "Confirmed";
};

// ============ SUB-COMPONENTS ============

// Header Component
const OrdersHeader = ({ activeTab, onBack }) => (
  <header className="ord-header">
    <button className="ord-back-btn" onClick={onBack} aria-label="Go back">
      <FiChevronLeft />
    </button>
    <div className="ord-header-center">
      <h1 className="ord-title">
        {activeTab === "open" ? "My Orders" : "Order History"}
      </h1>
    </div>
    <div className="ord-header-spacer"></div>
  </header>
);

// Tabs Component
const OrderTabs = ({ activeTab, onTabChange, openCount, closedCount }) => (
  <div className="ord-tabs">
    <button
      className={`ord-tab ${activeTab === "open" ? "active" : ""}`}
      onClick={() => onTabChange("open")}
    >
      <FiPackage />
      <span>Active</span>
      {openCount > 0 && <span className="ord-tab-badge">{openCount}</span>}
    </button>
    <button
      className={`ord-tab ${activeTab === "closed" ? "active" : ""}`}
      onClick={() => onTabChange("closed")}
    >
      <FiCheckCircle />
      <span>Completed</span>
      {closedCount > 0 && <span className="ord-tab-badge">{closedCount}</span>}
    </button>
  </div>
);

// Empty State Component
const EmptyState = ({ type, onAction }) => (
  <div className="ord-empty">
    <div className="ord-empty-icon">
      {type === "open" ? <FiPackage /> : <FiCheckCircle />}
    </div>
    <h2 className="ord-empty-title">
      {type === "open" ? "No Active Orders" : "No Order History"}
    </h2>
    <p className="ord-empty-text">
      {type === "open"
        ? "You don't have any active orders. Start shopping to place your first order!"
        : "Your completed orders will appear here."}
    </p>
    {type === "open" && (
      <button className="ord-empty-btn" onClick={onAction}>
        <FiShoppingBag />
        Start Shopping
      </button>
    )}
  </div>
);

// Progress Timeline Component
const ProgressTimeline = ({ progress }) => {
  const currentStep = progress || 1;

  return (
    <div className="ord-timeline">
      {ORDER_STEPS.map((step, idx) => {
        const stepNum = idx + 1;
        const isCompleted = stepNum <= currentStep;
        const isCurrent = stepNum === currentStep;
        const isLast = idx === ORDER_STEPS.length - 1;
        const StepIcon = step.icon;

        return (
          <div
            key={step.key}
            className={`ord-timeline-step ${isCompleted ? "completed" : ""} ${isCurrent ? "current" : ""}`}
          >
            <div className="ord-timeline-icon">
              {isCompleted ? <FiCheck /> : <StepIcon />}
            </div>
            <span className="ord-timeline-label">{step.label}</span>
            {!isLast && <div className={`ord-timeline-line ${isCompleted ? "completed" : ""}`} />}
          </div>
        );
      })}
    </div>
  );
};

// Order Card Component
const OrderCard = ({
  order,
  isNew,
  activeTab,
  onConfirm,
  onDelete,
  onReorder,
  onView,
}) => {
  const [showActions, setShowActions] = useState(false);
  const navigate = useNavigate();
  
  const totalAmount =
    order.items?.reduce(
      (sum, it) => sum + Number(it.price) * (it.quantity || 1),
      0
    ) || order.total || 0;

  const itemCount = order.items?.length || 0;
  
  // ✅ Get progress from database status
  const progress = getProgressFromStatus(order);
  const statusClass = getStatusColor(progress);
  const currentStatus = getStatusLabel(progress);
  
  const sourceLabel =
    order.source === "cart"
      ? "Cart"
      : order.source === "smartlist"
      ? "Smart List"
      : "Direct";

  return (
    <div 
      className={`ord-card ${isNew ? "new-order" : ""}`}
      data-order-id={order.order_id || order.id}
    >
      {/* New Order Badge */}
      {isNew && (
        <div className="ord-new-badge">
          <HiOutlineSparkles />
          New Order
        </div>
      )}

      {/* Card Header */}
      <div className="ord-card-header">
        <div className="ord-card-info">
          <div className="ord-card-id-row">
            <span className="ord-card-id">{order.order_id || "—"}</span>
            <span className={`ord-status-badge ${statusClass}`}>
              {currentStatus}
            </span>
          </div>
          <div className="ord-card-meta">
            <span className="ord-card-date">
              <FiCalendar />
              {formatDate(order.created_at || order.createdAt)}
            </span>
            <span className="ord-card-time">
              <FiClock />
              {formatTime(order.created_at || order.createdAt)}
            </span>
          </div>
        </div>
        <button
          className="ord-card-menu"
          onClick={() => setShowActions(!showActions)}
        >
          <FiMoreVertical />
        </button>

        {/* Dropdown Actions */}
        {showActions && (
          <>
            <div className="ord-menu-overlay" onClick={() => setShowActions(false)} />
            <div className="ord-dropdown">
              <button className="ord-dropdown-item" onClick={() => { onView(order); setShowActions(false); }}>
                <FiExternalLink />
                View Details
              </button>
              {activeTab === "closed" && (
                <button className="ord-dropdown-item" onClick={() => { onReorder(order); setShowActions(false); }}>
                  <FiRefreshCw />
                  Reorder
                </button>
              )}
              <button
                className="ord-dropdown-item danger"
                onClick={() => { onDelete(order.id); setShowActions(false); }}
              >
                <FiTrash2 />
                Delete Order
              </button>
            </div>
          </>
        )}
      </div>

      {/* Order Summary — clickable to invoice */}
      <div
        className="ord-card-summary ord-card-summary-clickable"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/invoice/${order.id}`, { state: { order } });
        }}
        title="View Invoice"
      >
        <div className="ord-summary-item">
          <FiBox className="ord-summary-icon" />
          <div className="ord-summary-content">
            <span className="ord-summary-label">Items</span>
            <span className="ord-summary-value ord-invoice-link">
              {itemCount} items
              <FiExternalLink className="ord-invoice-icon" />
            </span>
          </div>
        </div>
        <div className="ord-summary-divider" />
        <div className="ord-summary-item">
          <span className="ord-summary-label">Total</span>
          <span className="ord-summary-amount">{formatCurrency(totalAmount)}</span>
        </div>
      </div>

      {/* Source Badge */}
      <div className="ord-card-source">
        <span className="ord-source-badge">{sourceLabel}</span>
        {activeTab === "open" && (
          <div className="ord-delivery-estimate">
            <FiTruck />
            <span>Est. {getEstimatedDelivery(order.created_at || order.createdAt)}</span>
          </div>
        )}
      </div>

      {/* Progress Timeline (for open orders) */}
      {activeTab === "open" && (
        <div className="ord-card-progress">
          <ProgressTimeline progress={progress} />
        </div>
      )}

      {/* Actions */}
      <div className="ord-card-actions">
        {activeTab === "open" ? (
          <>
            <button className="ord-action-btn secondary" onClick={() => onView(order)}>
              <FiExternalLink />
              Track Order
            </button>
            <button
              className="ord-action-btn primary"
              onClick={() => onConfirm(order.id)}
              disabled={progress < 4}
            >
              <FiCheckCircle />
              Confirm Delivery
            </button>
          </>
        ) : (
          <>
            <button className="ord-action-btn secondary" onClick={() => onView(order)}>
              <FiExternalLink />
              View Details
            </button>
            <button className="ord-action-btn primary" onClick={() => onReorder(order)}>
              <FiRefreshCw />
              Reorder
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, orderId }) => {
  if (!isOpen) return null;

  return (
    <div className="ord-modal-overlay" onClick={onClose}>
      <div className="ord-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ord-modal-icon warning">
          <FiAlertCircle />
        </div>
        <h3 className="ord-modal-title">Delete Order?</h3>
        <p className="ord-modal-text">
          Are you sure you want to delete order #{orderId}? This action cannot be undone.
        </p>
        <div className="ord-modal-actions">
          <button className="ord-modal-btn cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="ord-modal-btn delete" onClick={onConfirm}>
            <FiTrash2 />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ============ MAIN COMPONENT ============
export default function OrdersPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [orders, setOrders] = useState([]);
  const [closedOrders, setClosedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("open");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [highlightedNewOrders, setHighlightedNewOrders] = useState(new Set());

  const newOrderIdFromNav = location?.state?.newOrderId || null;

  // Highlight new order temporarily
  useEffect(() => {
    if (newOrderIdFromNav) {
      setHighlightedNewOrders(new Set([newOrderIdFromNav]));
      const timer = setTimeout(() => setHighlightedNewOrders(new Set()), 8000);
      return () => clearTimeout(timer);
    }
  }, [newOrderIdFromNav]);

  // Check for highlight parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const highlightOrderId = urlParams.get('highlight');
    
    if (highlightOrderId) {
      setTimeout(() => {
        const orderElement = document.querySelector(`[data-order-id="${highlightOrderId}"]`);
        if (orderElement) {
          orderElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          orderElement.classList.add('order-highlighted');
          
          setTimeout(() => {
            orderElement.classList.remove('order-highlighted');
          }, 3000);
        }
      }, 500);
    }
  }, [orders]);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await API.get("orders/user-orders/");
        let data = res.data ?? [];
        if (!Array.isArray(data) && Array.isArray(data.results)) {
          data = data.results;
        }

        // Sort by date (newest first)
        data.sort(
          (a, b) =>
            new Date(b.created_at || b.createdAt || 0) -
            new Date(a.created_at || a.createdAt || 0)
        );

        // ✅ Use status from database to determine if order is open or closed
        const open = data.filter((o) => {
          const status = (o.status || "").toLowerCase().trim();
          return status !== "delivered" && status !== "completed";
        });
        
        const closed = data.filter((o) => {
          const status = (o.status || "").toLowerCase().trim();
          return status === "delivered" || status === "completed";
        });

        setOrders(open);
        setClosedOrders(closed);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError("Failed to load your orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Handle Confirm Order
  const handleConfirmOrder = async (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const progress = getProgressFromStatus(order);

    toast.dismiss();

    if (progress < 4) {
      const messages = {
        1: "Order just confirmed! Please wait until it's out for delivery.",
        2: "Order is being processed. Please wait.",
        3: "Order is in transit. Almost there!",
      };
      toast(messages[progress] || "Please wait for delivery.", {
        icon: "⏳",
      });
      return;
    }

    if (progress === 4) {
      try {
        const updated = await API.patch(`orders/user-orders/${orderId}/`, {
          status: "delivered",
        });

        toast.success("Order confirmed! Thank you for your purchase.", {
          icon: "🎉",
        });

        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        setClosedOrders((prev) => [updated.data, ...prev]);
      } catch (error) {
        console.error("Error confirming delivery:", error);
        toast.error("Something went wrong. Please try again.");
      }
      return;
    }

    if (progress >= 5) {
      toast("Order already delivered!", { icon: "✅" });
    }
  };

  // Handle Delete Order
  const handleDeleteOrder = (orderId) => {
    const order = orders.find((o) => o.id === orderId) || 
                  closedOrders.find((o) => o.id === orderId);
    setDeleteConfirm(order);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    const orderId = deleteConfirm.id;
    const isOpen = orders.some((o) => o.id === orderId);

    try {
      await API.delete(`orders/user-orders/${orderId}/`);
      
      if (isOpen) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      } else {
        setClosedOrders((prev) => prev.filter((o) => o.id !== orderId));
      }
      
      toast.success("Order deleted successfully");
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete order:", err);
      toast.error("Could not delete order. Please try again.");
    }
  };

  // Handle Reorder
  const handleReorder = async (order) => {
    const newOrderPayload = {
      ...order,
      id: undefined,
      order_id: `RE-${Math.floor(Math.random() * 1000000)}`,
      status: "confirmed",
      created_at: new Date().toISOString(),
    };

    try {
      const res = await API.post("orders/user-orders/", newOrderPayload);
      const newOrder = res.data;

      setOrders((prev) => [newOrder, ...prev]);
      setActiveTab("open");

      toast.success("Order placed successfully!", { icon: "🛒" });
    } catch (err) {
      console.error("Error reordering:", err);
      toast.error("Could not reorder. Please try again.");
    }
  };

  // Handle View Order
  const handleViewOrder = (order) => {
    navigate(`/order-history/${order.id}`);
  };

  // Loading State
  if (loading) {
    return (
      <PageLoader
        animation={smartlistAnimation}
        message="Loading your orders..."
        size={260}
      />
    );
  }

  // Error State
  if (error) {
    return (
      <div className="ord-error">
        <FiAlertCircle className="ord-error-icon" />
        <h3>Oops! Something went wrong</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  const displayedOrders = activeTab === "open" ? orders : closedOrders;

  return (
    <div className="ord-page">
      {/* Header */}
      <OrdersHeader activeTab={activeTab} onBack={() => navigate(-1)} />

      {/* Tabs */}
      <OrderTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        openCount={orders.length}
        closedCount={closedOrders.length}
      />

      {/* Content */}
      <div className="ord-content">
        {displayedOrders.length === 0 ? (
          <EmptyState
            type={activeTab}
            onAction={() => navigate("/all-products")}
          />
        ) : (
          <div className="ord-list">
            {displayedOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                isNew={highlightedNewOrders.has(order.order_id || order.id)}
                activeTab={activeTab}
                onConfirm={handleConfirmOrder}
                onDelete={handleDeleteOrder}
                onReorder={handleReorder}
                onView={handleViewOrder}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        orderId={deleteConfirm?.order_id || ""}
      />

      {/* Bottom Spacer */}
      <div className="ord-bottom-spacer"></div>
    </div>
  );
}