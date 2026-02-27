// src/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../pages/CartContext";
import { useSmartLists } from "../pages/SmartListContext";
import { useNotifications } from "../context/NotificationContext"; // ✅ Added notification context
import { fetchProducts } from "../services/products";
import Lottie from "lottie-react";
import BottomNav from "../components/BottomNav";
import scanningAnimation from "../assets/animations/scanning.json";
import ComingSoonModal from "../components/ComingSoonModal";
import { imageUrl, PLACEHOLDER } from '../utils/image';

// Icons
import {
  FiShoppingCart,
  FiUser,
  FiSearch,
  FiBell,
  FiChevronRight,
  FiPackage,
  FiClock,
  FiArrowRight,
  FiStar,
  FiTruck,
  FiShield,
  FiHeadphones,
  FiGrid,
  FiHeart,
  FiEye,
  FiPlus,
  FiMinus,
  FiX,
  FiRefreshCw,
  FiSettings,
  FiLogOut,
  FiMoon,
  FiSun,
  FiMenu,
  FiHome,
  FiList,
  FiPercent,
} from "react-icons/fi";
import {
  FaWineGlassAlt,
  FaPumpSoap,
  FaSpa,
  FaFire,
  FaShoppingBag,
  FaQrcode,
  FaHistory,
  FaHeart,
  FaWallet,
  FaHeadset,
  FaGift,
  FaPercent,
} from "react-icons/fa";
import { LuCandy } from "react-icons/lu";
import { HiOutlineSparkles, HiOutlineQrcode } from "react-icons/hi";
import { BiScan, BiSupport } from "react-icons/bi";
import { MdLocalOffer, MdOutlineInventory } from "react-icons/md";

// Animations
import cartAnimation from "../assets/animations/cart.json";
import FlashAnimation from "../assets/animations/flash.json";
import SmartListAnimation from "../assets/animations/smart-list.json";
import SubscriptionsAnimation from "../assets/animations/subscriptions.json";

// Components
import SetTransactionPinModal from "../components/SetTransactionPinModal";
import "../main.css";

const CATEGORIES = [
  {
    id: "food",
    name: "Food",
    icon: LuCandy,
    image: "food/FOOD-CATEGORY-PHOTO.png",
    color: "#f59e0b",
  },
  {
    id: "beverage",
    name: "Beverages",
    icon: FaWineGlassAlt,
    image: "beverages/BEVERAGE-CATEGORY-PHOTO.png",
    color: "#3b82f6",
  },
  {
    id: "ZIZOU",
    name: "Zizou",
    icon: FaWineGlassAlt,
    image: "zizou/zizou-orange.jpeg",
    color: "#8b5cf6",
  },
  {
    id: "care",
    name: "Care",
    icon: FaPumpSoap,
    image: "care/CARE-CATEGORY-PHOTO1.png",
    color: "#10b981",
  },
  {
    id: "beauty",
    name: "Beauty",
    icon: FaSpa,
    image: "beauty/CLASSY_JELLY_48PCS-100g.png",
    color: "#ec4899",
  },
]

// ============ UPDATED QUICK ACTIONS WITH COMING SOON FLAGS ============
const QUICK_ACTIONS = [
  {
    id: "scan",
    icon: FaQrcode,
    label: "Scan QR",
    color: "#1b4b8c",
    path: null, // No path - handled separately
    isLottie: true,
    isScan: true,
  },
  {
    id: "orders",
    icon: FaHistory,
    label: "Orders",
    color: "#10b981",
    path: "/orders",
  },
  {
    id: "wallet",
    icon: FaWallet,
    label: "Wallet",
    color: "#f5a623",
    path: null, // No path - coming soon
    comingSoon: true, // ✅ THIS FLAG TRIGGERS THE MODAL
  },
  {
    id: "support",
    icon: BiSupport,
    label: "Support",
    color: "#8b5cf6",
    path: "/support",
  },
];

const FEATURES = [
  { icon: FiTruck, title: "Fast Delivery", desc: "Quick & reliable" },
  { icon: FiShield, title: "Secure Pay", desc: "100% protected" },
  { icon: FiStar, title: "Best Quality", desc: "Premium products" },
  { icon: FiHeadphones, title: "24/7 Support", desc: "Always here" },
];

