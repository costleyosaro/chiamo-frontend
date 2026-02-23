// src/pages/AllProducts.jsx - Complete Version (Uses Global Theme - No Local Toggle)
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "./CartContext";
import { useSmartLists } from "./SmartListContext";
import { fetchProducts } from "../services/products";
import { categoryBanners } from "../components/data/categoryBanner";
import Slider from "react-slick";
import toast from "react-hot-toast";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./AllProducts.css";
import { imageUrl, PLACEHOLDER } from '../utils/image';


// Icons
import {
  FiSearch,
  FiX,
  FiGrid,
  FiList,
  FiShoppingCart,
  FiHeart,
  FiEye,
  FiChevronLeft,
  FiChevronDown,
  FiArrowUp,
  FiHome,
  FiStar,
  FiPackage,
  FiTruck,
  FiShield,
  FiPlus,
  FiMinus,
  FiCheck,
} from "react-icons/fi";
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaFire,
  FaLeaf,
  FaCrown,
} from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi";
import { BiSortAlt2 } from "react-icons/bi";

// ============ CONSTANTS ============
const CATEGORIES = [
  { id: "all", name: "All" },
  { id: "beverage", name: "Beverages" },
  { id: "food", name: "Food" },
  { id: "care", name: "Care" },
  { id: "beauty", name: "Beauty" },
  { id: "ZIZOU", name: "Zizou" },
];

const SORT_OPTIONS = [
  { id: "default", name: "Default" },
  { id: "name-asc", name: "Name (A-Z)" },
  { id: "name-desc", name: "Name (Z-A)" },
  { id: "price-low", name: "Price: Low to High" },
  { id: "price-high", name: "Price: High to Low" },
  { id: "newest", name: "Newest First" },
];

// ============ HELPER FUNCTIONS ============

const getRandomBadge = () => {
  const badges = ["hot", "new", "sale", "organic", "premium", null, null, null];
  return badges[Math.floor(Math.random() * badges.length)];
};

const getRandomRating = () => (Math.random() * 2 + 3).toFixed(1);
const getRandomReviews = () => Math.floor(Math.random() * 500) + 10;

// ============ SEARCH BAR COMPONENT ============
const SearchBar = ({ query, setQuery, resultsCount }) => {
  const inputRef = useRef(null);

  return (
    <div className="ap-search-container">
      <div className="ap-search-wrapper">
        <FiSearch className="ap-search-icon" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search products, categories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="ap-search-input"
        />
        {query && (
          <button
            className="ap-search-clear"
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
        <span className="ap-search-results-count">
          {resultsCount} results found
        </span>
      )}
    </div>
  );
};

// ============ CATEGORY TABS COMPONENT ============
const CategoryTabs = ({ categories, selected, onSelect }) => {
  return (
    <div className="ap-category-tabs">
      <div className="ap-category-tabs-inner">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`ap-category-tab ${selected === cat.id ? "active" : ""}`}
            onClick={() => onSelect(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
};

// ============ PRODUCT BADGE COMPONENT ============
const ProductBadge = ({ type }) => {
  if (!type) return null;

  const badges = {
    hot: { icon: <FaFire />, text: "Hot", className: "ap-badge-hot" },
    new: { icon: <HiOutlineSparkles />, text: "New", className: "ap-badge-new" },
    sale: { icon: null, text: "Sale", className: "ap-badge-sale" },
    organic: { icon: <FaLeaf />, text: "Organic", className: "ap-badge-organic" },
    premium: { icon: <FaCrown />, text: "Premium", className: "ap-badge-premium" },
  };

  const badge = badges[type];
  if (!badge) return null;

  return (
    <span className={`ap-product-badge ${badge.className}`}>
      {badge.icon}
      {badge.text}
    </span>
  );
};

// ============ RATING STARS COMPONENT ============
const RatingStars = ({ rating, reviews, onRate, productId, readonly = false }) => {
  const numRating = parseFloat(rating) || 0;
  const fullStars = Math.floor(numRating);
  const hasHalf = numRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="ap-rating-container">
      <div className="ap-stars">
        {[...Array(fullStars)].map((_, i) => (
          <button
            key={`full-${i}`}
            type="button"
            className="ap-star filled"
            onClick={() => !readonly && onRate && onRate(productId, i + 1)}
            disabled={readonly}
          >
            <FaStar />
          </button>
        ))}
        {hasHalf && (
          <button
            type="button"
            className="ap-star filled"
            onClick={() => !readonly && onRate && onRate(productId, fullStars + 1)}
            disabled={readonly}
          >
            <FaStarHalfAlt />
          </button>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <button
            key={`empty-${i}`}
            type="button"
            className="ap-star empty"
            onClick={() => !readonly && onRate && onRate(productId, fullStars + (hasHalf ? 1 : 0) + i + 1)}
            disabled={readonly}
          >
            <FaRegStar />
          </button>
        ))}
      </div>
      <span className="ap-rating-text">
        {numRating.toFixed(1)} ({reviews || 0})
      </span>
    </div>
  );
};

