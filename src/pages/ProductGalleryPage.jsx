// ✅ src/pages/ProductGalleryPage.jsx
import React, { useState, useEffect, useRef } from "react";
import "./ProductGalleryPage.css";
import { categoryBanners } from "../components/data/categoryBanner";
import { allProducts as allProductData } from "../components/data/allproductData";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from "react-router-dom";
import {
  FiSearch, FiX, FiGrid, FiList, FiShoppingCart, FiHeart,
  FiEye, FiChevronLeft, FiChevronRight, FiArrowUp, FiFilter,
  FiChevronDown, FiHome, FiStar, FiPackage, FiTruck, FiShield,
  FiMoon, FiSun, FiDroplet, FiBox,
} from "react-icons/fi";
import {
  FaStar, FaStarHalfAlt, FaRegStar, FaFire, FaLeaf, FaCrown,
} from "react-icons/fa";
import { BiCookie, BiSprayCan, BiDrink } from "react-icons/bi";
import { RiDrinks2Line } from "react-icons/ri";
import { IoSparkles } from "react-icons/io5";
import { HiOutlineSparkles } from "react-icons/hi";
import { BiSortAlt2 } from "react-icons/bi";
import { MdLocalDrink, MdCleaningServices } from "react-icons/md";
import { GiLipstick, GiCookie, GiSodaCan } from "react-icons/gi";

// ============================================================
// 🔥 ADD YOUR IMAGEKIT BASE URL HERE (CHANGE THIS!)
// ============================================================
const IMG_BASE = "https://ik.imagekit.io/ljwnlcbqyu";

// ✅ Placeholder as a simple colored SVG (NO external file needed!)
const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect fill='%23f0f0f0' width='400' height='400'/%3E%3Ctext fill='%23999' font-family='Arial' font-size='18' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EImage Not Available%3C/text%3E%3C/svg%3E";

const PLACEHOLDER_BANNER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='400' viewBox='0 0 1200 400'%3E%3Crect fill='%23e8e8e8' width='1200' height='400'/%3E%3Ctext fill='%23999' font-family='Arial' font-size='24' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EBanner Loading...%3C/text%3E%3C/svg%3E";

// ============ SIMPLIFIED CATEGORIES ============
const CATEGORIES = [
  { id: "all", name: "All" },
  { id: "Beverage", name: "Beverages" },
  { id: "Food", name: "Food" },
  { id: "Care", name: "Care" },
  { id: "Zizou", name: "Zizou" },
  { id: "Beauty", name: "Beauty" },
];

// ============ SIMPLE CATEGORY TABS COMPONENT ============
const CategoryTabs = ({ categories, selected, onSelect }) => {
  return (
    <div className="category-tabs">
      <div className="category-tabs-inner">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-tab ${selected === cat.id ? "active" : ""}`}
            onClick={() => onSelect(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
};

const SORT_OPTIONS = [
  { id: "default", name: "Default" },
  { id: "name-asc", name: "Name (A-Z)" },
  { id: "name-desc", name: "Name (Z-A)" },
  { id: "price-low", name: "Price (Low to High)" },
  { id: "price-high", name: "Price (High to Low)" },
];

// ============ HELPER FUNCTIONS ============
const getRandomRating = () => (Math.random() * 2 + 3).toFixed(1);
const getRandomReviews = () => Math.floor(Math.random() * 500) + 10;
const getRandomBadge = () => {
  const badges = ["hot", "new", "sale", "organic", "premium", null, null, null];
  return badges[Math.floor(Math.random() * badges.length)];
};

// ============================================================
// ✅ FIXED: Universal image source handler
// ============================================================
const getImageSrc = (raw, cat) => {
  if (!raw) return PLACEHOLDER_IMG;
  let val = String(raw).trim();

  // ✅ Already a full URL (ImageKit, Cloudinary, etc.) — use as-is
  if (/^https?:\/\//i.test(val)) return val;

  // ✅ Still a local path? Convert to ImageKit URL
  // Remove leading slash or "assets/images/categories/" prefix
  val = val
    .replace(/^\/+/, "")
    .replace(/^assets\/images\/categories\//, "")
    .replace(/^assets\/images\//, "");

  return encodeURI(`${IMG_BASE}/${val}`);
};

// ✅ FIXED: Error handler that NEVER causes infinite loop
const handleImgError = (e) => {
  e.currentTarget.onerror = null; // prevent infinite loop
  e.currentTarget.src = PLACEHOLDER_IMG;
};

const handleBannerError = (e) => {
  e.currentTarget.onerror = null; // prevent infinite loop
  e.currentTarget.src = PLACEHOLDER_BANNER;
};

// ============ THEME TOGGLE COMPONENT ============
const ThemeToggle = ({ theme, toggleTheme }) => {
  return (
    <button
      className={`theme-toggle ${theme}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      <div className="toggle-track">
        <div className="toggle-icons">
          <FiSun className="sun-icon" />
          <FiMoon className="moon-icon" />
        </div>
        <div className="toggle-thumb" />
      </div>
    </button>
  );
};