// ============ TIME GREETING ============
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

// ============ COUNTDOWN TIMER HOOK ============
const useCountdown = (endTime) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = endTime - new Date().getTime();
    if (difference <= 0) return { hours: 0, minutes: 0, seconds: 0 };
    return {
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  return timeLeft;
};

// ============ ENHANCED HOME HEADER COMPONENT WITH NOTIFICATIONS ============
const HomeHeader = ({ businessName, cartCount, smartListCount, navigate }) => {
  const { unreadCount } = useNotifications(); // ✅ Get unread notification count

  const handleNotificationClick = () => {
    navigate("/notifications");
  };

  return (
    <header className="hp-header">
      <div className="hp-header-left">
        <div className="hp-avatar">
          {businessName?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div className="hp-greeting">
          <span className="hp-greeting-text">{getGreeting()} 👋</span>
          <h1 className="hp-business-name">{businessName || "User"}</h1>
        </div>
      </div>

      <div className="hp-header-right">
        {/* ✅ FIXED: Notification Button with Proper Badge */}
        <button
          className="hp-header-btn hp-notification-btn"
          onClick={handleNotificationClick}
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
          title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
        >
          <FiBell className="hp-icon" />
          {unreadCount > 0 && (
            <span className="hp-badge notification-badge">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {/* Smart List Button */}
        <button
          className="hp-header-btn"
          onClick={() => navigate("/cart-page")}     
          aria-label="Smart Lists"
        >
          <FiList className="hp-icon" />
          {smartListCount > 0 && (
            <span className="hp-badge">
              {smartListCount > 9 ? "9+" : smartListCount}
            </span>
          )}
        </button>

        {/* Cart Button */}
        <button
          className="hp-header-btn hp-cart-btn"      
          onClick={() => navigate("/cart")}
          aria-label="Cart"
          data-role="cart-icon"
        >
          <FiShoppingCart className="hp-icon" />     
          {cartCount > 0 && (
            <span className="hp-badge">{cartCount > 9 ? "9+" : cartCount}</span>
          )}
        </button>
      </div>
    </header>
  );
};

// ============ SEARCH BAR COMPONENT ============
const HomeSearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/all-products?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form className="hp-search" onSubmit={handleSubmit}>
      <div className="hp-search-wrapper">
        <FiSearch className="hp-search-icon" />
        <input
          type="text"
          className="hp-search-input"
          placeholder="Search products, categories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            type="button"
            className="hp-search-clear"
            onClick={() => setQuery("")}
          >
            <FiX />
          </button>
        )}
      </div>
    </form>
  );
};

// ============ PROMO BANNER COMPONENT ============
const PromoBanner = () => {
  const navigate = useNavigate();

  return (
    <section className="hp-promo-section">
      <div className="hp-promo-banner">
        <div className="hp-promo-bg"></div>
        <div className="hp-promo-content">
          <div className="hp-promo-badge">
            <HiOutlineSparkles />
            <span>Limited Offer</span>
          </div>
          <h2 className="hp-promo-title">
            50% Off <br />
            <span>First Order!</span>
          </h2>
          <p className="hp-promo-text">
            Get amazing deals on your favorite products
          </p>
          <button
            className="hp-promo-btn"
            onClick={() => navigate("/all-products")}
          >
            <FiShoppingCart />
            Shop Now
            <FiArrowRight />
          </button>
        </div>
        <div className="hp-promo-visual">
          <div className="hp-promo-circle"></div>
          <div className="hp-promo-circle hp-promo-circle-2"></div>
        </div>
      </div>
    </section>
  );
};

