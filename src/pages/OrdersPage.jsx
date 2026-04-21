// src/pages/OrdersPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import PageLoader from "../components/LoadingScreen";
import smartlistAnimation from "../assets/animations/smart-list.json";
import "./Order.css";

// Icons
import {
  FiPackage,
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
  FiExternalLink,
} from "react-icons/fi";
import { HiOutlineClipboardCheck, HiOutlineSparkles } from "react-icons/hi";

// ============ CONSTANTS ============
const ORDER_STEPS = [
  { key: "pending", label: "Confirmed", icon: FiCheckCircle },
  { key: "processing", label: "Processing", icon: FiBox },
  { key: "shipped", label: "Shipped", icon: FiTruck },
  { key: "out_for_delivery", label: "Out for Delivery", icon: FiMapPin },
  { key: "delivered", label: "Delivered", icon: HiOutlineClipboardCheck },
];

// ✅ FIXED: Map database status to progress number
const STATUS_TO_PROGRESS = {
  'pending': 1,
  'confirmed': 1,
  'processing': 2,
  'shipped': 3,
  'out_for_delivery': 4,
  'out for delivery': 4,
  'delivered': 5,
  'completed': 5,
  'cancelled': 0,
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
 * ✅ FIXED: Get progress number from order status
 */
const getProgressFromStatus = (order) => {
  const status = (order.status || 'pending').toLowerCase().trim().replace(/-/g, '_');
  
  console.log(`📊 Order ${order.order_id}: status="${order.status}" -> normalized="${status}"`);
  
  if (STATUS_TO_PROGRESS[status] !== undefined) {
    console.log(`   ✅ Matched! Progress = ${STATUS_TO_PROGRESS[status]}`);
    return STATUS_TO_PROGRESS[status];
  }
  
  if (status.includes('deliver') && !status.includes('out')) return 5;
  if (status.includes('out') && status.includes('deliver')) return 4;
  if (status.includes('ship') || status.includes('transit')) return 3;
  if (status.includes('process')) return 2;
  
  console.log(`   ⚠️ No match, defaulting to 1`);
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

// ✅ Header Component - SIMPLE BACK ARROW
const OrdersHeader = ({ activeTab, onBack, onRefresh, isRefreshing }) => (
  <header className="ord-header">
    <button className="ord-back-btn" onClick={onBack} aria-label="Go back">
      <span className="ord-back-arrow">‹</span>
    </button>
    <div className="ord-header-center">
      <h1 className="ord-title">
        {activeTab === "open" ? "My Orders" : "Order History"}
      </h1>
    </div>
    <button 
      className={`ord-refresh-btn ${isRefreshing ? 'spinning' : ''}`} 
      onClick={onRefresh}
      disabled={isRefreshing}
      aria-label="Refresh orders"
      title="Refresh orders"
    >
      <FiRefreshCw />
    </button>
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

// ✅ Order Card Component - FIXED DROPDOWN & BADGES
const OrderCard = ({
  order,
  isNew,
  isUpdated,
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
  
  const progress = getProgressFromStatus(order);
  const statusClass = getStatusColor(progress);
  const currentStatus = getStatusLabel(progress);
  
  const canConfirmDelivery = progress === 4;
  
  const getConfirmButtonMessage = () => {
    switch (progress) {
      case 1:
        return "Wait for order to be out for delivery";
      case 2:
        return "Order is being processed";
      case 3:
        return "Order is in transit";
      case 4:
        return "Confirm that you received your order";
      case 5:
        return "Order already delivered";
      default:
        return "Not available yet";
    }
  };
  
  const sourceLabel =
    order.source === "cart"
      ? "Cart"
      : order.source === "smartlist"
      ? "Smart List"
      : "Direct";

  // ✅ Check if this is a reordered item
  const isReordered = order.isReordered || order.source === "reorder";

  return (
    <div 
      className={`ord-card ${isNew ? "new-order" : ""} ${isUpdated ? "updated-order" : ""} ${isReordered ? "reordered-order" : ""}`}
      data-order-id={order.order_id || order.id}
    >
      {/* ✅ FIXED: New Order Badge - Separate row, works for both cart and smartlist */}
      {isNew && (
        <div className="ord-badge-row">
          <div className="ord-new-badge">
            <HiOutlineSparkles />
            New Order
          </div>
        </div>
      )}
      
      {/* ✅ Reordered Badge */}
      {isReordered && !isNew && (
        <div className="ord-badge-row">
          <div className="ord-reordered-badge">
            <FiRefreshCw />
            Reordered
          </div>
        </div>
      )}
      
      {/* ✅ Updated Badge */}
      {isUpdated && !isNew && !isReordered && (
        <div className="ord-badge-row">
          <div className="ord-updated-badge">
            <FiRefreshCw />
            Status Updated
          </div>
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

            {/* ✅ See Invoice Button - same line as date & time */}
            <button
              className="ord-see-invoice-btn"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/invoice/${order.id}`, { state: { order } });
              }}
              title="See Invoice"
            >
              <FiExternalLink size={12} />
              <span>Invoice</span>
            </button>
          </div>
        </div>

        {/* ✅ NEW: See Invoice Button + Dropdown side by side */}
        <div className="ord-card-header-right">
          

          {/* Dropdown Menu Button */}
          <button
            className="ord-card-menu-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            aria-label="More options"
          >
            <span className="ord-dropdown-arrow">›</span>
          </button>

          {/* Dropdown Actions */}
          {showActions && (
            <>
              <div
                className="ord-menu-overlay"
                onClick={() => setShowActions(false)}
              />
              <div className="ord-dropdown">
                <button
                  className="ord-dropdown-item"
                  onClick={() => {
                    onView(order);
                    setShowActions(false);
                  }}
                >
                  <FiExternalLink />
                  View Details
                </button>
                {activeTab === "closed" && (
                  <button
                    className="ord-dropdown-item"
                    onClick={() => {
                      onReorder(order);
                      setShowActions(false);
                    }}
                  >
                    <FiRefreshCw />
                    Reorder
                  </button>
                )}
                <button
                  className="ord-dropdown-item danger"
                  onClick={() => {
                    onDelete(order.id);
                    setShowActions(false);
                  }}
                >
                  <FiTrash2 />
                  Delete Order
                </button>
              </div>
            </>
          )}
        </div>
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
        <span className={`ord-source-badge ${order.source === 'smartlist' ? 'smartlist' : ''}`}>
          {sourceLabel}
        </span>
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
            <div className="ord-confirm-btn-wrapper" title={getConfirmButtonMessage()}>
              <button
                className={`ord-action-btn primary ${!canConfirmDelivery ? 'disabled' : ''} ${canConfirmDelivery ? 'ready-to-confirm' : ''}`}
                onClick={() => canConfirmDelivery && onConfirm(order.id)}
                disabled={!canConfirmDelivery}
              >
                {progress >= 5 ? (
                  <>
                    <FiCheck />
                    Delivered
                  </>
                ) : canConfirmDelivery ? (
                  <>
                    <FiCheckCircle />
                    Confirm Delivery
                  </>
                ) : (
                  <>
                    <FiClock />
                    Awaiting Delivery
                  </>
                )}
              </button>
              {!canConfirmDelivery && progress < 5 && (
                <span className="ord-confirm-hint">
                  {progress === 3 ? "Almost there! 🚚" : ""}
                </span>
              )}
            </div>
          </>
        ) : (
          <>
            <button className="ord-action-btn secondary" onClick={() => onView(order)}>
              <FiExternalLink />
              View Details
            </button>
            {/* ✅ FIXED: Reorder button with yellow color (handled in CSS) */}
            <button className="ord-action-btn reorder" onClick={() => onReorder(order)}>
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
  const { user } = useAuth();

  // State
  const [orders, setOrders] = useState([]);
  const [closedOrders, setClosedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("open");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [highlightedNewOrders, setHighlightedNewOrders] = useState(new Set());
  const [recentlyUpdatedOrders, setRecentlyUpdatedOrders] = useState(new Set());
  const [previousStatuses, setPreviousStatuses] = useState({});

  const newOrderIdFromNav = location?.state?.newOrderId || null;

  // ✅ FETCH ORDERS FUNCTION
  const fetchOrders = useCallback(async (options = {}) => {
    const { showToast = false, isBackground = false } = options;
    
    try {
      const res = await API.get("orders/user-orders/");
      let data = res.data ?? [];
      if (!Array.isArray(data) && Array.isArray(data.results)) {
        data = data.results;
      }

      console.log("📦 Fetched orders:", data.map(o => ({ id: o.order_id, status: o.status })));

      data.sort(
        (a, b) =>
          new Date(b.created_at || b.createdAt || 0) -
          new Date(a.created_at || a.createdAt || 0)
      );

      const newPreviousStatuses = {};
      const updatedOrderIds = new Set();
      
      data.forEach((order) => {
        const orderId = order.id;
        const currentStatus = order.status;
        newPreviousStatuses[orderId] = currentStatus;
        
        if (previousStatuses[orderId] && previousStatuses[orderId] !== currentStatus) {
          console.log(`🔄 Order ${order.order_id} status changed: ${previousStatuses[orderId]} → ${currentStatus}`);
          updatedOrderIds.add(orderId);
          
          if (showToast || isBackground) {
            toast.success(`Order ${order.order_id} is now: ${currentStatus}`, {
              icon: "📦",
              duration: 4000,
              position: 'bottom-center',
            });
          }
        }
      });
      
      setPreviousStatuses(newPreviousStatuses);
      
      if (updatedOrderIds.size > 0) {
        setRecentlyUpdatedOrders(updatedOrderIds);
        setTimeout(() => setRecentlyUpdatedOrders(new Set()), 5000);
      }

      const open = data.filter((o) => {
        const status = (o.status || "").toLowerCase().trim();
        return status !== "delivered" && status !== "completed" && status !== "cancelled";
      });
      
      const closed = data.filter((o) => {
        const status = (o.status || "").toLowerCase().trim();
        return status === "delivered" || status === "completed";
      });

      setOrders(open);
      setClosedOrders(closed);
      
      if (showToast) {
        toast.success("Orders refreshed!", { 
          icon: "🔄", 
          duration: 2000,
          position: 'bottom-center',
        });
      }
      
      return data;
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      if (!isBackground) {
        setError("Failed to load your orders.");
      }
      throw err;
    }
  }, [previousStatuses]);

  // ✅ INITIAL LOAD
  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        await fetchOrders();
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ AUTO-REFRESH EVERY 30 SECONDS
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log("⏰ Auto-refreshing orders...");
      fetchOrders({ isBackground: true });
    }, 30000);

    return () => clearInterval(intervalId);
  }, [fetchOrders]);

  // ✅ REFRESH ON TAB/WINDOW FOCUS
  useEffect(() => {
    const handleFocus = () => {
      console.log("👀 Window focused, refreshing orders...");
      fetchOrders({ isBackground: true });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("👀 Tab visible, refreshing orders...");
        fetchOrders({ isBackground: true });
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchOrders]);

  // ✅ MANUAL REFRESH HANDLER
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchOrders({ showToast: true });
    } finally {
      setIsRefreshing(false);
    }
  };

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
        position: 'bottom-center',
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
          position: 'bottom-center',
        });

        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        setClosedOrders((prev) => [updated.data, ...prev]);
      } catch (error) {
        console.error("Error confirming delivery:", error);
        toast.error("Something went wrong. Please try again.", {
          position: 'bottom-center',
        });
      }
      return;
    }

    if (progress >= 5) {
      toast("Order already delivered!", { 
        icon: "✅",
        position: 'bottom-center',
      });
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
      
      toast.success("Order deleted successfully", {
        position: 'bottom-center',
      });
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete order:", err);
      toast.error("Could not delete order. Please try again.", {
        position: 'bottom-center',
      });
    }
  };

  // ✅ FIXED: Handle Reorder - Creates NEW order with ITEMS and NEW ORDER ID
  const handleReorder = async (order) => {
    // ✅ Validate that we have items to reorder
    if (!order.items || order.items.length === 0) {
      toast.error("No items found in this order to reorder.", {
        position: 'bottom-center',
      });
      return;
    }

    // ✅ Show loading toast
    const loadingToast = toast.loading("Placing your reorder...", {
      position: 'bottom-center',
    });

    try {
      // ✅ Create new order payload WITH items
      const reorderPayload = {
        items: order.items.map(item => ({
          product_id: item.product_id || item.productId || item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          image: item.image || item.image_url,
        })),
        delivery_method: order.delivery_method || "delivery",
        delivery_fee: order.delivery_fee || 0,
        source: "reorder", // ✅ Mark as reorder
        reordered_from: order.order_id || order.id, // ✅ Track original order
      };

      console.log("📦 Reorder payload:", reorderPayload);

      // ✅ Create new order via API
      const res = await API.post("orders/checkout/", reorderPayload);
      
      // ✅ Extract the NEW order data
      const newOrderData = res.data?.order || res.data;
      const newOrderId = newOrderData?.order_id || 
                         newOrderData?.reference || 
                         res.data?.order_id ||
                         res.data?.reference;

      console.log("✅ Reorder response:", res.data);

      // ✅ Create optimistic order for immediate UI update
      const newOrder = {
        id: newOrderData?.id || Date.now(),
        order_id: newOrderId || `ORD-${Date.now()}`,
        status: "pending",
        source: "reorder", // ✅ Mark as reorder
        isReordered: true, // ✅ Flag for badge display
        reordered_from: order.order_id,
        created_at: new Date().toISOString(),
        items: order.items.map(item => ({
          ...item,
          quantity: item.quantity || 1,
        })),
        total: order.total || order.items.reduce(
          (sum, it) => sum + Number(it.price) * (it.quantity || 1),
          0
        ),
        delivery_method: order.delivery_method || "delivery",
        delivery_fee: order.delivery_fee || 0,
        isNew: true, // ✅ Show "New Order" badge initially
      };

      // ✅ Add to open orders
      setOrders((prev) => [newOrder, ...prev]);
      
      // ✅ Switch to active tab to show the new order
      setActiveTab("open");

      // ✅ Highlight the new order
      setHighlightedNewOrders(new Set([newOrder.order_id]));
      setTimeout(() => setHighlightedNewOrders(new Set()), 8000);

      // ✅ Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success(
        `🎉 Reorder placed successfully! Order ${newOrderId || 'created'}`,
        { 
          icon: "🛒", 
          duration: 4000,
          position: 'bottom-center',
        }
      );

      // ✅ Scroll to top to see the new order
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      console.error("Error reordering:", err);
      toast.dismiss(loadingToast);
      
      const errorMessage = err?.response?.data?.error || 
                          err?.response?.data?.message || 
                          "Could not place reorder. Please try again.";
      
      toast.error(errorMessage, {
        position: 'bottom-center',
      });
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
      {/* Header with Refresh */}
      <OrdersHeader 
        activeTab={activeTab} 
        onBack={() => navigate(-1)} 
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

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
                isNew={
                  highlightedNewOrders.has(order.order_id || order.id) || 
                  order.isNew
                }
                isUpdated={recentlyUpdatedOrders.has(order.id)}
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