// src/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../pages/CartContext";
import { useSmartLists } from "../pages/SmartListContext";
import { useNotifications } from "../context/NotificationContext";
import { fetchProducts } from "../services/products";
import Lottie from "lottie-react";
import BottomNav from "../components/BottomNav";
import scanningAnimation from "../assets/animations/scanning.json";
import ComingSoonModal from "../components/ComingSoonModal";
import { imageUrl, PLACEHOLDER } from '../utils/image';

// Icons
import {
  FiShoppingCart,
  FiSearch,
  FiBell,
  FiChevronRight,
  FiArrowRight,
  FiStar,
  FiTruck,
  FiShield,
  FiHeadphones,
  FiHeart,
  FiPlus,
  FiX,
  FiRefreshCw,
  FiList,
} from "react-icons/fi";
import {
  FaWineGlassAlt,
  FaPumpSoap,
  FaSpa,
  FaFire,
  FaQrcode,
  FaHistory,
  FaWallet,
} from "react-icons/fa";
import { LuCandy } from "react-icons/lu";
import { HiOutlineSparkles } from "react-icons/hi";
import { BiSupport } from "react-icons/bi";

// Animations
import cartAnimation from "../assets/animations/cart.json";
import FlashAnimation from "../assets/animations/flash.json";
import SmartListAnimation from "../assets/animations/smart-list.json";
import SubscriptionsAnimation from "../assets/animations/subscriptions.json";

// Components
import SetTransactionPinModal from "../components/SetTransactionPinModal";
import PromoSection from "../components/PromoSection";

import "../main.css";

// ============ CATEGORIES DATA ============
const CATEGORIES = [
  {
    id: "food",
    name: "Food",
    icon: LuCandy,
    image: "food/FOOD-CATEGORY-PHOTO.png",
  },
  {
    id: "beverage",
    name: "Beverages",
    icon: FaWineGlassAlt,
    image: "beverages/BEVERAGE-CATEGORY-PHOTO.png",
  },
  {
    id: "ZIZOU",
    name: "Zizou",
    icon: FaWineGlassAlt,
    image: "zizou/zizou-orange.jpeg",
  },
  {
    id: "care",
    name: "Care",
    icon: FaPumpSoap,
    image: "care/CARE-CATEGORY-PHOTO1.png",
  },
  {
    id: "beauty",
    name: "Beauty",
    icon: FaSpa,
    image: "beauty/CLASSY_JELLY_48PCS-100g.png",
  },
];

// ============ QUICK ACTIONS ============
const QUICK_ACTIONS = [
  {
    id: "scan",
    icon: FaQrcode,
    label: "Scan QR",
    color: "#1a1a1a",
    path: null,
    isScan: true,
  },
  {
    id: "orders",
    icon: FaHistory,
    label: "Orders",
    color: "#1a1a1a",
    path: "/orders",
  },
  {
    id: "wallet",
    icon: FaWallet,
    label: "Wallet",
    color: "#1a1a1a",
    path: null,
    comingSoon: true,
  },
  {
    id: "support",
    icon: BiSupport,
    label: "Support",
    color: "#1a1a1a",
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


// ============ HOME HEADER COMPONENT ============
const HomeHeader = ({ businessName, cartCount, smartListCount, navigate }) => {
  const { unreadCount } = useNotifications();

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
        <button
          className="hp-header-btn hp-notification-btn"
          onClick={() => navigate("/notifications")}
          aria-label="Notifications"
        >
          <FiBell className="hp-icon" />
          {unreadCount > 0 && (
            <span className="hp-badge notification-badge">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

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
const HomeSearchBar = () => {
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

// ============ PROMO BANNER COMPONENT (ORIGINAL YELLOW STYLE) ============
const PromoBanner = () => {
  const navigate = useNavigate();

  return (
    <section className="hp-promo-section">
      <div className="hp-promo-banner">
        <div className="hp-promo-bg"></div>

        {/* Watermark layer */}
        <div className="hp-promo-watermark" aria-hidden="true">
          {Array.from({ length: 15 }, (_, i) => (
            <span key={i} className="hp-watermark-text">
              ChiamoOrder
            </span>
          ))}
        </div>

        <div className="hp-promo-content">
          <div className="hp-promo-badge">
            <HiOutlineSparkles />
            <span>Limited Offer</span>
          </div>
          <h2 className="hp-promo-title">
            5% Off <br />
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

// ============ QUICK ACTIONS COMPONENT ============
const QuickActions = ({ onScanClick }) => {
  const navigate = useNavigate();
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState("");

  const handleActionClick = (action, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (action.isScan || action.id === "scan") {
      if (onScanClick && typeof onScanClick === "function") {
        onScanClick();
      }
      return;
    }

    if (action.comingSoon === true) {
      setComingSoonFeature(action.label);
      setShowComingSoon(true);
      return;
    }

    if (action.path) {
      navigate(action.path);
    }
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
              className={`hp-quick-item ${action.comingSoon ? "coming-soon-item" : ""}`}
              onClick={(e) => handleActionClick(action, e)}
            >
              <div className="hp-quick-icon">
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
        onClose={() => setShowComingSoon(false)}
        featureName={comingSoonFeature}
      />
    </>
  );
};

// ============ CATEGORIES COMPONENT (FIXED) ============
const CategoriesSection = () => {
  const navigate = useNavigate();

  return (
    <section className="hp-section hp-categories-section">
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

      <div className="hp-categories-scroll">
        {CATEGORIES.map((category) => (
          <Link
            key={category.id}
            to={`/all-products?category=${category.id}`}
            className="hp-category-item"
          >
            <div className="hp-category-img-wrapper">
              <img
                src={imageUrl(category.image, 200, 200)}
                alt={category.name}
                className="hp-category-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = PLACEHOLDER;
                }}
              />
            </div>
            <div className="hp-category-label">
              <category.icon className="hp-category-icon" />
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
          const originalPrice = Number(product.price);
          const flashPrice = product.flash_sale_price
            ? Number(product.flash_sale_price)
            : null;
          const displayPrice = flashPrice || originalPrice;
          const discount = flashPrice
            ? Math.round(((originalPrice - flashPrice) / originalPrice) * 100)
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
                    ₦{displayPrice.toLocaleString()}
                  </span>
                  {flashPrice && (
                    <span className="hp-product-old-price">
                      ₦{originalPrice.toLocaleString()}
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

// ============ MAIN HOMEPAGE COMPONENT ============
export default function HomePage() {
  const navigate = useNavigate();
  const { cartCount, addToCart, cart } = useCart();


  const smartListContext = useSmartLists();
  const totalSmartListCount = smartListContext?.totalSmartListCount || 0;

  const { unreadCount } = useNotifications();

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

  const handleScanClick = () => {
    setShowScanner(true);
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
        <HomeHeader
          businessName={businessName}
          cartCount={cartCount}
          smartListCount={totalSmartListCount}
          navigate={navigate}
        />

        <HomeSearchBar />

        <PromoBanner />

        <QuickActions onScanClick={handleScanClick} />

        <CategoriesSection />

        <FlashSaleSection addToCart={addToCart} />

        <PromoSection />

        <FeaturesSection />

        <TrustBadges />

        

        <div className="hp-bottom-spacer"></div>
      </div>

      <SetTransactionPinModal
        isOpen={showSetPinModal}
        onClose={() => setShowSetPinModal(false)}
        customerId={customerId}
        onSuccess={() => {
          toast.success("Transaction PIN set successfully!");
          setShowSetPinModal(false);
        }}
      />

      <BottomNav />
    </div>
  );
}