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
import { checkPromos } from "../hooks/usePromoChecker";
import PromoModal from "../components/PromoModal";

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
  { min: 50000, fee: 0,    label: "Free Delivery" },
  { min: 25000, fee: 1000, label: "₦1,000" },
  { min: 10000, fee: 1500, label: "₦1,500" },
  { min: 0,     fee: 2000, label: "₦2,000" },
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
      return {
        threshold: tier.min,
        fee: tier.fee,
        remaining: tier.min - subtotal,
      };
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

// ============ PROMO THEME MAP ============
const PROMO_THEME = {
  power_mint_promo: {
    badgeBg:     "#d4a017",
    badgeColor:  "#000000",
    borderColor: "#d4a017",
    cardBg:      "linear-gradient(135deg, #fffbeb, #fef3c7)",
    freeColor:   "#b8880f",
  },
  jelly_promo: {
    badgeBg:     "#7c3aed",
    badgeColor:  "#ffffff",
    borderColor: "#7c3aed",
    cardBg:      "linear-gradient(135deg, #faf5ff, #f3e8ff)",
    freeColor:   "#7c3aed",
  },
  beverage_promo: {
    badgeBg:     "#8b0000",
    badgeColor:  "#ffffff",
    borderColor: "#8b0000",
    cardBg:      "linear-gradient(135deg, #fff5f5, #ffe4e4)",
    freeColor:   "#8b0000",
  },
  care_promo: {
    badgeBg:     "#064e3b",
    badgeColor:  "#ffffff",
    borderColor: "#064e3b",
    cardBg:      "linear-gradient(135deg, #f0fdf4, #dcfce7)",
    freeColor:   "#064e3b",
  },
};

// ============ SUB-COMPONENTS ============

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
        {itemCount > 0 && (
          <span className="cart-badge">{itemCount}</span>
        )}
      </div>
    </div>
  </header>
);

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