// ============ PRODUCT CARD COMPONENT ============
const ProductCard = ({
  product, viewMode, rating, onRate, onAddToCart, onWishlist, onQuickView,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // Extract category name
  const category =
    typeof product.category === "string"
      ? product.category
      : product.category?.name || "";

  // ✅ FIX: Get image source using imageUrl()
  const imageSrc = imageUrl(product.image ?? product.image_url ?? '');

  // Calculate pricing
  const price = Number(product.price) || 0;
  const oldPrice = product.old_price ? Number(product.old_price) : null;
  const discount = oldPrice
    ? Math.round(((oldPrice - price) / oldPrice) * 100)
    : null;

  // Get badge and reviews
  const badge = product.badge || getRandomBadge();
  const reviews = product.reviews || getRandomReviews();
  const inStock = product.stock !== 0;

  // ✅ FIX: Handle image error (was syntax error before!)
  const handleImgError = (e) => {
    e.target.onerror = null;
    e.target.src = PLACEHOLDER;
  };


  // Handle add to cart
  const handleAdd = async (e) => {
    if (!inStock) return;
    setIsAdding(true);
    try {
      await onAddToCart(e, product, quantity);
    } finally {
      setIsAdding(false);
      setQuantity(1);
    }
  };

  // Handle wishlist click
  const handleWishlistClick = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    onWishlist(product);
  };

  // Handle quick view click
  const handleQuickViewClick = (e) => {
    e.stopPropagation();
    onQuickView(product);
  };

  return (
    <div
      className={`ap-product-card ${viewMode} ${!inStock ? "out-of-stock" : ""}`}
    >
      {/* Image Container */}
      <div className="ap-product-image-container">
        {/* Loading Skeleton */}
        {!imageLoaded && <div className="ap-image-skeleton" />}

        {/* Product Image */}
        <img
          src={imageSrc}
          alt={product.name}
          className={`ap-product-image ${imageLoaded ? "loaded" : ""}`}
          onLoad={() => setImageLoaded(true)}
          onError={handleImgError}
          loading="lazy"
        />

        {/* Badge */}
        <ProductBadge type={badge} />

        {/* Discount Tag */}
        {discount && <span className="ap-discount-tag">-{discount}%</span>}

        {/* Hover Actions */}
        <div className="ap-product-actions">
          <button
            className={`ap-action-btn wishlist ${isLiked ? "liked" : ""}`}
            onClick={handleWishlistClick}
            title="Add to Wishlist"
          >
            <FiHeart />
          </button>
          <button
            className="ap-action-btn quick-view"
            onClick={handleQuickViewClick}
            title="Quick View"
          >
            <FiEye />
          </button>
        </div>

        {/* Out of Stock Overlay */}
        {!inStock && (
          <div className="ap-out-of-stock-overlay">Out of Stock</div>
        )}
      </div>

      {/* Product Info */}
      <div className="ap-product-info">
        {/* Category */}
        <span className="ap-product-category">{category}</span>

        {/* Name */}
        <h3 className="ap-product-name">{product.name}</h3>

        {/* Rating */}
        <RatingStars
          rating={rating || 0}
          reviews={reviews}
          onRate={onRate}
          productId={product.id}
        />

        {/* Pricing */}
        <div className="ap-product-pricing">
          <span className="ap-current-price">₦{price.toLocaleString()}</span>
          {oldPrice && (
            <span className="ap-original-price">
              ₦{oldPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Quantity Selector (List View Only) */}
        {viewMode === "list" && inStock && (
          <div className="ap-quantity-row">
            <div className="ap-quantity-selector">
              <button
                type="button"
                className="ap-qty-btn"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <FiMinus />
              </button>
              <span className="ap-qty-value">{quantity}</span>
              <button
                type="button"
                className="ap-qty-btn"
                onClick={() => setQuantity(quantity + 1)}
              >
                <FiPlus />
              </button>
            </div>
          </div>
        )}

        {/* Add to Cart Button */}
        <button
          className={`ap-add-to-cart-btn ${isAdding ? "loading" : ""}`}
          onClick={handleAdd}
          disabled={!inStock || isAdding}
        >
          {isAdding ? (
            <span className="ap-btn-loader"></span>
          ) : (
            <>
              <FiShoppingCart />
              <span>{inStock ? "Add to Cart" : "Out of Stock"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ============ QUICK VIEW MODAL COMPONENT ============
const QuickViewModal = ({ product, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Return null if no product
  if (!product) return null;

  // Extract category name
  const category =
    typeof product.category === "string"
      ? product.category
      : product.category?.name || "";

  // Get image source
  const imageSrc = imageUrl(product.image ?? product.image_url ?? '');

  // Calculate pricing
  const price = Number(product.price) || 0;
  const oldPrice = product.old_price ? Number(product.old_price) : null;
  const discount = oldPrice
    ? Math.round(((oldPrice - price) / oldPrice) * 100)
    : null;

  // Get rating and reviews
  const rating = product.rating || getRandomRating();
  const reviews = product.reviews || getRandomReviews();
  const inStock = product.stock !== 0;

  // Handle image error
  const handleImgError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = PLACEHOLDER;
  };

  // Handle add to cart
  const handleAddToCart = (e) => {
    onAddToCart(e, product, quantity);
    onClose();
  };

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="ap-modal-overlay" onClick={handleOverlayClick}>
      <div className="ap-quick-view-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="ap-modal-close" onClick={onClose}>
          <FiX />
        </button>

        {/* Modal Content */}
        <div className="ap-modal-content">
          {/* Image Section */}
          <div className="ap-modal-image">
            {!imageLoaded && <div className="ap-modal-image-skeleton" />}
            <img
              src={imageSrc}
              alt={product.name}
              onLoad={() => setImageLoaded(true)}
              onError={handleImgError}
              style={{ opacity: imageLoaded ? 1 : 0 }}
            />
          </div>

          {/* Details Section */}
          <div className="ap-modal-details">
            {/* Category */}
            <span className="ap-modal-category">{category}</span>

            {/* Name */}
            <h2 className="ap-modal-name">{product.name}</h2>

            {/* Rating */}
            <RatingStars
              rating={parseFloat(rating)}
              reviews={reviews}
              readonly={true}
            />

            {/* Price */}
            <div className="ap-modal-price">
              <span className="ap-price">₦{price.toLocaleString()}</span>
              {oldPrice && (
                <span className="ap-modal-old-price">
                  ₦{oldPrice.toLocaleString()}
                </span>
              )}
              {discount && (
                <span className="ap-modal-discount">-{discount}%</span>
              )}
            </div>

            {/* Description */}
            <p className="ap-modal-description">
              {product.description ||
                "Premium quality product from our trusted suppliers. Experience the best with ChiamoOrder."}
            </p>

            {/* Features */}
            <div className="ap-modal-features">
              <div className="ap-feature">
                <FiTruck />
                <span>Fast Delivery</span>
              </div>
              <div className="ap-feature">
                <FiShield />
                <span>Quality Guaranteed</span>
              </div>
              <div className="ap-feature">
                <FiPackage />
                <span>Secure Packaging</span>
              </div>
            </div>

            {/* Stock Status */}
            {!inStock ? (
              <div className="ap-modal-stock-status out">
                <span>Out of Stock</span>
              </div>
            ) : product.stock <= 10 ? (
              <div className="ap-modal-stock-status low">
                <span>Only {product.stock} left in stock!</span>
              </div>
            ) : null}

            {/* Quantity Selector */}
            {inStock && (
              <div className="ap-modal-quantity">
                <span className="ap-modal-quantity-label">Quantity:</span>
                <div className="ap-quantity-selector">
                  <button
                    type="button"
                    className="ap-qty-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <FiMinus />
                  </button>
                  <span className="ap-qty-value">{quantity}</span>
                  <button
                    type="button"
                    className="ap-qty-btn"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={product.stock && quantity >= product.stock}
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <button
              className="ap-modal-add-btn"
              onClick={handleAddToCart}
              disabled={!inStock}
            >
              <FiShoppingCart />
              {inStock ? `Add to Cart - ₦${(price * quantity).toLocaleString()}` : "Out of Stock"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ LOADING SKELETON COMPONENT ============
const ProductSkeleton = ({ viewMode }) => (
  <div className={`ap-product-card ${viewMode} skeleton`}>
    <div className="ap-product-image-container">
      <div className="ap-skeleton-image" />
    </div>
    <div className="ap-product-info">
      <div className="ap-skeleton-content">
        <div className="ap-skeleton-line short" />
        <div className="ap-skeleton-line" />
        <div className="ap-skeleton-line medium" />
        <div className="ap-skeleton-line short" />
        <div className="ap-skeleton-btn" />
      </div>
    </div>
  </div>
);

// ============ EMPTY STATE COMPONENT ============
const EmptyState = ({ query, onClear }) => (
  <div className="ap-no-products">
    <div className="ap-no-products-icon">🔍</div>
    <h3>No products found</h3>
    <p>
      {query
        ? `We couldn't find any products matching "${query}"`
        : "No products available in this category"}
    </p>
    {query && (
      <button className="ap-reset-filters-btn" onClick={onClear}>
        Clear Search
      </button>
    )}
  </div>
);

// ============ BACK TO TOP BUTTON COMPONENT ============
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
      className={`ap-back-to-top ${isVisible ? "visible" : ""}`}
      onClick={scrollToTop}
      aria-label="Back to top"
    >
      <FiArrowUp />
    </button>
  );
};

// ============ MAIN COMPONENT ============
export default function AllProducts() {
  const navigate = useNavigate();
  const location = useLocation();
  const cartIconRef = useRef(null);

  // Context
  const { addToCart: addToCartContext, cartCount } = useCart();
  const { addToActiveList, activeList, saveActiveList } = useSmartLists();

  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [viewMode, setViewMode] = useState("grid");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [ratings, setRatings] = useState({});
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Get category from URL
  const queryParams = new URLSearchParams(location.search);
  const urlCategory = queryParams.get("category");
  const [selectedCategory, setSelectedCategory] = useState(urlCategory || "all");

  // ============ EFFECTS ============

  // Fetch products on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts();
        const productsArray = Array.isArray(data) ? data : [];
        setProducts(productsArray);

        // Initialize ratings
        const ratingsMap = {};
        productsArray.forEach((p) => {
          ratingsMap[p.id] = p.rating || parseFloat(getRandomRating());
        });
        setRatings(ratingsMap);
      } catch (err) {
        console.error("Error loading products:", err);
        toast.error("Failed to load products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Update category when URL changes
  useEffect(() => {
    if (urlCategory) {
      setSelectedCategory(urlCategory);
    }
  }, [urlCategory]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showSortDropdown && !e.target.closest(".ap-sort-dropdown-container")) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showSortDropdown]);

  // ============ MEMOIZED VALUES ============

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by category
    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter((p) => {
        const catName =
          typeof p.category === "string"
            ? p.category
            : p.category?.name || "";
        return catName.toLowerCase() === selectedCategory.toLowerCase();
      });
    }

    // Filter by search query
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter((p) => {
        const name = String(p.name || "").toLowerCase();
        const cat =
          typeof p.category === "string"
            ? p.category.toLowerCase()
            : (p.category?.name || "").toLowerCase();
        const desc = String(p.description || "").toLowerCase();
        return name.includes(q) || cat.includes(q) || desc.includes(q);
      });
    }

    // Sort
    switch (sortBy) {
      case "name-asc":
        result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "name-desc":
        result.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
      case "price-low":
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-high":
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "newest":
        result.sort((a, b) => (b.id || 0) - (a.id || 0));
        break;
      default:
        break;
    }

    return result;
  }, [products, selectedCategory, query, sortBy]);

  // ============ HANDLERS ============

  // Handle rating
  const handleRate = (id, newRating) => {
    setRatings((prev) => ({ ...prev, [id]: newRating }));
    toast.success(`Rated ${newRating} stars!`);
  };

  // Handle category selection
  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    setQuery(""); // Clear search when changing category
    if (catId === "all") {
      navigate("/all-products");
    } else {
      navigate(`/all-products?category=${catId}`);
    }
  };

  // Handle add to cart
  const handleAddToCart = async (e, product, quantity = 1) => {
    if (product.stock === 0) {
      toast.error(`${product.name} is out of stock`);
      return;
    }

    const card = e?.currentTarget?.closest?.(".ap-product-card, .ap-quick-view-modal");
    const img = card?.querySelector("img");
    const cartIcon = cartIconRef.current;

    try {
      const identifier = product.slug ?? product.slug_field ?? product.id;
      if (!identifier) {
        toast.error("Product cannot be added");
        return;
      }

      await addToCartContext(identifier, quantity);
      
      // Add to smart list if active
      if (activeList) {
        addToActiveList(product);
      }

      // Update stock locally
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? { ...p, stock: Math.max((p.stock || 0) - quantity, 0) }
            : p
        )
      );

      // Flying animation
      if (img && cartIcon) {
        const imgClone = img.cloneNode(true);
        const imgRect = img.getBoundingClientRect();
        const cartRect = cartIcon.getBoundingClientRect();

        imgClone.style.cssText = `
          position: fixed;
          left: ${imgRect.left}px;
          top: ${imgRect.top}px;
          width: ${imgRect.width}px;
          height: ${imgRect.height}px;
          transition: all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          z-index: 9999;
          border-radius: 12px;
          pointer-events: none;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          object-fit: contain;
          background: var(--card-bg);
        `;
        document.body.appendChild(imgClone);

        // Trigger animation
        requestAnimationFrame(() => {
          imgClone.style.left = `${cartRect.left + cartRect.width / 2 - 20}px`;
          imgClone.style.top = `${cartRect.top + cartRect.height / 2 - 20}px`;
          imgClone.style.width = "40px";
          imgClone.style.height = "40px";
          imgClone.style.opacity = "0";
          imgClone.style.transform = "scale(0.3) rotate(20deg)";
        });

        // Remove clone after animation
        imgClone.addEventListener("transitionend", () => {
          imgClone.remove();
        });

        // Fallback removal
        setTimeout(() => {
          if (imgClone.parentNode) {
            imgClone.remove();
          }
        }, 1000);
      }

      toast.success(`Added ${quantity > 1 ? `${quantity}x ` : ""}${product.name} to cart!`);
    } catch (err) {
      console.error("Add to cart failed:", err);
      toast.error("Failed to add to cart");
    }
  };

  // Handle wishlist
  const handleWishlist = (product) => {
    toast.success(`Added ${product.name} to wishlist!`);
  };

  // Handle quick view
  const handleQuickView = (product) => {
    setQuickViewProduct(product);
  };

  // Handle close quick view
  const handleCloseQuickView = () => {
    setQuickViewProduct(null);
  };

  // Handle save smart list
  const handleSaveList = () => {
    saveActiveList();
    navigate("/cart-page");
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setQuery("");
    setSelectedCategory("all");
    setSortBy("default");
    navigate("/all-products");
  };

  // ============ SLIDER SETTINGS ============
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
    adaptiveHeight: true,
  };

  // Handle banner error
  const handleBannerError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = PLACEHOLDER;
  };

  // ============ PAGE TITLE ============
  const pageTitle =
    selectedCategory && selectedCategory !== "all"
      ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Products`
      : "All Products";

  // ============ RENDER ============
  return (
    <div className="ap-page">
      {/* ===== HEADER ===== */}
      <header className="ap-header">
        <div className="ap-header-container">
          {/* Left - Back Button */}
          <div className="ap-header-left">
            <button className="ap-back-btn" onClick={() => navigate(-1)}>
              <FiChevronLeft />
              <span>Back</span>
            </button>
            <div className="ap-breadcrumb">
              <FiHome />
              <span>/</span>
              <span className="ap-current">{pageTitle}</span>
            </div>
          </div>

          {/* Center - Title */}
          <div className="ap-header-center">
            <h1 className="ap-title">
              <FiPackage className="ap-title-icon" />
              {pageTitle}
            </h1>
          </div>

          {/* Right - Cart Button Only (No Theme Toggle) */}
          <div className="ap-header-right">
            <button
              className="ap-cart-btn"
              onClick={() => navigate("/cart")}
              ref={cartIconRef}
              aria-label="View cart"
            >
              <FiShoppingCart />
              {cartCount > 0 && (
                <span className="ap-cart-badge">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ===== HERO BANNER ===== */}
      <section className="ap-hero-banner-section">
        <div className="ap-hero-banner">
          <Slider {...sliderSettings}>
            {selectedCategory !== "all" && categoryBanners[selectedCategory]
              ? (Array.isArray(categoryBanners[selectedCategory])
                  ? categoryBanners[selectedCategory]
                  : [categoryBanners[selectedCategory]]
                ).map((img, idx) => (
                  <div key={idx} className="ap-banner-slide">
                    <img
                      src={img}
                      alt={`${selectedCategory} banner ${idx + 1}`}
                      className="ap-banner-image"
                      onError={handleBannerError}
                    />
                    <div className="ap-banner-overlay">
                      <h2>Explore {selectedCategory}</h2>
                      <p>Discover amazing products at great prices</p>
                    </div>
                  </div>
                ))
              : [
                  "/assets/images/categories/banners/MAMUDA-FOODS.png",
                  "/assets/images/categories/banners/MAMUDA-BEVERAGES.png",
                  "/assets/images/categories/banners/MAMUDA-FOOD-AD5.png",
                ].map((img, idx) => (
                  <div key={idx} className="ap-banner-slide">
                    <img
                      src={imageUrl(img, 800, 400)}
                      alt={`banner-${idx + 1}`}
                      className="ap-banner-image"
                      onError={handleBannerError}
                    />
                    <div className="ap-banner-overlay">
                      <h2>Welcome to Our Store</h2>
                      <p>Shop smarter, Order faster with ChiamoOrder</p>
                    </div>
                  </div>
                ))}
          </Slider>
        </div>
      </section>

      {/* ===== MAIN CONTENT ===== */}
      <main className="ap-main">
        <div className="ap-main-container">
          {/* Search Bar */}
          <SearchBar
            query={query}
            setQuery={setQuery}
            resultsCount={filteredProducts.length}
          />

          {/* Category Tabs */}
          <CategoryTabs
            categories={CATEGORIES}
            selected={selectedCategory}
            onSelect={handleCategorySelect}
          />

          {/* Toolbar */}
          <div className="ap-toolbar">
            <div className="ap-toolbar-left">
              <span className="ap-products-count">
                <strong>{filteredProducts.length}</strong> products found
              </span>
            </div>

            <div className="ap-toolbar-right">
              {/* Sort Dropdown */}
              <div className="ap-sort-dropdown-container">
                <button
                  className="ap-sort-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSortDropdown(!showSortDropdown);
                  }}
                >
                  <BiSortAlt2 />
                  <span>Sort by</span>
                  <FiChevronDown
                    className={`ap-chevron ${showSortDropdown ? "open" : ""}`}
                  />
                </button>
                {showSortDropdown && (
                  <div className="ap-sort-dropdown">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        className={`ap-sort-option ${
                          sortBy === option.id ? "active" : ""
                        }`}
                        onClick={() => {
                          setSortBy(option.id);
                          setShowSortDropdown(false);
                        }}
                      >
                        {sortBy === option.id && <FiCheck className="ap-sort-check" />}
                        {option.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* View Toggle */}
              <div className="ap-view-toggle">
                <button
                  className={`ap-view-btn ${viewMode === "grid" ? "active" : ""}`}
                  onClick={() => setViewMode("grid")}
                  title="Grid View"
                  aria-label="Grid view"
                >
                  <FiGrid />
                </button>
                <button
                  className={`ap-view-btn ${viewMode === "list" ? "active" : ""}`}
                  onClick={() => setViewMode("list")}
                  title="List View"
                  aria-label="List view"
                >
                  <FiList />
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid/List */}
          {loading ? (
            <div className="ap-products-loading">
              {[...Array(8)].map((_, i) => (
                <ProductSkeleton key={i} viewMode={viewMode} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <EmptyState query={query} onClear={handleResetFilters} />
          ) : (
            <div className={`ap-products-container ${viewMode}`}>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id || product.name}
                  product={product}
                  viewMode={viewMode}
                  rating={ratings[product.id] || 0}
                  onRate={handleRate}
                  onAddToCart={handleAddToCart}
                  onWishlist={handleWishlist}
                  onQuickView={handleQuickView}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ===== FEATURES BANNER ===== */}
      <section className="ap-features-banner">
        <div className="ap-features-container">
          <div className="ap-feature-item">
            <div className="ap-feature-icon">
              <FiTruck />
            </div>
            <div className="ap-feature-text">
              <h4>Fast Delivery</h4>
              <p>Quick and reliable shipping</p>
            </div>
          </div>
          <div className="ap-feature-item">
            <div className="ap-feature-icon">
              <FiShield />
            </div>
            <div className="ap-feature-text">
              <h4>Secure Payment</h4>
              <p>100% secure transactions</p>
            </div>
          </div>
          <div className="ap-feature-item">
            <div className="ap-feature-icon">
              <FiStar />
            </div>
            <div className="ap-feature-text">
              <h4>Quality Products</h4>
              <p>Only the best for you</p>
            </div>
          </div>
          <div className="ap-feature-item">
            <div className="ap-feature-icon">
              <FiPackage />
            </div>
            <div className="ap-feature-text">
              <h4>Easy Returns</h4>
              <p>Hassle-free return policy</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="ap-footer">
        <div className="ap-footer-content">
          <p>© {new Date().getFullYear()} ChiamoOrder. All rights reserved.</p>
          <p className="ap-footer-tagline">Shop Smarter, Order Faster</p>
        </div>
      </footer>

      {/* ===== SMART LIST FOOTER ===== */}
      {activeList && (
        <div className="ap-smart-list-footer">
          <div className="ap-smart-list-info">
            <FiCheck />
            <span>Adding to Smart List</span>
          </div>
          <button className="ap-smart-list-btn" onClick={handleSaveList}>
            Finish List
          </button>
        </div>
      )}

      {/* ===== QUICK VIEW MODAL ===== */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={handleCloseQuickView}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* ===== BACK TO TOP ===== */}
      <BackToTop />

      {/* ===== DROPDOWN BACKDROP ===== */}
      {showSortDropdown && (
        <div
          className="ap-dropdown-backdrop"
          onClick={() => setShowSortDropdown(false)}
        />
      )}
    </div>
  );
}