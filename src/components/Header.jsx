import React from "react";
import { FiMenu, FiShoppingCart, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useCart } from "../pages/CartContext";
import { useSmartLists } from "../pages/SmartListContext"; // ✅ smartlist import

const Header = ({ businessName }) => {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { totalSmartListCount } = useSmartLists(); // ✅ smartlist count

  return (
    <header className="header">
      <div className="greeting">
        <h1>Hi! {businessName} 👋</h1>
      </div>
      <div className="header-icons">

        {/* ✅ Smart List (Menu) button with light icon + badge */}
        <button className="icon-btn" onClick={() => navigate("/cart-page")}>
          <div className="nav-icon-wrapper">
            <FiMenu size={20} strokeWidth={1.5} /> {/* lighter + smaller */}
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
            <FiShoppingCart size={20} strokeWidth={1.5} /> {/* lighter + smaller */}
            {cartCount > 0 && (
              <span className="cart-badge">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </div>
        </button>

        {/* ✅ Profile button (lightweight icon) */}
        <button className="icon-btn" onClick={() => navigate("/profile")}>
          <FiUser size={20} strokeWidth={1.5} /> {/* lighter + smaller */}
        </button>
      </div>
    </header>
  );
};

export default Header;