// ============ CART ITEM ============
const CartItem = ({
  item,
  onUpdateQty,
  onRemove,
  onRemoveVirtual,
  pendingQty,
}) => {
  const isPromoFreeItem = item.isPromoFreeItem === true;
  const isVirtual       = item.isVirtual === true;
  const theme           = isPromoFreeItem ? PROMO_THEME[item.promoType] : null;

  const displayPrice = parsePrice(item.originalPrice ?? item.price);
  const qty   = pendingQty !== undefined ? pendingQty : (Number(item.quantity) || 1);
  const total = isPromoFreeItem ? 0 : displayPrice * qty;

  const [isRemoving,       setIsRemoving]       = useState(false);
  const [isEditing,        setIsEditing]        = useState(false);
  const [editValue,        setEditValue]        = useState(String(qty));
  const [showDeleteConfirm,setShowDeleteConfirm]= useState(false);

  useEffect(() => {
    if (!isEditing) setEditValue(String(qty));
  }, [qty, isEditing]);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      if (isVirtual) {
        onRemoveVirtual?.(item.virtualId);
      } else {
        onRemove(item.productId);
      }
      toast.success("Item removed from cart", { position: "bottom-center" });
    }, 300);
  };

  const handleDeleteClick = () => setShowDeleteConfirm(true);
  const confirmDelete     = () => { setShowDeleteConfirm(false); handleRemove(); };

  const handleInputChange = (e) => {
    setEditValue(e.target.value.replace(/[^0-9]/g, ""));
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    const newQty = parseInt(editValue, 10);
    if (!newQty || newQty < 1) { setEditValue(String(qty)); return; }
    if (newQty !== qty) onUpdateQty(item.productId, newQty);
    setEditValue(String(newQty));
  };

  const handleKeyDown  = (e) => { if (e.key === "Enter") e.target.blur(); };
  const handleQtyClick = ()  => { setEditValue(String(qty)); setIsEditing(true); };

  return (
    <>
      <div
        className={`cart-item ${isRemoving ? "removing" : ""} ${isPromoFreeItem ? "promo-free-item" : ""}`}
        style={
          isPromoFreeItem && theme
            ? {
                border:       `2px solid ${theme.borderColor}`,
                background:   theme.cardBg,
                borderRadius: "14px",
                overflow:     "visible",
                marginTop:    "18px",
              }
            : {}
        }
      >
        {/* Floating FREE badge */}
        {isPromoFreeItem && theme && (
          <div
            className="cart-promo-free-badge"
            style={{ background: theme.badgeBg, color: theme.badgeColor }}
          >
            Free Promo Item
          </div>
        )}

        {/* Image */}
        <div className="cart-item-image-wrapper">
          <img
            src={imageUrl(item.image || item.image_url)}
            alt={item.name || "Product"}
            className="cart-item-image"
            loading="lazy"
            onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER; }}
          />
        </div>

        {/* Content */}
        <div className="cart-item-content">
          <div className="cart-item-header">
            <h3 className="cart-item-name">{item.name}</h3>
            <button
              className="cart-item-delete-btn"
              onClick={handleDeleteClick}
              aria-label="Delete item"
            >
              🗑️
            </button>
          </div>

          {/* Price row */}
          <p className="cart-item-price">
            {isPromoFreeItem ? (
              <span className="cart-item-price-free-wrap">
                <span
                  className="cart-item-price-struck"
                  style={{ color: theme?.freeColor }}
                >
                  {formatCurrency(displayPrice)}
                </span>
                <span
                  className="cart-item-free-tag"
                  style={{ background: theme?.badgeBg, color: theme?.badgeColor }}
                >
                  FREE
                </span>
              </span>
            ) : (
              `${formatCurrency(displayPrice)} / carton`
            )}
          </p>

          {/* Footer: qty + total */}
          <div className="cart-item-footer">
            <div className="cart-qty-selector">
              <button
                className="cart-qty-btn minus"
                onClick={() => onUpdateQty(item.productId, Math.max(1, qty - 1))}
                disabled={qty <= 1 || isPromoFreeItem}
                aria-label="Decrease quantity"
              >
                −
              </button>

              {isPromoFreeItem ? (
                <span className="cart-qty-value">{qty}</span>
              ) : isEditing ? (
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
                disabled={isPromoFreeItem}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <span className="cart-item-total">
              {isPromoFreeItem ? (
                <span
                  className="cart-item-total-free"
                  style={{ color: theme?.freeColor }}
                >
                  FREE
                </span>
              ) : (
                formatCurrency(total)
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Delete confirm modal */}
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
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ============ CART ITEMS SECTION ============
const CartItemsSection = ({
  cart,
  onUpdateQty,
  onRemove,
  onClearAll,
  pendingQuantities,
  onRemoveVirtual,
}) => (
  <section className="cart-items-section">
    <div className="cart-items-header">
      <button className="cart-clear-all-btn" onClick={onClearAll}>
        Clear All Items
      </button>
    </div>
    <div className="cart-items">
      {cart.map((item) => (
        <CartItem
          key={item.virtualId || `${item.productId || item.id}`}
          item={item}
          onUpdateQty={onUpdateQty}
          onRemove={onRemove}
          onRemoveVirtual={onRemoveVirtual}
          pendingQty={pendingQuantities[item.productId]}
        />
      ))}
    </div>
  </section>
);

// ============ DELIVERY SECTION ============
const DeliverySection = ({ method, setMethod, subtotal }) => {
  const deliveryFee    = getDeliveryFee(subtotal, "delivery");
  const nextTier       = getNextTier(subtotal);
  const progress       = Math.min((subtotal / FREE_DELIVERY_THRESHOLD) * 100, 100);
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
          <div className="cart-delivery-option-icon"><FiTruck /></div>
          <div className="cart-delivery-option-info">
            <span className="cart-delivery-option-name">Delivery</span>
            <span className="cart-delivery-option-desc">Port Harcourt axis</span>
          </div>
          <span className="cart-delivery-option-fee">
            {isFreeDelivery
              ? <span className="free-badge">FREE</span>
              : formatCurrency(deliveryFee)}
          </span>
          <div className="cart-delivery-radio">
            <div className="cart-delivery-radio-inner" />
          </div>
        </button>

        <button
          className={`cart-delivery-option ${method === "pickup" ? "active" : ""}`}
          onClick={() => setMethod("pickup")}
        >
          <div className="cart-delivery-option-icon pickup-icon"><BiStore /></div>
          <div className="cart-delivery-option-info">
            <span className="cart-delivery-option-name">Pickup</span>
            <span className="cart-delivery-option-desc">Collect from warehouse</span>
          </div>
          <span className="cart-delivery-option-fee">
            <span className="free-badge">FREE</span>
          </span>
          <div className="cart-delivery-radio">
            <div className="cart-delivery-radio-inner" />
          </div>
        </button>
      </div>

      {method === "delivery" && !isFreeDelivery && (
        <div className="cart-delivery-progress">
          <div className="cart-delivery-progress-header">
            <span className="cart-delivery-progress-text">
              {nextTier?.threshold === FREE_DELIVERY_THRESHOLD ? (
                <>Add <strong>{formatCurrency(nextTier.remaining)}</strong> more for <strong>FREE delivery!</strong></>
              ) : nextTier ? (
                <>Add <strong>{formatCurrency(nextTier.remaining)}</strong> more to reduce delivery to <strong>{formatCurrency(nextTier.fee)}</strong></>
              ) : null}
            </span>
          </div>
          <div className="cart-delivery-progress-bar">
            <div className="cart-delivery-progress-fill" style={{ width: `${progress}%` }} />
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

// ============ DELIVERY PRICING INFO ============
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
            <span className="tier-fee free">FREE</span>
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

// ============ ORDER SUMMARY ============
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
            <><BiStore className="cart-summary-icon" />Pickup</>
          ) : (
            <><FiTruck className="cart-summary-icon" />Delivery Fee</>
          )}
        </span>
        <span className={deliveryFee === 0 ? "summary-free" : ""}>
          {deliveryFee === 0 ? "FREE" : formatCurrency(deliveryFee)}
        </span>
      </div>
    </div>
    <div className="cart-summary-divider" />
    <div className="cart-summary-row total">
      <span>Total</span>
      <span>{formatCurrency(total)}</span>
    </div>
  </div>
);

// ============ TRUST BADGES ============
const TrustBadges = () => (
  <div className="cart-trust">
    <div className="cart-trust-item"><FiShield /><span>Secure Payment</span></div>
    <div className="cart-trust-item"><FiTruck /><span>Own Fleet</span></div>
    <div className="cart-trust-item"><FiPackage /><span>Carton Packs</span></div>
  </div>
);

// ============ CHECKOUT BUTTON ============
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
        <><span className="cart-btn-loader" />Processing...</>
      ) : (
        <><FiCreditCard />Checkout<FiChevronRight /></>
      )}
    </button>
  </div>
);