// ============ QUICK ACTIONS COMPONENT - FIXED ============
const QuickActions = ({ onScanClick }) => {
  const navigate = useNavigate();
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState("");

  const handleActionClick = (action, e) => {
    // Prevent any default behavior
    e.preventDefault();
    e.stopPropagation();

    // ✅ Handle Scan - Check for isScan flag OR id === "scan"
    if (action.isScan || action.id === "scan") {
      console.log("Scan clicked!"); // Debug log
      if (onScanClick && typeof onScanClick === "function") {
        onScanClick();
      }
      return; // ✅ EXIT HERE - Don't continue
    }

    // ✅ Handle Coming Soon
    if (action.comingSoon === true) {
      console.log("Coming soon clicked:", action.label); // Debug log
      setComingSoonFeature(action.label);
      setShowComingSoon(true);
      return; // ✅ EXIT HERE - Don't navigate
    }

    // ✅ Handle Navigation - Only if path exists
    if (action.path) {
      console.log("Navigating to:", action.path); // Debug log
      navigate(action.path);
    }
  };

  const handleCloseModal = () => {
    setShowComingSoon(false);
    setComingSoonFeature("");
  };

  return (
    <>
      <section className="hp-quick-actions">
        <div className="hp-section-header">
          <h2 className="hp-section-title">Quick Actions</h2>
        </div>

        <div className="hp-quick-grid">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.id}
              type="button"
              className={`hp-quick-item ${action.comingSoon ? "coming-soon-item" : ""} ${action.isScan || action.id === "scan" ? "scan-action" : ""}`}
              onClick={(e) => handleActionClick(action, e)}
            >
              <div
                className="hp-quick-icon"
                style={{
                  backgroundColor: `${action.color}15`,
                  color: action.color,
                }}
              >
                {action.isScan || action.id === "scan" ? (
                  <Lottie
                    animationData={scanningAnimation}
                    loop
                    className="quick-scan-animation"
                  />
                ) : (
                  <action.icon />
                )}
              </div>
              <span className="hp-quick-label">{action.label}</span>

              {action.comingSoon && (
                <span className="hp-coming-soon-badge">Soon</span>
              )}
            </button>
          ))}
        </div>
      </section>

      <ComingSoonModal
        isOpen={showComingSoon}
        onClose={handleCloseModal}
        featureName={comingSoonFeature}
      />
    </>
  );
};

