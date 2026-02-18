// src/pages/Cart.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
import { useSmartLists } from "./SmartListContext";
import API from "../services/api";
import toast from "react-hot-toast";
import TransactionPinModal from "../components/TransactionPinModal";
import SetTransactionPinModal from "../components/SetTransactionPinModal";
import "./Cart.css";

// Icons
import {
  FiShoppingCart,
  FiChevronLeft,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiPackage,
  FiTruck,
  FiShield,
  FiPercent,
  FiChevronRight,
  FiAlertCircle,
  FiCheck,
  FiX,
  FiShoppingBag,
  FiCreditCard,
  FiInfo,
} from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi";

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

// Header Component
const CartHeader = ({ itemCount, onBack, onClear }) => (
  <header className="cart-header">
    <button className="cart-back-btn" onClick={onBack} aria-label="Go back">
      <FiChevronLeft />
    </button>
    <div className="cart-header-center">
      <h1 className="cart-title">My Cart</h1>
      {itemCount > 0 && (
        <span className="cart-item-count">{itemCount} items</span>
      )}
    </div>
    {itemCount > 0 && (
      <button className="cart-clear-btn" onClick={onClear} aria-label="Clear cart">
        <FiTrash2 />
      </button>
    )}
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

// Cart Item Component
const CartItem = ({ item, onUpdateQty, onRemove }) => {
  const price = parsePrice(item.price);
  const qty = Number(item.quantity) || 1;
  const total = price * qty;
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(item.productId);
    }, 300);
  };

  return (
    <div className={`cart-item ${isRemoving ? "removing" : ""}`}>
      <div className="cart-item-image-wrapper">
        <img
          src={item.image || "/assets/images/placeholder.png"}
          alt={item.name || "Product"}
          className="cart-item-image"
          loading="lazy"
        />
      </div>

      <div className="cart-item-content">
        <div className="cart-item-header">
          <h3 className="cart-item-name">{item.name}</h3>
          <button
            className="cart-item-remove"
            onClick={handleRemove}
            aria-label="Remove item"
          >
            <FiX />
          </button>
        </div>

        <p className="cart-item-price">{formatCurrency(price)}</p>

        <div className="cart-item-footer">
          <div className="cart-qty-selector">
            <button
              className="cart-qty-btn"
              onClick={() => onUpdateQty(item.productId, Math.max(1, qty - 1))}
              disabled={qty <= 1}
              aria-label="Decrease quantity"
            >
              <FiMinus />
            </button>
            <span className="cart-qty-value">{qty}</span>
            <button
              className="cart-qty-btn"
              onClick={() => onUpdateQty(item.productId, qty + 1)}
              aria-label="Increase quantity"
            >
              <FiPlus />
            </button>
          </div>
          <span className="cart-item-total">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
};

// Promo Code Section
const PromoSection = () => {
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    if (code.trim()) {
      // Add your promo logic here
      toast.success("Promo code applied!");
      setApplied(true);
    }
  };

  return (
    <div className="cart-promo">
      <div className="cart-promo-header">
        <FiPercent className="cart-promo-icon" />
        <span>Have a promo code?</span>
      </div>
      <div className="cart-promo-input-wrapper">
        <input
          type="text"
          className="cart-promo-input"
          placeholder="Enter code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          disabled={applied}
        />
        <button
          className={`cart-promo-btn ${applied ? "applied" : ""}`}
          onClick={handleApply}
          disabled={applied || !code.trim()}
        >
          {applied ? <FiCheck /> : "Apply"}
        </button>
      </div>
    </div>
  );
};