// ============ SEARCH BAR COMPONENT ============
const SearchBar = ({ query, setQuery, resultsCount }) => {
  const inputRef = useRef(null);

  return (
    <div className="search-container">
      <div className="search-wrapper">
        <FiSearch className="search-icon" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search products, categories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        {query && (
          <button
            className="search-clear"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
          >
            <FiX />
          </button>
        )}
      </div>
      {query && (
        <span className="search-results-count">
          {resultsCount} results found
        </span>
      )}
    </div>
  );
};

// ============ CATEGORY PILLS COMPONENT ============
const CategoryPills = ({ categories, selected, onSelect }) => {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 150;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener("resize", handleScroll);
    return () => window.removeEventListener("resize", handleScroll);
  }, []);

  return (
    <div className="category-pills-container">
      {showLeftArrow && (
        <button
          className="category-scroll-btn left"
          onClick={() => scroll("left")}
          aria-label="Scroll left"
        >
          <FiChevronLeft />
        </button>
      )}
      <div
        className="category-pills-wrapper"
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {categories.map((cat) => {
          const IconComponent = cat.icon;
          return (
            <button
              key={cat.id}
              className={`category-pill ${selected === cat.id ? "active" : ""}`}
              onClick={() => onSelect(cat.id)}
            >
              <IconComponent className="category-icon" />
              <span className="category-name">{cat.name}</span>
            </button>
          );
        })}
      </div>
      {showRightArrow && (
        <button
          className="category-scroll-btn right"
          onClick={() => scroll("right")}
          aria-label="Scroll right"
        >
          <FiChevronRight />
        </button>
      )}
    </div>
  );
};

// ============ PRODUCT BADGE COMPONENT ============
const ProductBadge = ({ type }) => {
  if (!type) return null;
  const badges = {
    hot: { icon: <FaFire />, text: "Hot", className: "badge-hot" },
    new: { icon: <HiOutlineSparkles />, text: "New", className: "badge-new" },
    sale: { icon: null, text: "Sale", className: "badge-sale" },
    organic: { icon: <FaLeaf />, text: "Organic", className: "badge-organic" },
    premium: { icon: <FaCrown />, text: "Premium", className: "badge-premium" },
  };
  const badge = badges[type];
  if (!badge) return null;
  return (
    <span className={`product-badge ${badge.className}`}>
      {badge.icon}
      {badge.text}
    </span>
  );
};

// ============ RATING STARS COMPONENT ============
const RatingStars = ({ rating, reviews }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
  return (
    <div className="rating-container">
      <div className="stars">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className="star filled" />
        ))}
        {hasHalf && <FaStarHalfAlt className="star filled" />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={`empty-${i}`} className="star empty" />
        ))}
      </div>
      <span className="rating-text">
        {rating} ({reviews})
      </span>
    </div>
  );
};

// ============ PRODUCT CARD COMPONENT ============
const ProductCard = ({ product, viewMode, onAddToCart, onQuickView }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const category =
    typeof product.category === "string"
      ? product.category
      : product.category?.name || "";

  const imageSource = product.image ?? product.image_url ?? "";

  const rating = product.rating || getRandomRating();
  const reviews = product.reviews || getRandomReviews();
  const badge = product.badge || getRandomBadge();
  const discount = product.discount || (badge === "sale" ? Math.floor(Math.random() * 30) + 10 : null);
  const originalPrice = discount ? Math.round(product.price / (1 - discount / 100)) : null;
  const inStock = product.inStock !== false;

  return (
    <div className={`product-card ${viewMode} ${!inStock ? "out-of-stock" : ""}`}>
      <div className="product-image-container">
        {!imageLoaded && <div className="image-skeleton" />}
        <img
          src={getImageSrc(imageSource, category)}
          alt={product.name}
          className={`product-image ${imageLoaded ? "loaded" : ""}`}
          onLoad={() => setImageLoaded(true)}
          onError={handleImgError}
        />
        <ProductBadge type={badge} />
        <div className="product-actions">
          <button
            className={`action-btn wishlist ${isLiked ? "liked" : ""}`}
            onClick={() => setIsLiked(!isLiked)}
            title="Add to Wishlist"
          >
            <FiHeart />
          </button>
          <button
            className="action-btn quick-view"
            onClick={() => onQuickView(product)}
            title="Quick View"
          >
            <FiEye />
          </button>
        </div>
        {!inStock && <div className="out-of-stock-overlay">Out of Stock</div>}
      </div>
      <div className="product-info">
        <span className="product-category">{category}</span>
        <h3 className="product-name">{product.name}</h3>
        <RatingStars rating={parseFloat(rating)} reviews={reviews} />
        <div className="product-pricing">
          <span className="current-price">₦{product.price?.toLocaleString()}</span>
          {originalPrice && (
            <span className="original-price">₦{originalPrice.toLocaleString()}</span>
          )}
          {discount && <span className="discount-tag">-{discount}%</span>}
        </div>
        <button
          className="add-to-cart-btn"
          onClick={() => onAddToCart(product)}
          disabled={!inStock}
        >
          <FiShoppingCart />
          <span>{inStock ? "Add to Cart" : "Out of Stock"}</span>
        </button>
      </div>
    </div>
  );
};