// ============ CATEGORIES COMPONENT ============
const CategoriesSection = () => {
  const navigate = useNavigate();

  return (
    <section className="hp-section">
      <div className="hp-section-header">
        <div className="hp-section-title-wrapper">
          <h2 className="hp-section-title">Shop by Category</h2>
          <Lottie
            animationData={cartAnimation}
            loop
            className="hp-section-animation"
          />
        </div>
        <button
          className="hp-view-all"
          onClick={() => navigate("/all-products")}
        >
          View All
          <FiChevronRight />
        </button>
      </div>

      <div className="hp-categories-grid">
        {CATEGORIES.map((category) => (
          <Link
            key={category.id}
            to={`/all-products?category=${category.id}`}
            className="hp-category-card"
          >
            <div className="hp-category-image-wrapper">
              {/* ✅ NEW */}
              <img
                src={imageUrl(category.image, 300, 300)}
                alt={category.name}
                onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER; }}
              />
              <div
                                className="hp-category-overlay"
                style={{
                  background: `linear-gradient(135deg, ${category.color}20, ${category.color}40)`,
                }}
              ></div>
            </div>
            <div className="hp-category-info">
              <category.icon
                className="hp-category-icon"
                style={{ color: category.color }}
              />
              <span className="hp-category-name">{category.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

// ============ FLASH SALE COMPONENT ============
const FlashSaleSection = ({ addToCart }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Countdown to end of day
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  const timeLeft = useCountdown(endOfDay.getTime());

  useEffect(() => {
    const loadFlashSales = async () => {
      try {
        const allProducts = await fetchProducts();
        const flashItems = (allProducts || []).filter(
          (p) => p.flash_sale === true || p.flashSale === true
        );
        setProducts(flashItems.slice(0, 6));
      } catch (err) {
        console.error("Failed to load flash sale:", err);
      } finally {
        setLoading(false);
      }
    };
    loadFlashSales();
  }, []);

  const handleAddToCart = async (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const identifier = product.slug ?? product.slug_field ?? product.id;
      if (!identifier) {
        toast.error("Product cannot be added");
        return;
      }
      await addToCart(identifier, 1, product.name);
      toast.success(`Added ${product.name} to cart!`);
      animateToCart(e.target.closest(".hp-product-card"));
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  };

  if (loading) {
    return (
      <section className="hp-section">
        <div className="hp-flash-loading">
          <Lottie
            animationData={FlashAnimation}
            loop
            className="hp-flash-loader"
          />
          <p>Loading hot deals...</p>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="hp-section hp-flash-section">
      <div className="hp-section-header">
        <div className="hp-flash-title-wrapper">
          <div className="hp-flash-icon">
            <FaFire />
          </div>
          <h2 className="hp-section-title">Flash Sale</h2>
          <div className="hp-countdown">
            <div className="hp-countdown-item">
              <span className="hp-countdown-value">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="hp-countdown-label">hrs</span>
            </div>
            <span className="hp-countdown-sep">:</span>
            <div className="hp-countdown-item">
              <span className="hp-countdown-value">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="hp-countdown-label">min</span>
            </div>
            <span className="hp-countdown-sep">:</span>
            <div className="hp-countdown-item">
              <span className="hp-countdown-value">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
              <span className="hp-countdown-label">sec</span>
            </div>
          </div>
        </div>
        <button className="hp-view-all" onClick={() => navigate("/flash-sale")}>
          View All
          <FiChevronRight />
        </button>
      </div>

      <div className="hp-products-scroll">
        {products.map((product) => {
          const price = Number(product.price);
          const oldPrice = product.old_price || Math.round(price * 1.2);
          const discount =
            oldPrice > price
              ? Math.round(((oldPrice - price) / oldPrice) * 100)
              : null;

          return (
            <Link
              key={product.id}
              to={`/product/${product.slug || product.id}`}
              className="hp-product-card"
            >
              {discount && (
                <div className="hp-product-badge">-{discount}%</div>
              )}
              <div className="hp-product-image-wrapper">
                {/* ✅ NEW — uses ImageKit */}
                <img
                  src={imageUrl(product.image_url || product.image)}
                  alt={product.name}
                  className="hp-product-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = PLACEHOLDER;
                  }}
                />
                <button
                  className="hp-product-wishlist"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toast.success("Added to wishlist!");
                  }}
                >
                  <FiHeart />
                </button>
              </div>
              <div className="hp-product-info">
                <h3 className="hp-product-name">{product.name}</h3>
                <div className="hp-product-price-row">
                  <span className="hp-product-price">
                    ₦{price.toLocaleString()}
                  </span>
                  {oldPrice > price && (
                    <span className="hp-product-old-price">
                      ₦{oldPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                <button
                  className="hp-product-add-btn"
                  onClick={(e) => handleAddToCart(product, e)}
                >
                  <FiPlus />
                  Add
                </button>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

// ============ FEATURES SECTION ============
const FeaturesSection = () => {
  const navigate = useNavigate();

  return (
    <section className="hp-section">
      <div className="hp-section-header">
        <h2 className="hp-section-title">Quick Access</h2>
      </div>

      <div className="hp-features-grid">
        <div
          className="hp-feature-card hp-feature-primary"
          onClick={() => navigate("/cart-page")}
        >
          <div className="hp-feature-animation">
            <Lottie animationData={SmartListAnimation} loop />
          </div>
          <div className="hp-feature-content">
            <h3 className="hp-feature-title">Smart Lists</h3>
            <p className="hp-feature-desc">Quickly reorder your favorites</p>
          </div>
          <FiChevronRight className="hp-feature-arrow" />
        </div>

        <div
          className="hp-feature-card hp-feature-secondary"
          onClick={() => navigate("/all-products")}
        >
          <div className="hp-feature-animation">
            <Lottie animationData={SubscriptionsAnimation} loop />
          </div>
          <div className="hp-feature-content">
            <h3 className="hp-feature-title">Subscriptions</h3>
            <p className="hp-feature-desc">Never run out of essentials</p>
          </div>
          <FiChevronRight className="hp-feature-arrow" />
        </div>
      </div>
    </section>
  );
};

// ============ TRUST BADGES ============
const TrustBadges = () => (
  <section className="hp-trust-section">
    <div className="hp-trust-grid">
      {FEATURES.map((feature, index) => (
        <div key={index} className="hp-trust-item">
          <div className="hp-trust-icon">
            <feature.icon />
          </div>
          <div className="hp-trust-text">
            <h4>{feature.title}</h4>
            <p>{feature.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

// ============ CART ANIMATION ============
function animateToCart(cardEl) {
  const img = cardEl?.querySelector("img");
  if (!img) return;

  const cartIcon =
    document.querySelector(".hp-cart-btn") ||
    document.querySelector('[data-role="cart-icon"]');

  if (!cartIcon) return;

  const imgRect = img.getBoundingClientRect();
  const cartRect = cartIcon.getBoundingClientRect();

  const flyingImg = img.cloneNode(true);
  flyingImg.style.cssText = `
    position: fixed;
    left: ${imgRect.left}px;
    top: ${imgRect.top}px;
    width: ${imgRect.width}px;
    height: ${imgRect.height}px;
    transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    z-index: 9999;
    border-radius: 8px;
    pointer-events: none;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  `;
  document.body.appendChild(flyingImg);

  requestAnimationFrame(() => {
    flyingImg.style.left = `${cartRect.left + cartRect.width / 2 - 20}px`;
    flyingImg.style.top = `${cartRect.top + cartRect.height / 2 - 20}px`;
    flyingImg.style.width = "40px";
    flyingImg.style.height = "40px";
    flyingImg.style.opacity = "0";
    flyingImg.style.transform = "scale(0.3)";
  });

  flyingImg.addEventListener("transitionend", () => flyingImg.remove());
}

// ============ MAIN HOMEPAGE COMPONENT ============
// ============ MAIN HOMEPAGE COMPONENT ============ 
export default function HomePage() {
  const navigate = useNavigate();
  const { cartCount, addToCart } = useCart();
  
  // ✅ FIXED: Safe access to SmartLists context with error handling
  let totalSmartListCount = 0;
  try {
    const smartListContext = useSmartLists();
    totalSmartListCount = smartListContext?.totalSmartListCount || 0;
  } catch (error) {
    console.warn('SmartLists context not available in HomePage:', error);
    totalSmartListCount = 0;
  }
  
  const { unreadCount } = useNotifications(); // ✅ Added notification context

  const [businessName, setBusinessName] = useState("");
  const [customerId, setCustomerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSetPinModal, setShowSetPinModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await API.get("/customers/profile/");
        if (!mounted) return;

        const name =
          res.data.business_name ||
          res.data.businessName ||
          res.data.business ||
          res.data.name ||
          "";

        setBusinessName(name);
        setCustomerId(res.data.id);

        if (res.data.has_pin === false || res.data.has_pin === null) {
          setTimeout(() => {
            setShowSetPinModal(true);
            toast("Please set your Transaction PIN for secure transactions.", {
              icon: "🔐",
              duration: 4000,
            });
          }, 800);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        if (mounted) setError("Unable to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      mounted = false;
    };
  }, []);

  // Handle Scan QR Click
  const handleScanClick = () => {
    // Option 1: Open a scanner modal
    // setShowScanner(true);
    
    // Option 2: Navigate to scan page
    setShowScanner(true);

    console.log("Scan clicked from Quick Actions!");
    
    // Option 3: Show toast for now
    // toast.success("QR Scanner opening...", { icon: "📷" });
  };

  if (loading) {
    return (
      <div className="hp-loading">
        <div className="hp-loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hp-error">
        <FiRefreshCw className="hp-error-icon" />
        <h3>Oops! Something went wrong</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="hp-page">
      <div className="hp-container">
        {/* Header */}
        <HomeHeader
          businessName={businessName}
          cartCount={cartCount}
          smartListCount={totalSmartListCount}
          navigate={navigate}
        />

        {/* Search Bar */}
        <HomeSearchBar />

        {/* Promo Banner */}
        <PromoBanner />

        {/* Quick Actions - Now with onScanClick prop */}
        <QuickActions onScanClick={handleScanClick} />

        {/* Categories */}
        <CategoriesSection />

        {/* Flash Sale */}
        <FlashSaleSection addToCart={addToCart} />

        {/* Features */}
        <FeaturesSection />

        {/* Trust Badges */}
        <TrustBadges />

        {/* Bottom Spacing for Nav */}
        <div className="hp-bottom-spacer"></div>
      </div>

      {/* Transaction PIN Modal */}
      <SetTransactionPinModal
        isOpen={showSetPinModal}
        onClose={() => setShowSetPinModal(false)}
        customerId={customerId}
        onSuccess={() => {
          toast.success("Transaction PIN set successfully!");
          setShowSetPinModal(false);
        }}
      />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}