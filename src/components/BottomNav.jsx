// src/components/BottomNav.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiHome,
  FiBox,
  FiList,
  FiShoppingCart,
  FiUser,
} from "react-icons/fi";
import { useCart } from "../pages/CartContext";      
import { useSmartLists } from "../pages/SmartListContext";
import { useOrders } from "../pages/OrdersContext";  

const navItems = [
  { key: "home", label: "Home", Icon: FiHome, to: "/home" },
  { key: "orders", label: "Orders", Icon: FiBox, to: "/orders" },
  { key: "cart", label: "Cart", Icon: FiShoppingCart, to: "/cart" },
  { key: "lists", label: "Lists", Icon: FiList, to: "/cart-page" },
  { key: "profile", label: "Profile", Icon: FiUser, to: "/profile" },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ FIXED: Add error handling for context hooks
  const { cartCount = 0 } = useCart() || {};
  
  // ✅ FIXED: Safe access to SmartLists context with fallback
  let totalSmartListCount = 0;
  try {
    const smartListContext = useSmartLists();
    totalSmartListCount = smartListContext?.totalSmartListCount || 0;
  } catch (error) {
    console.warn('SmartLists context not available:', error);
    totalSmartListCount = 0;
  }
  
  const { totalOrdersCount = 0 } = useOrders() || {};

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <nav className="bottom-nav">
      <div className="nav-container">
        {navItems.map(({ key, label, Icon, to }) => {
          const isCart = key === "cart";
          const isLists = key === "lists";
          const isOrders = key === "orders";

          const badgeCount =
            (isCart && cartCount) ||
            (isLists && totalSmartListCount) ||
            (isOrders && totalOrdersCount) ||        
            0;

          return (
            <button
              key={key}
              className={`nav-item ${isCart ? "cart" : ""} ${
                isActive(to) ? "active" : ""
              }`}
              data-role={isCart ? "cart-icon" : undefined}
              onClick={() => navigate(to)}
              type="button"
              aria-label={label}
            >
              <div className="nav-icon-wrapper">     
                <Icon size={isCart ? 24 : 22} className="nav-icon" />
                {badgeCount > 0 && (
                  <span className="cart-badge">      
                    {badgeCount > 9 ? "9+" : badgeCount}
                  </span>
                )}
              </div>
              <span className="nav-label">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}