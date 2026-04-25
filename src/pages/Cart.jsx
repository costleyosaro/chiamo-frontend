// src/pages/Cart.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
import { useSmartLists } from "./SmartListContext";
import { useNotifications } from "../context/NotificationContext";
import API from "../services/api";
import toast from "react-hot-toast";
import TransactionPinModal from "../components/TransactionPinModal";
import SetTransactionPinModal from "../components/SetTransactionPinModal";
import { imageUrl, PLACEHOLDER } from "../utils/image";
import "./Cart.css";

import PromoModal from "../components/PromoModal";
import { checkPromos } from "../hooks/usePromoChecker";
// Icons — removed FiChevronLeft (replaced with simple arrow)
import {
  FiShoppingCart,
  FiPackage,
  FiTruck,
  FiShield,
  FiChevronRight,
  FiAlertCircle,
  FiShoppingBag,
  FiCreditCard,
  FiInfo,
  FiMapPin,
} from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi";
import { BiStore } from "react-icons/bi";

// ============ DELIVERY PRICING CONFIG ============
const FREE_DELIVERY_THRESHOLD = 50000;

const DELIVERY_TIERS = [
  { min: 50000, fee: 0, label: "Free Delivery 🎉" },
  { min: 25000, fee: 1000, label: "₦1,000" },
  { min: 10000, fee: 1500, label: "₦1,500" },
  { min: 0, fee: 2000, label: "₦2,000" },
];

const getDeliveryFee = (subtotal, method) => {
  if (method === "pickup") return 0;
  for (const tier of DELIVERY_TIERS) {
    if (subtotal >= tier.min) return tier.fee;
  }
  return 2000;
};

const getNextTier = (subtotal) => {
  const sortedTiers = [...DELIVERY_TIERS].sort((a, b) => a.min - b.min);
  for (const tier of sortedTiers) {
    if (subtotal < tier.min) {
      return { threshold: tier.min, fee: tier.fee, remaining: tier.min - subtotal };
    }
  }
  return null;
};

// ============ HELPER FUNCTIONS ============
const parsePrice = (val) =>
  typeof val === "number"
    ? val
    : Number(val?.toString().replace(/[^\d.-]/g, "")) || 0;