// ============ MAIN CART COMPONENT ============
export default function Cart() {
  const navigate = useNavigate();
  const { cart, updateQty, removeFromCart, clearCart, addToCart } = useCart();
  const smartListsContext = useSmartLists();
  const setOrders = smartListsContext?.setOrders;
  const { addNotification, playNotificationSound, createPromoNotification } = useNotifications();

  // ── UI state ──────────────────────────────────────────────────────────────
  const [processing,       setProcessing]       = useState(false);
  const [showPinModal,     setShowPinModal]      = useState(false);
  const [showSetPinModal,  setShowSetPinModal]   = useState(false);
  const [deliveryMethod,   setDeliveryMethod]   = useState("delivery");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // ── Promo state ───────────────────────────────────────────────────────────

  // Which promo modal is currently open
  const [activePromo,  setActivePromo]  = useState(null);

  // Promos already shown this SESSION (resets on page reload)
  const [shownPromos,  setShownPromos]  = useState(new Set());

  // Promos the user has accepted this SESSION
  // Using sessionStorage so it resets when user closes browser
  const [acceptedPromos, setAcceptedPromos] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("cart_accepted_promos") || "[]");
    } catch { return []; }
  });

  // Virtual frontend-only free rows for Jelly / PowerMint
  // (same product as trigger so we never add to backend)
  const [sameProductPromoItems, setSameProductPromoItems] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("same_product_promo_items") || "[]");
    } catch { return []; }
  });

  // Keys for Beverage / Care free items (added to real backend cart)
  const [promoFreeItemKeys, setPromoFreeItemKeys] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("promo_free_item_keys") || "[]");
    } catch { return []; }
  });

  // ── Optimistic qty state ──────────────────────────────────────────────────
  const [pendingQuantities, setPendingQuantities] = useState({});
  const debounceTimers = useRef({});
  const DEBOUNCE_DELAY = 800;
  const itemOrderRef   = useRef([]);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const storedUser = JSON.parse(localStorage.getItem("auth_user") || "{}");
  const customerId =
    storedUser?.id          ||
    storedUser?.user_id     ||
    storedUser?.customer_id ||
    storedUser?.pk          ||
    storedUser?.profile?.id ||
    null;

  // ── Persist acceptedPromos + sameProductPromoItems to sessionStorage ──────
  useEffect(() => {
    sessionStorage.setItem("cart_accepted_promos", JSON.stringify(acceptedPromos));
  }, [acceptedPromos]);

  useEffect(() => {
    sessionStorage.setItem("same_product_promo_items", JSON.stringify(sameProductPromoItems));
  }, [sameProductPromoItems]);

  // ── Track cart item order (for stable sort) ───────────────────────────────
  useEffect(() => {
    const currentIds = cart.map((item) => item.productId || item.id);
    const existingOrder = itemOrderRef.current.filter((id) =>
      currentIds.includes(id)
    );
    const newIds = currentIds.filter((id) => !existingOrder.includes(id));
    itemOrderRef.current = [...existingOrder, ...newIds];
  }, [cart]);

  // ── Cleanup debounce timers ───────────────────────────────────────────────
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(clearTimeout);
    };
  }, []);

  // ── PROMO CHECKER ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!cart || cart.length === 0) return;

    const timer = setTimeout(() => {
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

      // Only run checkPromos on real (non-virtual) items
      const regularItems = cartWithPending.filter(
        (item) => !item.isPromoFreeItem
      );

      const triggered = checkPromos(regularItems);
      const eligibleKeys = triggered.map((p) => p.key);

      // Clean up accepted promos that no longer qualify
      setAcceptedPromos((prev) =>
        prev.filter((key) => eligibleKeys.includes(key))
      );

      // Clean up virtual promo rows that no longer qualify
      setSameProductPromoItems((prev) =>
        prev.filter((item) => eligibleKeys.includes(item.promoKey))
      );

      // Find next promo to show
      const nextPromo = triggered.find(
        (p) =>
          !shownPromos.has(p.key) &&
          !acceptedPromos.includes(p.key)
      );

      if (nextPromo && !activePromo) {
        // Save free qty limit for beverage/care
        if (nextPromo.freeQty) {
          const promoParam =
            nextPromo.type === "beverage_promo" ? "beverage_500" : "care_300";
          localStorage.setItem(
            `promo_free_qty_${promoParam}`,
            String(nextPromo.freeQty)
          );
        }

        setActivePromo(nextPromo);
        setShownPromos((prev) => new Set([...prev, nextPromo.key]));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [cart, pendingQuantities, acceptedPromos, activePromo]);

  // ── HANDLE PROMO ACCEPT ───────────────────────────────────────────────────
  const handlePromoAccept = async (promo) => {
    if (!promo) return;

    // Mark as accepted this session
    setAcceptedPromos((prev) =>
      prev.includes(promo.key) ? prev : [...prev, promo.key]
    );

    // Send notification
    if (createPromoNotification) {
      await createPromoNotification(
        promo.title,
        `You unlocked: ${promo.rewardText}.`
      );
    }
    playNotificationSound();

    // ── Jelly / PowerMint ──
    // Add a VIRTUAL frontend-only row (do NOT add to backend cart
    // because backend will merge it with the trigger item)
    if (
      promo.type === "jelly_promo" ||
      promo.type === "power_mint_promo"
    ) {
      const originalPrice =
        parsePrice(promo.freeItem?.originalPrice) ||
        parsePrice(promo.freeItem?.price)         ||
        0;

      const virtualItem = {
        virtualId:       `virtual-${promo.key}`,
        promoKey:        promo.key,
        productId:       promo.freeItem?.productId,
        slug:            promo.freeItem?.slug,
        name:            promo.freeItem?.name,
        image:           promo.freeItem?.image,
        price:           originalPrice,
        originalPrice:   originalPrice,
        quantity:        1,
        isPromoFreeItem: true,
        isVirtual:       true,
        promoType:       promo.type,
      };

      setSameProductPromoItems((prev) => {
        // Replace if already exists for this promo key
        const filtered = prev.filter((i) => i.promoKey !== promo.key);
        return [...filtered, virtualItem];
      });

      toast.success(
        `1 FREE ${promo.freeItem?.name} added to your cart`,
        {
          duration: 4000,
          position: "bottom-center",
          style: {
            background:   promo.type === "power_mint_promo" ? "#d4a017" : "#7c3aed",
            color:        promo.type === "power_mint_promo" ? "#000000" : "#ffffff",
            fontWeight:   "700",
            borderRadius: "12px",
          },
        }
      );

      return; // done for jelly/powermint
    }

    // ── Beverage / Care ──
    // The user will be redirected to AllProducts to select free items.
    // PromoModal's handleRedirect (with &promobag=true) handles navigation.
    // Nothing extra to do here.
  };

  // ── STABLE + TAGGED CART ──────────────────────────────────────────────────
  const stableCart = useMemo(() => {
    const order = itemOrderRef.current;

    const sorted = [...cart].sort((a, b) => {
      const idA    = a.productId || a.id;
      const idB    = b.productId || b.id;
      const indexA = order.indexOf(idA);
      const indexB = order.indexOf(idB);
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

    return sorted.map((item) => {
      const productId = String(item.productId || item.id || "");
      const slug      = item.slug || "";

      // Only tag Beverage/Care bag items (not Jelly/PowerMint — those are virtual)
      const matchingKey = promoFreeItemKeys.find((key) => {
        const [storedId, promoParam] = key.split("::");
        const isBagPromo =
          promoParam === "beverage_500" || promoParam === "care_300";
        return isBagPromo && (storedId === productId || storedId === slug);
      });

      let promoType = null;
      if (matchingKey?.includes("beverage_500")) promoType = "beverage_promo";
      if (matchingKey?.includes("care_300"))     promoType = "care_promo";

      return {
        ...item,
        isPromoFreeItem: !!matchingKey,
        promoType,
      };
    });
  }, [cart, promoFreeItemKeys]);

  // Combine real cart items with virtual promo rows
  const renderedCart = useMemo(() => {
    return [...stableCart, ...sameProductPromoItems];
  }, [stableCart, sameProductPromoItems]);

  // ── OPTIMISTIC QTY UPDATE ────────────────────────────────────────────────
  const handleOptimisticQtyUpdate = useCallback(
    (productId, newQty) => {
      // Ignore updates for virtual items
      if (!productId) return;

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
          console.error("Failed to sync qty:", error);
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

  // ── SUBTOTAL (excludes ALL free promo items) ──────────────────────────────
  // We use stableCart (not renderedCart) so virtual items are never counted
  const subtotal = useMemo(() => {
    return stableCart.reduce((sum, item) => {
      if (item.isPromoFreeItem) return sum; // skip tagged free items
      const price     = parsePrice(item.price);
      const productId = item.productId || item.id;
      const qty =
        pendingQuantities[productId] !== undefined
          ? pendingQuantities[productId]
          : Number(item.quantity) || 1;
      return sum + price * qty;
    }, 0);
  }, [stableCart, pendingQuantities]);

  const deliveryFee = getDeliveryFee(subtotal, deliveryMethod);
  const grandTotal  = subtotal + deliveryFee;

  // ── CREATE ORDER ──────────────────────────────────────────────────────────
  const createOrder = async () => {
    setProcessing(true);

    // Flush pending qty updates before checkout
    const pendingIds = Object.keys(pendingQuantities);
    if (pendingIds.length > 0) {
      for (const productId of pendingIds) {
        if (debounceTimers.current[productId]) {
          clearTimeout(debounceTimers.current[productId]);
        }
        try {
          await updateQty(productId, pendingQuantities[productId]);
        } catch (err) {
          console.error("Failed to sync qty before checkout:", err);
        }
      }
      setPendingQuantities({});
    }

    try {
      const res = await API.post("/orders/checkout/", {
        delivery_method: deliveryMethod,
        delivery_fee:    deliveryFee,
      });

      const orderId =
        res.data?.order_id         ||
        res.data?.order?.order_id  ||
        res.data?.order?.id        ||
        res.data?.reference        ||
        res.data?.order?.reference ||
        `ORD-${Date.now()}`;

      addNotification({
        id:              Date.now(),
        type:            "order_placed",
        title:           "Order Placed Successfully!",
        message:         `Your order ${orderId} has been placed. Total: ${formatCurrency(grandTotal)}`,
        order_id:        orderId,
        is_read:         false,
        created_at:      new Date().toISOString(),
        delivery_method: deliveryMethod,
        total:           grandTotal,
      });
      playNotificationSound();

      // Clear cart
      await clearCart().catch(() => {});
      itemOrderRef.current = [];

      // Clear all promo tracking on successful order
      setAcceptedPromos([]);
      setSameProductPromoItems([]);
      setPromoFreeItemKeys([]);
      sessionStorage.removeItem("cart_accepted_promos");
      sessionStorage.removeItem("same_product_promo_items");
      localStorage.removeItem("promo_free_item_keys");
      localStorage.removeItem("promo_free_qty_beverage_500");
      localStorage.removeItem("promo_free_qty_care_300");

      toast.success(`Order ${orderId} placed successfully!`, {
        duration: 4000,
        position: "bottom-center",
        style: { background: "#10b981", color: "#fff" },
      });

      if (typeof setOrders === "function") {
        setOrders((prev) => [
          {
            id:              res.data?.order?.id || orderId,
            order_id:        orderId,
            source:          "cart",
            status:          res.data?.order?.status || "pending",
            created_at:      new Date().toISOString(),
            items:           cart.map((item) => ({
              name:     item.name,
              quantity: item.quantity,
              price:    parsePrice(item.price),
            })),
            total:           res.data?.order?.total || grandTotal,
            delivery_method: deliveryMethod,
            isNew:           true,
          },
          ...(prev || []),
        ]);
      }

      setTimeout(() => {
        addNotification({
          id:         Date.now() + 1,
          type:       "order_confirmed",
          title:      "Order Confirmed!",
          message:    `Order ${orderId} confirmed and will be processed shortly.`,
          order_id:   orderId,
          is_read:    false,
          created_at: new Date().toISOString(),
        });
      }, 2000);

      setTimeout(
        () => navigate("/orders", { state: { newOrderId: orderId } }),
        3000
      );
    } catch (err) {
      console.error("Order creation error:", err);
      addNotification({
        id:         Date.now(),
        type:       "payment_failed",
        title:      "Order Failed",
        message:    "There was an issue processing your order. Please try again.",
        is_read:    false,
        created_at: new Date().toISOString(),
      });
      toast.error(
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        "Failed to place order. Please try again.",
        { position: "bottom-center", style: { background: "#ef4444", color: "#fff" } }
      );
    } finally {
      setProcessing(false);
    }
  };

  // ── CHECKOUT CLICK ────────────────────────────────────────────────────────
  const handleCheckoutClick = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty", { position: "bottom-center" });
      return;
    }
    try {
      const res = await API.get(`customers/has-transaction-pin/${customerId}/`);
      if (res.data.has_pin) {
        setShowPinModal(true);
      } else {
        setShowSetPinModal(true);
      }
    } catch {
      toast.error("Could not verify PIN status", { position: "bottom-center" });
    }
  };

  // ── CLEAR ALL ─────────────────────────────────────────────────────────────
  const handleClearAll = () => setShowClearConfirm(true);

  const confirmClearAll = async () => {
    setShowClearConfirm(false);
    Object.values(debounceTimers.current).forEach(clearTimeout);
    debounceTimers.current = {};
    setPendingQuantities({});

    try {
      await clearCart();
      itemOrderRef.current = [];

      // Clear all promo tracking
      setAcceptedPromos([]);
      setSameProductPromoItems([]);
      setPromoFreeItemKeys([]);
      sessionStorage.removeItem("cart_accepted_promos");
      sessionStorage.removeItem("same_product_promo_items");
      localStorage.removeItem("promo_free_item_keys");
      localStorage.removeItem("promo_free_qty_beverage_500");
      localStorage.removeItem("promo_free_qty_care_300");

      toast.success("Cart cleared successfully!", { position: "bottom-center" });
    } catch {
      toast.error("Failed to clear cart", { position: "bottom-center" });
    }
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="cart-page">
      <CartHeader
        itemCount={renderedCart.length}
        onBack={() => navigate(-1)}
      />

      <div className="cart-content">
        {cart.length === 0 && sameProductPromoItems.length === 0 ? (
          <EmptyCart onShop={() => navigate("/all-products")} />
        ) : (
          <>
            <CartItemsSection
              cart={renderedCart}
              onUpdateQty={handleOptimisticQtyUpdate}
              onRemove={removeFromCart}
              onClearAll={handleClearAll}
              pendingQuantities={pendingQuantities}
              onRemoveVirtual={(virtualId) =>
                setSameProductPromoItems((prev) =>
                  prev.filter((item) => item.virtualId !== virtualId)
                )
              }
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

      {(cart.length > 0 || sameProductPromoItems.length > 0) && (
        <CheckoutButton
          total={grandTotal}
          processing={processing}
          disabled={cart.length === 0}
          onClick={handleCheckoutClick}
        />
      )}

      {/* Clear All Modal */}
      {showClearConfirm && (
        <div
          className="cart-modal-overlay"
          onClick={() => setShowClearConfirm(false)}
        >
          <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cart-modal-icon warning"><FiAlertCircle /></div>
            <h3 className="cart-modal-title">Clear Entire Cart?</h3>
            <p className="cart-modal-text">
              This will remove all {cart.length} item{cart.length !== 1 ? "s" : ""} from your cart.
              This action cannot be undone.
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
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction PIN */}
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
          toast.success("PIN set successfully!", { position: "bottom-center" });
          setShowSetPinModal(false);
          setShowPinModal(true);
        }}
      />

      {/* Promo Modal */}
      <PromoModal
        isOpen={!!activePromo}
        onClose={() => setActivePromo(null)}
        onAccept={handlePromoAccept}
        onReject={() => setActivePromo(null)}
        promoData={activePromo}
      />

      <div className="cart-bottom-spacer" />
    </div>
  );
}