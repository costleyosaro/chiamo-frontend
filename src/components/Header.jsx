import React from "react";
import { FiMenu, FiShoppingCart, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";      
import { useCart } from "../pages/CartContext";      
import { useSmartLists } from "../pages/SmartListContext";

const Header = ({ businessName }) => {
  const navigate = useNavigate();
  
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

  return (
    <header className="header">
      <div className="greeting">
        <h1>Hi! {businessName} 👋</h1>
      </div>
      <div className="header-icons">

        {/* ✅ Smart List (Menu) button with light icon + badge */}
        <button className="icon-btn" onClick={() => navigate("/cart-page")}>
          <div className="nav-icon-wrapper">
            <FiMenu size={20} strokeWidth={1.5} />
            {totalSmartListCount > 0 && (
              <span className="cart-badge">
                {totalSmartListCount > 9 ? "9+" : totalSmartListCount}
              </span>
            )}
          </div>
        </button>

        {/* ✅ Cart button with lighter look + badge */}
        <button
          className="icon-btn top-cart"
          data-role="top-cart-icon"
          onClick={() => navigate("/cart")}
        >
          <div className="nav-icon-wrapper">
            <FiShoppingCart size={20} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="cart-badge">
                {cartCount > 9 ? "9+" : cartCount}   
              </span>
            )}
          </div>
        </button>

        {/* ✅ Profile button (lightweight icon) */}
        <button className="icon-btn" onClick={() => navigate("/profile")}>
          <FiUser size={20} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
};

export default Header;