const formatCurrency = (val) =>
  `₦${Number(val || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// ============ SUB-COMPONENTS ============

// ✅ Header Component - SIMPLE BACK ARROW
const CartHeader = ({ itemCount, onBack }) => (
  <header className="cart-header">
    <button className="cart-back-btn" onClick={onBack} aria-label="Go back">
      <span className="cart-back-arrow">‹</span>
    </button>
    <div className="cart-header-center">
      <h1 className="cart-title">My Cart</h1>
      {itemCount > 0 && (
        <span className="cart-item-count">{itemCount} items</span>
      )}
    </div>
    <div className="cart-header-right">
      <div className="cart-icon-display">
        <FiShoppingCart />
        {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
      </div>
    </div>
  </header>
);

// Empty Cart State
const EmptyCart = ({ onShop }) => (
  <div className="cart-empty">
    <div className="cart-empty-icon">
      <FiShoppingCart />
    </div>
    <h2 className="cart-empty-title">Your cart is empty</h2>
    <p className="cart-empty-text">
      Looks like you haven't added anything to your cart yet
    </p>
    <button className="cart-empty-btn" onClick={onShop}>
      <FiShoppingBag />
      Start Shopping
    </button>
  </div>
);

// ✅ Cart Item Component - OPTIMISTIC QUANTITY UPDATES
const CartItem = ({ item, onUpdateQty, onRemove, pendingQty }) => {
  const price = parsePrice(item.price);
  // ✅ Use pending quantity if available, otherwise use item quantity
  const qty = pendingQty !== undefined ? pendingQty : (Number(item.quantity) || 1);
  const total = price * qty;
  const [isRemoving, setIsRemoving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(qty));
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(item.productId);
      toast.success("Item removed from cart", {
        position: 'bottom-center',
      });
    }, 300);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(false);
    handleRemove();
  };

  const handleInputChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setEditValue(val);
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    const newQty = parseInt(editValue, 10);
    if (!newQty || newQty < 1) {
      setEditValue(String(qty));
      return;
    }
    if (newQty !== qty) {
      onUpdateQty(item.productId, newQty);
    }
    setEditValue(String(newQty));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.target.blur();
    }
  };

  const handleQtyClick = () => {
    setEditValue(String(qty));
    setIsEditing(true);
  };

  // ✅ Update edit value when qty changes
  useEffect(() => {
    if (!isEditing) {
      setEditValue(String(qty));
    }
  }, [qty, isEditing]);

  return (
    <>
      <div className={`cart-item ${isRemoving ? "removing" : ""}`}>
        <div className="cart-item-image-wrapper">
          <img
            src={imageUrl(item.image || item.image_url)}
            alt={item.name || "Product"}
            className="cart-item-image"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = PLACEHOLDER;
            }}
          />
        </div>

        <div className="cart-item-content">
          <div className="cart-item-header">
            <h3 className="cart-item-name">{item.name}</h3>
            <button
              className="cart-item-delete-btn"
              onClick={handleDeleteClick}
              aria-label="Delete item"
              title="Remove from cart"
            >
              🗑️
            </button>
          </div>

          <p className="cart-item-price">{formatCurrency(price)} / carton</p>

          <div className="cart-item-footer">
            <div className="cart-qty-selector">
              <button
                className="cart-qty-btn minus"
                onClick={() => onUpdateQty(item.productId, Math.max(1, qty - 1))}
                disabled={qty <= 1}
                aria-label="Decrease quantity"
              >
                −
              </button>

              {isEditing ? (
                <input
                  type="text"
                  inputMode="numeric"
                  className="cart-qty-input"
                  value={editValue}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
              ) : (
                <span
                  className="cart-qty-value"
                  onClick={handleQtyClick}
                  title="Click to type quantity"
                >
                  {qty}
                </span>
              )}

              <button
                className="cart-qty-btn plus"
                onClick={() => onUpdateQty(item.productId, qty + 1)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <span className="cart-item-total">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Individual Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="cart-modal-overlay"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cart-modal-icon warning">
              <FiAlertCircle />
            </div>
            <h3 className="cart-modal-title">Remove Item?</h3>
            <p className="cart-modal-text">
              Are you sure you want to remove "{item.name}" from your cart?
            </p>
            <div className="cart-modal-actions">
              <button
                className="cart-modal-btn cancel"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="cart-modal-btn confirm"
                onClick={confirmDelete}
              >
                🗑️ Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ✅ Cart Items Section
const CartItemsSection = ({ cart, onUpdateQty, onRemove, onClearAll, pendingQuantities }) => (
  <section className="cart-items-section">
    <div className="cart-items-header">
      <button className="cart-clear-all-btn" onClick={onClearAll}>
        🗑️ Clear All Items
      </button>
    </div>
    <div className="cart-items">
      {cart.map((item) => (
        <CartItem
          key={item.productId || item.id}
          item={item}
          onUpdateQty={onUpdateQty}
          onRemove={onRemove}
          pendingQty={pendingQuantities[item.productId]}
        />
      ))}
    </div>
  </section>
);

// ============ DELIVERY METHOD SELECTOR ============
const DeliverySection = ({ method, setMethod, subtotal }) => {
  const deliveryFee = getDeliveryFee(subtotal, "delivery");
  const nextTier = getNextTier(subtotal);
  const progress = Math.min((subtotal / FREE_DELIVERY_THRESHOLD) * 100, 100);
  const isFreeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD;

  return (
    <div className="cart-delivery">
      <h3 className="cart-delivery-title">
        <FiTruck />
        Delivery Method
      </h3>

      <div className="cart-delivery-options">
        <button
          className={`cart-delivery-option ${method === "delivery" ? "active" : ""}`}
          onClick={() => setMethod("delivery")}
        >
          <div className="cart-delivery-option-icon">
            <FiTruck />
          </div>
          <div className="cart-delivery-option-info">
            <span className="cart-delivery-option-name">Delivery</span>
            <span className="cart-delivery-option-desc">
              Port Harcourt axis
            </span>
          </div>
          <span className="cart-delivery-option-fee">
            {isFreeDelivery ? (
              <span className="free-badge">FREE</span>
            ) : (
              formatCurrency(deliveryFee)
            )}
          </span>
          <div className="cart-delivery-radio">
            <div className="cart-delivery-radio-inner"></div>
          </div>
        </button>

        <button
          className={`cart-delivery-option ${method === "pickup" ? "active" : ""}`}
          onClick={() => setMethod("pickup")}
        >
          <div className="cart-delivery-option-icon pickup-icon">
            <BiStore />
          </div>
          <div className="cart-delivery-option-info">
            <span className="cart-delivery-option-name">Pickup</span>
            <span className="cart-delivery-option-desc">
              Collect from warehouse
            </span>
          </div>
          <span className="cart-delivery-option-fee">
            <span className="free-badge">FREE</span>
          </span>
          <div className="cart-delivery-radio">
            <div className="cart-delivery-radio-inner"></div>
          </div>
        </button>
      </div>

      {method === "delivery" && !isFreeDelivery && (
        <div className="cart-delivery-progress">
          <div className="cart-delivery-progress-header">
            <span className="cart-delivery-progress-text">
              {nextTier && nextTier.threshold === FREE_DELIVERY_THRESHOLD ? (
                <>
                  🚚 Add <strong>{formatCurrency(nextTier.remaining)}</strong> more
                  for <strong>FREE delivery!</strong>
                </>
              ) : nextTier ? (
                <>
                  📦 Add <strong>{formatCurrency(nextTier.remaining)}</strong> more
                  to reduce delivery to <strong>{formatCurrency(nextTier.fee)}</strong>
                </>
              ) : null}
            </span>
          </div>
          <div className="cart-delivery-progress-bar">
            <div
              className="cart-delivery-progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="cart-delivery-tiers">
            <span className={subtotal >= 10000 ? "tier-done" : ""}>₦10K</span>
            <span className={subtotal >= 25000 ? "tier-done" : ""}>₦25K</span>
            <span className={subtotal >= 50000 ? "tier-done" : ""}>₦50K Free!</span>
          </div>
        </div>
      )}

      {method === "delivery" && isFreeDelivery && (
        <div className="cart-delivery-free-banner">
          <HiOutlineSparkles />
          <span>You've unlocked <strong>FREE delivery!</strong></span>
          <HiOutlineSparkles />
        </div>
      )}

      {method === "pickup" && (
        <div className="cart-delivery-pickup-info">
          <FiMapPin />
          <div>
            <strong>Warehouse Pickup</strong>
            <p>Port Harcourt, Rivers State, Nigeria</p>
            <p className="pickup-hours">Mon - Sat: 8:00 AM - 6:00 PM</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ============ DELIVERY PRICING TABLE ============
const DeliveryPricingInfo = () => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="cart-delivery-info-section">
      <button
        className="cart-delivery-info-toggle"
        onClick={() => setShowInfo(!showInfo)}
      >
        <FiInfo />
        <span>Delivery pricing info</span>
        <FiChevronRight className={`toggle-icon ${showInfo ? "open" : ""}`} />
      </button>

      {showInfo && (
        <div className="cart-delivery-info-table">
          <div className="delivery-tier-row">
            <span>Below ₦10,000</span>
            <span className="tier-fee">₦2,000</span>
          </div>
          <div className="delivery-tier-row">
            <span>₦10,000 — ₦24,999</span>
            <span className="tier-fee">₦1,500</span>
          </div>
          <div className="delivery-tier-row">
            <span>₦25,000 — ₦49,999</span>
            <span className="tier-fee">₦1,000</span>
          </div>
          <div className="delivery-tier-row highlight">
            <span>₦50,000 and above</span>
            <span className="tier-fee free">FREE 🎉</span>
          </div>
          <div className="delivery-tier-row pickup-row">
            <span>Warehouse Pickup</span>
            <span className="tier-fee free">Always FREE</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Order Summary Component
const OrderSummary = ({ subtotal, deliveryFee, deliveryMethod, total }) => (
  <div className="cart-summary">
    <h3 className="cart-summary-title">Order Summary</h3>

    <div className="cart-summary-rows">
      <div className="cart-summary-row">
        <span>Subtotal</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>

      <div className="cart-summary-row">
        <span className="cart-summary-label">
          {deliveryMethod === "pickup" ? (
            <>
              <BiStore className="cart-summary-icon" />
              Pickup
            </>
          ) : (
            <>
              <FiTruck className="cart-summary-icon" />
              Delivery Fee
            </>
          )}
        </span>
        <span className={deliveryFee === 0 ? "summary-free" : ""}>
          {deliveryFee === 0 ? "FREE" : formatCurrency(deliveryFee)}
        </span>
      </div>
    </div>

    <div className="cart-summary-divider"></div>

    <div className="cart-summary-row total">
      <span>Total</span>
      <span>{formatCurrency(total)}</span>
    </div>
  </div>
);

// Trust Badges
const TrustBadges = () => (
  <div className="cart-trust">
    <div className="cart-trust-item">
      <FiShield />
      <span>Secure Payment</span>
    </div>
    <div className="cart-trust-item">
      <FiTruck />
      <span>Own Fleet</span>
    </div>
    <div className="cart-trust-item">
      <FiPackage />
      <span>Carton Packs</span>
    </div>
  </div>
);

// Checkout Button
const CheckoutButton = ({ total, processing, disabled, onClick }) => (
  <div className="cart-checkout-bar">
    <div className="cart-checkout-total">
      <span className="cart-checkout-label">Total</span>
      <span className="cart-checkout-amount">{formatCurrency(total)}</span>
    </div>
    <button
      className={`cart-checkout-btn ${processing ? "processing" : ""}`}
      disabled={disabled || processing}
      onClick={onClick}
    >
      {processing ? (
        <>
          <span className="cart-btn-loader"></span>
          Processing...
        </>
      ) : (
        <>
          <FiCreditCard />
          Checkout
          <FiChevronRight />
        </>
      )}
    </button>
  </div>
);

// ============ MAIN COMPONENT ============
export default function Cart() {
  const navigate = useNavigate();
  const { cart, updateQty, removeFromCart, clearCart } = useCart();
  const smartListsContext = useSmartLists();
  const setOrders = smartListsContext?.setOrders;
  const { addNotification, playNotificationSound } = useNotifications();

  const [processing, setProcessing] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showSetPinModal, setShowSetPinModal] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState("delivery");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // ✅ PROMO STATE
  const [activePromo, setActivePromo] = useState(null);
  const [shownPromos, setShownPromos] = useState(new Set());
  const [claimedPromos, setClaimedPromos] = useState([]);

  // ✅ OPTIMISTIC QUANTITY STATE — must be declared BEFORE any useEffect that uses it
  const [pendingQuantities, setPendingQuantities] = useState({});

  // ✅ DEBOUNCE TIMERS
  const debounceTimers = useRef({});
  const DEBOUNCE_DELAY = 800;

  // ✅ Other refs
  const itemOrderRef = useRef([]);

  const storedUser = JSON.parse(localStorage.getItem("auth_user") || "{}");
  const customerId =
    storedUser?.id ||
    storedUser?.user_id ||
    storedUser?.customer_id ||
    storedUser?.pk ||
    storedUser?.profile?.id ||
    null;

  // ✅ Track original item order
  useEffect(() => {
    const currentIds = cart.map((item) => item.productId || item.id);
    const existingOrder = itemOrderRef.current.filter((id) =>
      currentIds.includes(id)
    );
    const newIds = currentIds.filter((id) => !existingOrder.includes(id));
    itemOrderRef.current = [...existingOrder, ...newIds];
  }, [cart]);

  // ✅ Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(clearTimeout);
    };
  }, []);

  // ✅ PROMO CHECKER — pendingQuantities is now declared above
  useEffect(() => {
    if (!cart || cart.length === 0) return;

    const cartWithPending = cart.map((item) => {
      const productId = item.productId || item.id;
      return {
        ...item,
        quantity:
          pendingQuantities[productId] !== undefined
            ? pendingQuantities[productId]
            : Number(item.quantity) || 1,
      };
    });

    const triggered = checkPromos(cartWithPending);

    const newPromos = triggered.filter(
      (p) =>
        !shownPromos.has(p.key) &&
        !claimedPromos.includes(p.key)
    );

    if (newPromos.length > 0 && !activePromo) {
      setActivePromo(newPromos[0]);
      setShownPromos((prev) => new Set([...prev, newPromos[0].key]));
    }
  }, [cart, pendingQuantities]);

  // ✅ HANDLE PROMO ACCEPT
  const handlePromoAccept = async (promo) => {
    if (!promo?.freeItem) return;

    try {
      const identifier = promo.freeItem.slug || promo.freeItem.productId;

      if (!identifier) {
        toast.error("Could not add promo item.");
        return;
      }

      await updateQty(identifier, 1);

      setClaimedPromos((prev) => [...prev, promo.key]);

      const notification = {
        id: Date.now(),
        type: "promo",
        title: "🎁 Promo Item Unlocked!",
        message: `You just won a FREE ${promo.freeItem.name}! Added to your cart as a promo item.`,
        is_read: false,
        created_at: new Date().toISOString(),
      };
      addNotification(notification);

      toast.success(
        `🎁 FREE ${promo.freeItem.name} added to your cart!`,
        {
          duration: 5000,
          position: "bottom-center",
          style: {
            background: "#7c3aed",
            color: "#fff",
            fontWeight: "700",
          },
        }
      );
    } catch (err) {
      console.error("Failed to add promo item:", err);
      toast.error("Could not add promo item. Contact support.");
    }
  };

  // ✅ Stable-sorted cart
  const stableCart = useMemo(() => {
    const order = itemOrderRef.current;
    return [...cart].sort((a, b) => {
      const idA = a.productId || a.id;
      const idB = b.productId || b.id;
      const indexA = order.indexOf(idA);
      const indexB = order.indexOf(idB);
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [cart]);

  // ✅ OPTIMISTIC QUANTITY UPDATE HANDLER
  const handleOptimisticQtyUpdate = useCallback(
    (productId, newQty) => {
      setPendingQuantities((prev) => ({ ...prev, [productId]: newQty }));

      if (debounceTimers.current[productId]) {
        clearTimeout(debounceTimers.current[productId]);
      }

      debounceTimers.current[productId] = setTimeout(async () => {
        try {
          await updateQty(productId, newQty);
          setPendingQuantities((prev) => {
            const updated = { ...prev };
            delete updated[productId];
            return updated;
          });
        } catch (error) {
          console.error(`❌ Failed to sync qty:`, error);
          setPendingQuantities((prev) => {
            const updated = { ...prev };
            delete updated[productId];
            return updated;
          });
          toast.error("Failed to update quantity. Please try again.", {
            position: "bottom-center",
          });
        }
      }, DEBOUNCE_DELAY);
    },
    [updateQty]
  );

  // ✅ Subtotal with pending quantities
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const price = parsePrice(item.price);
      const productId = item.productId || item.id;
      const qty =
        pendingQuantities[productId] !== undefined
          ? pendingQuantities[productId]
          : Number(item.quantity) || 1;
      return sum + price * qty;
    }, 0);
  }, [cart, pendingQuantities]);

  const deliveryFee = getDeliveryFee(subtotal, deliveryMethod);
  const grandTotal = subtotal + deliveryFee;

  // ✅ Create order after PIN validation with notification
  const createOrder = async () => {
    setProcessing(true);
    
    // ✅ Flush any pending quantity updates before checkout
    const pendingProductIds = Object.keys(pendingQuantities);
    if (pendingProductIds.length > 0) {
      // Clear all pending timers and sync immediately
      for (const productId of pendingProductIds) {
        if (debounceTimers.current[productId]) {
          clearTimeout(debounceTimers.current[productId]);
        }
        const qty = pendingQuantities[productId];
        try {
          await updateQty(productId, qty);
        } catch (err) {
          console.error(`Failed to sync qty before checkout:`, err);
        }
      }
      setPendingQuantities({});
    }
    
    try {
      const res = await API.post("/orders/checkout/", {
        delivery_method: deliveryMethod,
        delivery_fee: deliveryFee,
      });

      const orderId =
        res.data?.order_id ||
        res.data?.order?.order_id ||
        res.data?.order?.id ||
        res.data?.reference ||
        res.data?.order?.reference ||
        `ORD-${Date.now()}`;

      // ✅ Create notification for successful order
      const notification = {
        id: Date.now(),
        type: "order_placed",
        title: "Order Placed Successfully! 🎉",
        message: `Your order ${orderId} has been placed and is being processed. Total: ${formatCurrency(grandTotal)}`,
        order_id: orderId,
        is_read: false,
        created_at: new Date().toISOString(),
        delivery_method: deliveryMethod,
        total: grandTotal,
      };

      addNotification(notification);
      playNotificationSound();

      // ✅ Clear cart BEFORE navigating
      await clearCart().catch(() => {});
      itemOrderRef.current = [];

      toast.success(`Order ${orderId} placed successfully!`, {
        duration: 4000,
        icon: "🎉",
        position: 'bottom-center',
        style: {
          background: "#10b981",
          color: "#fff",
        },
      });

      if (typeof setOrders === "function") {
        const optimisticOrder = {
          id:
            res.data?.order?.id ||
            orderId ||
            Math.random().toString(36).slice(2, 9),
          order_id: orderId,
          source: "cart",
          status: res.data?.order?.status || "pending",
          created_at: new Date().toISOString(),
          items: cart.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: parsePrice(item.price),
          })),
          total: res.data?.order?.total || grandTotal,
          delivery_method: deliveryMethod,
          isNew: true,
        };
        setOrders((prev) => [optimisticOrder, ...(prev || [])]);
      }

      // ✅ Follow-up notification
      setTimeout(() => {
        const followUpNotification = {
          id: Date.now() + 1,
          type: "order_confirmed",
          title: "Order Confirmed! 📦",
          message: `Order ${orderId} has been confirmed and will be processed shortly. You'll receive updates on delivery status.`,
          order_id: orderId,
          is_read: false,
          created_at: new Date().toISOString(),
        };
        addNotification(followUpNotification);
      }, 2000);

      // ✅ Redirect to orders page
      setTimeout(
        () => navigate("/orders", { state: { newOrderId: orderId } }),
        3000
      );
    } catch (err) {
      console.error("Order creation error:", err);

      const errorNotification = {
        id: Date.now(),
        type: "payment_failed",
        title: "Order Failed ❌",
        message:
          "There was an issue processing your order. Please try again or contact support.",
        is_read: false,
        created_at: new Date().toISOString(),
      };
      addNotification(errorNotification);

      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        "Failed to place order. Please try again.";
      toast.error(msg, {
        position: 'bottom-center',
        style: {
          background: "#ef4444",
          color: "#fff",
        },
      });
    } finally {
      setProcessing(false);
    }
  };

  // Handle checkout click
  const handleCheckoutClick = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty", { position: 'bottom-center' });
      return;
    }

    try {
      const res = await API.get(
        `customers/has-transaction-pin/${customerId}/`
      );
      if (res.data.has_pin) {
        setShowPinModal(true);
      } else {
        setShowSetPinModal(true);
      }
    } catch (err) {
      toast.error("Could not verify PIN status", { position: 'bottom-center' });
    }
  };

  // ✅ Handle clear all cart
  const handleClearAll = () => {
    setShowClearConfirm(true);
  };

  const confirmClearAll = async () => {
    setShowClearConfirm(false);
    
    // Clear all pending timers
    Object.values(debounceTimers.current).forEach(clearTimeout);
    debounceTimers.current = {};
    setPendingQuantities({});
    
    try {
      await clearCart();
      itemOrderRef.current = [];
      toast.success("Cart cleared successfully!", { 
        icon: "🗑️",
        position: 'bottom-center',
      });
    } catch {
      toast.error("Failed to clear cart", { position: 'bottom-center' });
    }
  };

  return (
    <div className="cart-page">
      <CartHeader itemCount={cart.length} onBack={() => navigate(-1)} />

      <div className="cart-content">
        {cart.length === 0 ? (
          <EmptyCart onShop={() => navigate("/all-products")} />
        ) : (
          <>
            {/* ✅ Pass optimistic update handler and pending quantities */}
            <CartItemsSection
              cart={stableCart}
              onUpdateQty={handleOptimisticQtyUpdate}
              onRemove={removeFromCart}
              onClearAll={handleClearAll}
              pendingQuantities={pendingQuantities}
            />

            <DeliverySection
              method={deliveryMethod}
              setMethod={setDeliveryMethod}
              subtotal={subtotal}
            />

            <DeliveryPricingInfo />

            <OrderSummary
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              deliveryMethod={deliveryMethod}
              total={grandTotal}
            />

            <TrustBadges />
          </>
        )}
      </div>

      {cart.length > 0 && (
        <CheckoutButton
          total={grandTotal}
          processing={processing}
          disabled={cart.length === 0}
          onClick={handleCheckoutClick}
        />
      )}

      {/* ✅ Clear All Cart Confirmation Modal */}
      {showClearConfirm && (
        <div
          className="cart-modal-overlay"
          onClick={() => setShowClearConfirm(false)}
        >
          <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cart-modal-icon warning">
              <FiAlertCircle />
            </div>
            <h3 className="cart-modal-title">Clear Entire Cart?</h3>
            <p className="cart-modal-text">
              This will remove all {cart.length} item
              {cart.length > 1 ? "s" : ""} from your cart. This action cannot be
              undone.
            </p>
            <div className="cart-modal-actions">
              <button
                className="cart-modal-btn cancel"
                onClick={() => setShowClearConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="cart-modal-btn confirm"
                onClick={confirmClearAll}
              >
                🗑️ Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction PIN Modal */}
      <TransactionPinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        customerId={customerId}
        onSuccess={createOrder}
        onRequestSetPin={() => {
          setShowPinModal(false);
          setShowSetPinModal(true);
        }}
      />

      <SetTransactionPinModal
        isOpen={showSetPinModal}
        onClose={() => setShowSetPinModal(false)}
        customerId={customerId}
        onSuccess={() => {
          toast.success("PIN set successfully!", { position: 'bottom-center' });
          setShowSetPinModal(false);
          setShowPinModal(true);
        }}
      />

      <PromoModal
        isOpen={!!activePromo}
        onClose={() => setActivePromo(null)}
        onAccept={handlePromoAccept}
        onReject={() => setActivePromo(null)}
        promoData={activePromo}
      />


      <div className="cart-bottom-spacer"></div>
    </div>
  );
}