// ============ QUICK VIEW MODAL ============
const QuickViewModal = ({ product, onClose, onAddToCart }) => {
  if (!product) return null;

  const category =
    typeof product.category === "string"
      ? product.category
      : product.category?.name || "";

  const imageSource = product.image ?? product.image_url ?? "";
  const rating = product.rating || getRandomRating();
  const reviews = product.reviews || getRandomReviews();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="quick-view-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <FiX />
        </button>
        <div className="modal-content">
          <div className="modal-image">
            <img
              src={getImageSrc(imageSource, category)}
              alt={product.name}
              onError={handleImgError}
            />
          </div>
          <div className="modal-details">
            <span className="modal-category">{category}</span>
            <h2 className="modal-name">{product.name}</h2>
            <RatingStars rating={parseFloat(rating)} reviews={reviews} />
            <div className="modal-price">
              <span className="price">₦{product.price?.toLocaleString()}</span>
            </div>
            <p className="modal-description">
              {product.description ||
                "Premium quality product from our trusted suppliers. Experience the best with ChiamoOrder."}
            </p>
            <div className="modal-features">
              <div className="feature">
                <FiTruck />
                <span>Fast Delivery</span>
              </div>
              <div className="feature">
                <FiShield />
                <span>Quality Guaranteed</span>
              </div>
              <div className="feature">
                <FiPackage />
                <span>Secure Packaging</span>
              </div>
            </div>
            <button
              className="modal-add-btn"
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
            >
              <FiShoppingCart />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ BACK TO TOP BUTTON ============
const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 300);
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <button
      className={`back-to-top ${isVisible ? "visible" : ""}`}
      onClick={scrollToTop}
      aria-label="Back to top"
    >
      <FiArrowUp />
    </button>
  );
};

