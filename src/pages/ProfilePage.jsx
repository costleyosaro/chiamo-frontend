// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useTheme } from "../context/ThemeContext";
import { useCart } from "../pages/CartContext";
import { useSmartLists } from "../pages/SmartListContext"; // ✅ Added import
import toast from "react-hot-toast";
import "./Profile.css";

// Icons
import {
  FiUser,
  FiMapPin,
  FiBell,
  FiCreditCard,
  FiHelpCircle,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiMoon,
  FiSun,
  FiShoppingBag,
  FiList,
  FiPackage,
  FiDollarSign,
  FiAward,
  FiEdit3,
  FiShield,
  FiLock,
  FiInfo,
  FiSettings,
  FiGift,
  FiStar,
  FiHeart,
  FiAlertCircle,
  FiCheck,
} from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi";

// ============ HELPER FUNCTIONS ============
const formatCurrency = (val) =>
  `₦${Number(val || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

// ============ LOYALTY POINTS ALGORITHM ============
const calculateLoyaltyPoints = (profile, orderSummary) => {
  if (!profile || !orderSummary) return 0;

  let points = 0;
  
  // Base points for registration
  points += 50;
  
  // Points for orders (10 points per order)
  points += (orderSummary.total_orders || 0) * 10;
  
  // Points for spending (1 point per ₦100 spent)
  points += Math.floor((orderSummary.total_spent || 0) / 100);
  
  // Login frequency bonus (estimate based on account age)
  const accountCreated = profile.created_at ? new Date(profile.created_at) : new Date();
  const daysSinceCreation = Math.floor((new Date() - accountCreated) / (1000 * 60 * 60 * 24));
  const estimatedLogins = Math.min(daysSinceCreation * 0.3, 100); // Assume 30% login rate, max 100 bonus
  points += Math.floor(estimatedLogins);
  
  // Bonus for having profile complete
  if (profile.name && profile.email && profile.phone) {
    points += 25;
  }
  
  // Bonus for business verification
  if (profile.businessName) {
    points += 30;
  }
  
  return Math.floor(points);
};

// ============ SUB-COMPONENTS ============

// Header Component
const ProfileHeader = ({ onBack }) => (
  <header className="pf-header">
    <button className="pf-back-btn" onClick={onBack} aria-label="Go back">
      <FiChevronLeft />
    </button>
    <h1 className="pf-header-title">My Profile</h1>
    <div className="pf-header-spacer"></div>
  </header>
);

// Avatar Section
const AvatarSection = ({ profile, onEdit }) => {
  const initial = profile?.name?.[0]?.toUpperCase() || 
                  profile?.businessName?.[0]?.toUpperCase() || "U";

  return (
    <div className="pf-avatar-section">
      <div className="pf-avatar-wrapper">
        <div className="pf-avatar">
          <span className="pf-avatar-initial">{initial}</span>
        </div>
        <button className="pf-avatar-edit" onClick={onEdit}>
          <FiEdit3 />
        </button>
      </div>
      <h2 className="pf-user-name">{profile?.businessName || profile?.name || "User"}</h2>
      <p className="pf-user-email">{profile?.email || "No email"}</p>
      <div className="pf-user-badge">
        <FiStar />
        <span>Premium Member</span>
      </div>
    </div>
  );
};

// Stats Cards - Updated with Naira symbol
const StatsSection = ({ orderSummary }) => (
  <div className="pf-stats">
    <div className="pf-stat-card">
      <div className="pf-stat-icon orders">
        <FiPackage />
      </div>
      <div className="pf-stat-content">
        <span className="pf-stat-value">{orderSummary?.total_orders || 0}</span>
        <span className="pf-stat-label">Total Orders</span>
      </div>
    </div>
    <div className="pf-stat-card">
      <div className="pf-stat-icon savings">
        <span className="naira-symbol">₦</span>
      </div>
      <div className="pf-stat-content">
        <span className="pf-stat-value">{formatCurrency(orderSummary?.total_spent || 0)}</span>
        <span className="pf-stat-label">Total Spent</span>
      </div>
    </div>
  </div>
);

// Loyalty Card - Removed Redeem Button
const LoyaltyCard = ({ points = 0 }) => (
  <div className="pf-loyalty-card">
    <div className="pf-loyalty-content">
      <div className="pf-loyalty-icon">
        <FiAward />
      </div>
      <div className="pf-loyalty-info">
        <span className="pf-loyalty-label">Loyalty Points</span>
        <span className="pf-loyalty-value">{points} pts</span>
        <span className="pf-loyalty-subtitle">Keep shopping to earn more!</span>
      </div>
    </div>
    <div className="pf-loyalty-pattern"></div>
  </div>
);

// Quick Actions - Updated with fixed styling
const QuickActions = ({ smartListsCount = 0, onNavigate }) => {
  
  const handleSubscriptionsClick = () => {
    toast.success("🚀 New feature coming soon!", {
      duration: 3000,
      style: {
        background: 'linear-gradient(135deg, #1b4b8c, #143a6e)',
        color: 'white',
        borderRadius: '12px',
        padding: '16px',
        fontSize: '14px',
        fontWeight: '500',
      },
    });
  };

  return (
    <div className="pf-quick-actions">
      <div 
        className="pf-quick-card pf-subscription-card" 
        onClick={handleSubscriptionsClick}
        style={{ 
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
        }}
      >
        <div className="pf-quick-icon subscriptions">
          <FiShoppingBag />
        </div>
        <div className="pf-quick-content">
          <span className="pf-quick-label">Subscriptions</span>
          <span className="pf-quick-value">Coming Soon</span>
        </div>
        <FiChevronRight className="pf-quick-arrow" />
      </div>
      <div 
        className="pf-quick-card pf-smartlist-card" 
        onClick={() => onNavigate("/cart-page")}
        style={{ 
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
        }}
      >
        <div className="pf-quick-icon smartlists">
          <FiList />
        </div>
        <div className="pf-quick-content">
          <span className="pf-quick-label">Smart Lists</span>
          <span className="pf-quick-value">{smartListsCount} Lists</span>
        </div>
        <FiChevronRight className="pf-quick-arrow" />
      </div>
    </div>
  );
};
// Menu Section
const MenuSection = ({ title, children }) => (
  <div className="pf-menu-section">
    {title && <h3 className="pf-menu-title">{title}</h3>}
    <div className="pf-menu-items">{children}</div>
  </div>
);

// Menu Item
const MenuItem = ({ icon: Icon, label, value, onClick, danger, toggle, isActive }) => (
  <button
    className={`pf-menu-item ${danger ? "danger" : ""}`}
    onClick={onClick}
  >
    <div className="pf-menu-item-left">
      <div className={`pf-menu-icon ${danger ? "danger" : ""}`}>
        <Icon />
      </div>
      <span className="pf-menu-label">{label}</span>
    </div>
    <div className="pf-menu-item-right">
      {value && <span className="pf-menu-value">{value}</span>}
      {toggle ? (
        <div className={`pf-toggle ${isActive ? "active" : ""}`}>
          <div className="pf-toggle-thumb"></div>
        </div>
      ) : (
        <FiChevronRight className="pf-menu-arrow" />
      )}
    </div>
  </button>
);

// Logout Confirmation Modal
const LogoutModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="pf-modal-overlay" onClick={onClose}>
      <div className="pf-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pf-modal-icon">
          <FiLogOut />
        </div>
        <h3 className="pf-modal-title">Sign Out?</h3>
        <p className="pf-modal-text">
          Are you sure you want to sign out of your account?
        </p>
        <div className="pf-modal-actions">
          <button className="pf-modal-btn cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="pf-modal-btn confirm"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="pf-btn-loader"></span>
            ) : (
              <>
                <FiLogOut />
                <span>Sign Out</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// App Version Footer
const AppFooter = () => (
  <div className="pf-footer">
    <div className="pf-footer-logo">
      <HiOutlineSparkles />
      <span>ChiamoOrder</span>
    </div>
    <span className="pf-footer-version">Version 1.0.0</span>
  </div>
);

// Loading Skeleton
const ProfileSkeleton = () => (
  <div className="pf-skeleton">
    <div className="pf-skeleton-avatar"></div>
    <div className="pf-skeleton-name"></div>
    <div className="pf-skeleton-email"></div>
    <div className="pf-skeleton-stats">
      <div className="pf-skeleton-stat"></div>
      <div className="pf-skeleton-stat"></div>
    </div>
    <div className="pf-skeleton-card"></div>
    <div className="pf-skeleton-menu"></div>
    <div className="pf-skeleton-menu"></div>
    <div className="pf-skeleton-menu"></div>
  </div>
);

// ============ MAIN COMPONENT ============
export default function ProfilePage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { clearCart, user } = useCart();

  // ✅ FIXED: Import and use SmartLists context like BottomNav does
  let totalSmartListCount = 0;
  try {
    const smartListContext = useSmartLists();
    totalSmartListCount = smartListContext?.totalSmartListCount || 0;
  } catch (error) {
    console.warn('SmartLists context not available in ProfilePage:', error);
    totalSmartListCount = 0;
  }

  // State
  const [profile, setProfile] = useState(null);
  const [orderSummary, setOrderSummary] = useState({
    total_orders: 0,
    total_spent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Fetch profile data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, summaryRes] = await Promise.all([
          API.get("/customers/profile/"),
          API.get("/orders/summary/"),
        ]);
        
        setProfile(profileRes.data);
        setOrderSummary(summaryRes.data);

      } catch (err) {
        console.error("Failed to load profile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate loyalty points
  const loyaltyPoints = calculateLoyaltyPoints(profile, orderSummary);

  // Handle Logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("auth_user");
      if (user?.id) localStorage.removeItem(`cart_${user.id}`);
      await clearCart();
      delete API.defaults.headers.common["Authorization"];
      toast.success("Signed out successfully");
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
      toast.error("Logout failed. Please try again.");
      navigate("/", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Handle navigation
  const handleNavigate = (path) => {
    navigate(path);
  };

  // Loading state
  if (loading) {
    return (
      <div className="pf-page">
        <ProfileHeader onBack={() => navigate(-1)} />
        <div className="pf-content">
          <ProfileSkeleton />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="pf-page">
        <ProfileHeader onBack={() => navigate(-1)} />
        <div className="pf-error">
          <FiAlertCircle />
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pf-page">
      {/* Header */}
      <ProfileHeader onBack={() => navigate(-1)} />

      {/* Content */}
      <div className="pf-content">
        {/* Avatar Section */}
        <AvatarSection
          profile={profile}
          onEdit={() => navigate("/edit-profile")}
        />

        {/* Stats */}
        <StatsSection orderSummary={orderSummary} />

        {/* Loyalty Card */}
        <LoyaltyCard points={loyaltyPoints} />

        {/* Quick Actions */}
        <QuickActions
          smartListsCount={totalSmartListCount} // ✅ Use the context value
          onNavigate={handleNavigate}
        />

        {/* Account Settings */}
        <MenuSection title="Account">
          <MenuItem
            icon={FiUser}
            label="Edit Profile"
            onClick={() => navigate("/edit-profile")}
          />
          <MenuItem
            icon={FiMapPin}
            label="Addresses"
            onClick={() => navigate("/addresses")}
          />
          <MenuItem
            icon={FiCreditCard}
            label="Payment Methods"
            onClick={() => navigate("/payments")}
          />
          <MenuItem
            icon={FiLock}
            label="Security"
            onClick={() => navigate("/security")}
          />
        </MenuSection>

        {/* Preferences */}
        <MenuSection title="Preferences">
          <MenuItem
            icon={FiBell}
            label="Notifications"
            onClick={() => navigate("/notifications")}
          />
          <MenuItem
            icon={theme === "dark" ? FiSun : FiMoon}
            label={theme === "dark" ? "Light Mode" : "Dark Mode"}
            toggle
            isActive={theme === "dark"}
            onClick={toggleTheme}
          />
        </MenuSection>

        {/* Support */}
        <MenuSection title="Support">
          <MenuItem
            icon={FiHelpCircle}
            label="Help & Support"
            onClick={() => navigate("/support")}
          />
          <MenuItem
            icon={FiInfo}
            label="About"
            onClick={() => navigate("/about-us")}
          />
          <MenuItem
            icon={FiShield}
            label="Privacy Policy"
            onClick={() => navigate("/privacy-policy")}
          />
        </MenuSection>

        {/* Sign Out */}
        <MenuSection>
          <MenuItem
            icon={FiLogOut}
            label="Sign Out"
            danger
            onClick={() => setShowLogoutModal(true)}
          />
        </MenuSection>

        {/* Footer */}
        <AppFooter />
      </div>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />

      {/* Bottom Spacer */}
      <div className="pf-bottom-spacer"></div>
    </div>
  );
}
                