// Order Summary Component
const OrderSummary = ({ subtotal, deliveryFee, discount = 0, total }) => (
  <div className="cart-summary">
    <h3 className="cart-summary-title">Order Summary</h3>
    
    <div className="cart-summary-rows">
      <div className="cart-summary-row">
        <span>Subtotal</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      
      <div className="cart-summary-row">
        <span className="cart-summary-label">
          <FiTruck className="cart-summary-icon" />
          Delivery Fee
        </span>
        <span>{formatCurrency(deliveryFee)}</span>
      </div>
      
      {discount > 0 && (
        <div className="cart-summary-row discount">
          <span className="cart-summary-label">
            <FiPercent className="cart-summary-icon" />
            Discount
          </span>
          <span>-{formatCurrency(discount)}</span>
        </div>
      )}
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
      <span>Fast Delivery</span>
    </div>
    <div className="cart-trust-item">
      <FiPackage />
      <span>Quality Products</span>
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

  const [query, setQuery] = useState("");
  const [processing, setProcessing] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showSetPinModal, setShowSetPinModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("auth_user") || "{}");
  const customerId =
    storedUser?.id ||
    storedUser?.user_id ||
    storedUser?.customer_id ||
    storedUser?.pk ||
    storedUser?.profile?.id ||
    null;

  // Filter cart items
  const filteredCart = cart.filter((item) =>
    item?.name?.toLowerCase().includes(query.toLowerCase())
  );

  // Calculate totals
  const subtotal = filteredCart.reduce((sum, item) => {
    const price = parsePrice(item.price);
    const qty = Number(item.quantity) || 1;
    return sum + price * qty;
  }, 0);

  const deliveryFee = subtotal * 0.001;
  const discount = 0; // Add discount logic if needed
  const grandTotal = subtotal + deliveryFee - discount;

  // Create order after PIN validation
  const createOrder = async () => {
    setProcessing(true);
    try {
      const res = await API.post("/orders/checkout/");
      const orderId =
        res.data?.order_id ||
        res.data?.order?.order_id ||
        res.data?.order?.id ||
        null;

      await clearCart().catch(() => {});

      toast.success(
        orderId
          ? `Order #${orderId} placed successfully!`
          : "Order placed successfully!",
        { duration: 4000, icon: "🎉" }
      );

      if (typeof setOrders === "function") {
        const optimisticOrder = {
          id: res.data?.order?.id || orderId || Math.random().toString(36).slice(2, 9),
          order_id: orderId || `ORD-${new Date().getFullYear()}-TEMP`,
          source: "cart",
          status: res.data?.order?.status || "pending",
          created_at: new Date().toISOString(),
          items: [],
          total: res.data?.order?.total || grandTotal,
        };
        setOrders((prev) => [optimisticOrder, ...(prev || [])]);
      }

      setTimeout(() => navigate("/orders", { state: { newOrderId: orderId } }), 2000);
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        "Failed to place order. Please try again.";
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  // Handle checkout click
  const handleCheckoutClick = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      const res = await API.get(`customers/has-transaction-pin/${customerId}/`);
      if (res.data.has_pin) {
        setShowPinModal(true);
      } else {
        setShowSetPinModal(true);
      }
    } catch (err) {
      toast.error("Could not verify PIN status");
    }
  };

  // Handle clear cart
  const handleClearCart = () => {
    setShowClearConfirm(true);
  };

  const confirmClearCart = () => {
    clearCart();
    setShowClearConfirm(false);
    toast.success("Cart cleared");
  };

  return (
    <div className="cart-page">
      {/* Header */}
      <CartHeader
        itemCount={cart.length}
        onBack={() => navigate(-1)}
        onClear={handleClearCart}
      />

      {/* Main Content */}
      <div className="cart-content">
        {cart.length === 0 ? (
          <EmptyCart onShop={() => navigate("/all-products")} />
        ) : (
          <>
            {/* Cart Items */}
            <section className="cart-items-section">
              <div className="cart-items">
                {filteredCart.map((item) => (
                  <CartItem
                    key={item.productId || item.id}
                    item={item}
                    onUpdateQty={updateQty}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>
            </section>

            {/* Promo Code */}
            <PromoSection />

            {/* Order Summary */}
            <OrderSummary
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              discount={discount}
              total={grandTotal}
            />

            {/* Trust Badges */}
            <TrustBadges />
          </>
        )}
      </div>

      {/* Checkout Bar */}
      {cart.length > 0 && (
        <CheckoutButton
          total={grandTotal}
          processing={processing}
          disabled={cart.length === 0}
          onClick={handleCheckoutClick}
        />
      )}

      {/* Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <div className="cart-modal-overlay" onClick={() => setShowClearConfirm(false)}>
          <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cart-modal-icon warning">
              <FiAlertCircle />
            </div>
            <h3 className="cart-modal-title">Clear Cart?</h3>
            <p className="cart-modal-text">
              Are you sure you want to remove all items from your cart?
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
                onClick={confirmClearCart}
              >
                <FiTrash2 />
                Clear All
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

      {/* Set Transaction PIN Modal */}
      <SetTransactionPinModal
        isOpen={showSetPinModal}
        onClose={() => setShowSetPinModal(false)}
        customerId={customerId}
        onSuccess={() => {
          toast.success("PIN set successfully!");
          setShowSetPinModal(false);
          setShowPinModal(true);
        }}
      />

      {/* Bottom Spacer */}
      <div className="cart-bottom-spacer"></div>
    </div>
  );
}