// ============ MAIN COMPONENT ============
export default function ProductGalleryPage() {
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState("light");
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("default");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      if (Array.isArray(allProductData)) {
        setAllProducts(allProductData);
        setFilteredProducts(allProductData);
      } else {
        setAllProducts([]);
        setFilteredProducts([]);
      }
      setIsLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("gallery-theme");
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("gallery-theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  useEffect(() => {
    let results = [...allProducts];
    if (selectedCategory !== "all") {
      results = results.filter((p) => {
        const cat = String(
          typeof p.category === "string" ? p.category : p.category?.name || ""
        ).toLowerCase();
        return cat.includes(selectedCategory.toLowerCase());
      });
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      results = results.filter((p) => {
        const name = String(p.name || "").toLowerCase();
        const cat = String(
          typeof p.category === "string" ? p.category : p.category?.name || ""
        ).toLowerCase();
        return name.includes(q) || cat.includes(q);
      });
    }
    switch (sortBy) {
      case "name-asc":
        results.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "name-desc":
        results.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
      case "price-low":
        results.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-high":
        results.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      default:
        break;
    }
    setFilteredProducts(results);
  }, [allProducts, selectedCategory, query, sortBy]);

  const handleAddToCart = (product) => {
    setToastMessage(`🛑 Please register to add "${product.name}" to cart.`);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4500,
    arrows: true,
    fade: true,
    pauseOnHover: true,
  };

  // ✅ FIXED: Default banners now use ImageKit URLs
  const defaultBanners = [
    `${IMG_BASE}/banners/MAMUDA-FOODS.png`,
    `${IMG_BASE}/banners/MAMUDA-BEVERAGES.png`,
    `${IMG_BASE}/banners/MAMUDA-FOOD-AD5.png`,
  ];

  return (
    <div className={`gallery-page ${theme}`} data-theme={theme}>
      {/* ===== HEADER ===== */}
      <header className="gallery-header">
        <div className="header-container">
          <div className="header-left">
            <button className="back-btn" onClick={() => navigate("/")}>
              <FiChevronLeft />
              <span>Back</span>
            </button>
            <div className="breadcrumb">
              <FiHome />
              <span>/</span>
              <span className="current">Product Gallery</span>
            </div>
          </div>
          <div className="header-center">
            <h1 className="gallery-title">
              <FiPackage className="title-icon" />
              Product Gallery
            </h1>
          </div>
          <div className="header-right">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </div>
        </div>
      </header>

      {/* ===== HERO BANNER (FIXED!) ===== */}
      <section className="hero-banner-section">
        <div className="hero-banner">
          <Slider {...sliderSettings}>
            {selectedCategory !== "all" && categoryBanners[selectedCategory]
              ? (Array.isArray(categoryBanners[selectedCategory])
                  ? categoryBanners[selectedCategory]
                  : [categoryBanners[selectedCategory]]
                ).map((img, idx) => (
                  <div key={idx} className="banner-slide">
                    <img
                      src={getImageSrc(img)}
                      alt={`${selectedCategory} banner ${idx + 1}`}
                      className="banner-image"
                      onError={handleBannerError}
                    />
                    <div className="banner-overlay">
                      <h2>Explore {selectedCategory}</h2>
                      <p>Discover amazing products at great prices</p>
                    </div>
                  </div>
                ))
              : defaultBanners.map((img, idx) => (
                  <div key={idx} className="banner-slide">
                    <img
                      src={img}
                      alt={`banner-${idx + 1}`}
                      className="banner-image"
                      onError={handleBannerError}
                    />
                    <div className="banner-overlay">
                      <h2>Welcome to Our Store</h2>
                      <p>Shop smarter, Order faster with ChiamoOrder</p>
                    </div>
                  </div>
                ))}
          </Slider>
        </div>
      </section>

      {/* ===== MAIN CONTENT ===== */}
      <main className="gallery-main">
        <div className="main-container">
          <SearchBar
            query={query}
            setQuery={setQuery}
            resultsCount={filteredProducts.length}
          />
          <CategoryTabs
            categories={CATEGORIES}
            selected={selectedCategory}
            onSelect={handleCategorySelect}
          />
          <div className="gallery-toolbar">
            <div className="toolbar-left">
              <span className="products-count">
                <strong>{filteredProducts.length}</strong> products found
              </span>
            </div>
            <div className="toolbar-right">
              <div className="sort-dropdown-container">
                <button
                  className="sort-btn"
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                >
                  <BiSortAlt2 />
                  <span>Sort by</span>
                  <FiChevronDown
                    className={`chevron ${showSortDropdown ? "open" : ""}`}
                  />
                </button>
                {showSortDropdown && (
                  <div className="sort-dropdown">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        className={`sort-option ${
                          sortBy === option.id ? "active" : ""
                        }`}
                        onClick={() => {
                          setSortBy(option.id);
                          setShowSortDropdown(false);
                        }}
                      >
                        {option.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                  onClick={() => setViewMode("grid")}
                  title="Grid View"
                >
                  <FiGrid />
                </button>
                <button
                  className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                  onClick={() => setViewMode("list")}
                  title="List View"
                >
                  <FiList />
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="products-loading">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="product-skeleton">
                  <div className="skeleton-image" />
                  <div className="skeleton-content">
                    <div className="skeleton-line short" />
                    <div className="skeleton-line" />
                    <div className="skeleton-line medium" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="no-products">
              <div className="no-products-icon">🔍</div>
              <h3>No products found</h3>
              <p>Try adjusting your search or filter criteria</p>
              <button
                className="reset-filters-btn"
                onClick={() => {
                  setQuery("");
                  setSelectedCategory("all");
                  setSortBy("default");
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className={`products-container ${viewMode}`}>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id || product.name}
                  product={product}
                  viewMode={viewMode}
                  onAddToCart={handleAddToCart}
                  onQuickView={setQuickViewProduct}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ===== FEATURES BANNER ===== */}
      <section className="features-banner">
        <div className="features-container">
          <div className="feature-item">
            <div className="feature-icon"><FiTruck /></div>
            <div className="feature-text">
              <h4>Fast Delivery</h4>
              <p>Quick and reliable shipping</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon"><FiShield /></div>
            <div className="feature-text">
              <h4>Secure Payment</h4>
              <p>100% secure transactions</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon"><FiStar /></div>
            <div className="feature-text">
              <h4>Quality Products</h4>
              <p>Only the best for you</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon"><FiPackage /></div>
            <div className="feature-text">
              <h4>Easy Returns</h4>
              <p>Hassle-free return policy</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="gallery-footer">
        <div className="footer-content">
          <p>© {new Date().getFullYear()} ChiamoOrder. All rights reserved.</p>
          <p className="footer-tagline">Shop Smarter, Order Faster</p>
        </div>
      </footer>

      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}
      {toastMessage && (
        <div className="toast-notification">
          <span>{toastMessage}</span>
        </div>
      )}
      <BackToTop />
      {showSortDropdown && (
        <div
          className="dropdown-backdrop"
          onClick={() => setShowSortDropdown(false)}
        />
      )}
    </div>
  );
}