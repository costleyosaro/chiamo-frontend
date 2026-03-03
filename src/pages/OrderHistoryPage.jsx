// src/pages/OrderHistoryPage.jsx
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import "./OrderHistory.css";

// Icons
import {
  FiChevronLeft,
  FiSearch,
  FiFilter,
  FiCalendar,
  FiClock,
  FiPackage,
  FiShoppingCart,
  FiList,
  FiChevronRight,
  FiChevronDown,
  FiX,
  FiDownload,
  FiRefreshCw,
  FiAlertCircle,
  FiCheck,
  FiTruck,
  FiBox,
  FiCheckCircle,
  FiDollarSign,
  FiHash,
  FiSliders,
} from "react-icons/fi";
import { HiOutlineClipboardList, HiOutlineSparkles } from "react-icons/hi";

// ============ CONSTANTS ============
const ORDER_STEPS = [
  "Order Confirmed",
  "Processing",
  "In Transit",
  "Out for Delivery",
  "Delivered",
];

// ============ HELPER FUNCTIONS ============
const formatCurrency = (val) =>
  `₦${Number(val || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusColor = (status) => {
  const s = (status || "").toLowerCase();
  if (s.includes("delivered") || s.includes("completed")) return "delivered";
  if (s.includes("transit")) return "transit";
  if (s.includes("processing")) return "processing";
  if (s.includes("confirmed")) return "confirmed";
  return "pending";
};

const getSourceIcon = (source) => {
  if (source === "cart") return FiShoppingCart;
  if (source === "smartlist") return FiList;
  return FiPackage;
};

const getSourceLabel = (source) => {
  if (source === "cart") return "Cart";
  if (source === "smartlist") return "Smart List";
  return "Direct";
};

// ============ SUB-COMPONENTS ============

// Header Component
const HistoryHeader = ({ onBack, totalOrders }) => (
  <header className="oh-header">
    <button className="oh-back-btn" onClick={onBack} aria-label="Go back">
      <FiChevronLeft />
    </button>
    <div className="oh-header-center">
      <h1 className="oh-title">Order History</h1>
      {totalOrders > 0 && (
        <span className="oh-count">{totalOrders} transactions</span>
      )}
    </div>
    <button className="oh-export-btn" aria-label="Export">
      <FiDownload />
    </button>
  </header>
);

// Stats Summary
const StatsSummary = ({ orders }) => {
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, o) => {
      const orderTotal = (o.items || []).reduce(
        (s, it) => s + parseFloat(it.price || 0) * (it.quantity || 1),
        0
      );
      return sum + orderTotal;
    }, 0);
    const completedOrders = orders.filter(
      (o) => (o.status || "").toLowerCase().includes("delivered")
    ).length;

    return { totalOrders, totalSpent, completedOrders };
  }, [orders]);

  return (
    <div className="oh-stats">
      <div className="oh-stat-card">
        <div className="oh-stat-icon blue">
          <FiHash />
        </div>
        <div className="oh-stat-info">
          <span className="oh-stat-value">{stats.totalOrders}</span>
          <span className="oh-stat-label">Total Orders</span>
        </div>
      </div>
      <div className="oh-stat-card">
        <div className="oh-stat-icon green">
          <FiDollarSign />
        </div>
        <div className="oh-stat-info">
          <span className="oh-stat-value">{formatCurrency(stats.totalSpent)}</span>
          <span className="oh-stat-label">Total Spent</span>
        </div>
      </div>
      <div className="oh-stat-card">
        <div className="oh-stat-icon gold">
          <FiCheckCircle />
        </div>
        <div className="oh-stat-info">
          <span className="oh-stat-value">{stats.completedOrders}</span>
          <span className="oh-stat-label">Completed</span>
        </div>
      </div>
    </div>
  );
};

// Search & Filter Bar
const SearchFilterBar = ({
  searchQuery,
  setSearchQuery,
  showFilters,
  setShowFilters,
  activeFilters,
}) => (
  <div className="oh-search-section">
    <div className="oh-search-wrapper">
      <FiSearch className="oh-search-icon" />
      <input
        type="text"
        className="oh-search-input"
        placeholder="Search orders, products..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {searchQuery && (
        <button className="oh-search-clear" onClick={() => setSearchQuery("")}>
          <FiX />
        </button>
      )}
    </div>
    <button
      className={`oh-filter-btn ${showFilters ? "active" : ""} ${activeFilters > 0 ? "has-filters" : ""}`}
      onClick={() => setShowFilters(!showFilters)}
    >
      <FiSliders />
      {activeFilters > 0 && <span className="oh-filter-count">{activeFilters}</span>}
    </button>
  </div>
);

// Filter Panel
const FilterPanel = ({
  show,
  sortBy,
  setSortBy,
  monthFilter,
  setMonthFilter,
  weekFilter,
  setWeekFilter,
  months,
  weeks,
  onReset,
}) => {
  if (!show) return null;

  return (
    <div className="oh-filter-panel">
      <div className="oh-filter-header">
        <h3>Filters</h3>
        <button className="oh-filter-reset" onClick={onReset}>
          <FiRefreshCw />
          Reset
        </button>
      </div>

      <div className="oh-filter-grid">
        <div className="oh-filter-group">
          <label className="oh-filter-label">Sort By</label>
          <div className="oh-select-wrapper">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="oh-select"
            >
              <option value="date">Date (Newest)</option>
              <option value="date-asc">Date (Oldest)</option>
              <option value="id">Order ID</option>
              <option value="amount">Amount</option>
            </select>
            <FiChevronDown className="oh-select-icon" />
          </div>
        </div>

        <div className="oh-filter-group">
          <label className="oh-filter-label">Month</label>
          <div className="oh-select-wrapper">
            <select
              value={monthFilter}
              onChange={(e) => {
                setMonthFilter(e.target.value);
                setWeekFilter("all");
              }}
              className="oh-select"
            >
              <option value="all">All Months</option>
              {months.map((m) => {
                const [year, month] = m.split("-");
                const monthName = new Date(year, month - 1).toLocaleString("default", {
                  month: "long",
                });
                return (
                  <option key={m} value={m}>
                    {monthName} {year}
                  </option>
                );
              })}
            </select>
            <FiChevronDown className="oh-select-icon" />
          </div>
        </div>

        {weeks.length > 0 && (
          <div className="oh-filter-group">
            <label className="oh-filter-label">Week</label>
            <div className="oh-select-wrapper">
              <select
                value={weekFilter}
                onChange={(e) => setWeekFilter(e.target.value)}
                className="oh-select"
              >
                <option value="all">All Weeks</option>
                {weeks.map((w) => (
                  <option key={w.label} value={w.label}>
                    {w.label} ({w.start}–{w.end})
                  </option>
                ))}
              </select>
              <FiChevronDown className="oh-select-icon" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Results Header
const ResultsHeader = ({ count, sortBy }) => (
  <div className="oh-results-header">
    <span className="oh-results-count">
      <strong>{count}</strong> {count === 1 ? "order" : "orders"} found
    </span>
  </div>
);

// Order Card (Mobile View)
const OrderCard = ({ order, isHighlighted, onView }) => {
  const totalAmount = (order.items || []).reduce(
    (sum, it) => sum + parseFloat(it.price || 0) * (it.quantity || 1),
    0
  );
  const itemCount = order.items?.length || 0;
  const statusClass = getStatusColor(order.status);
  const SourceIcon = getSourceIcon(order.source);

  return (
    <div
      className={`oh-order-card ${isHighlighted ? "highlighted" : ""}`}
      onClick={onView}
    >
      {isHighlighted && (
        <div className="oh-highlighted-badge">
          <HiOutlineSparkles />
          Current
        </div>
      )}

      <div className="oh-order-header">
        <div className="oh-order-id">{order.order_id || "—"}</div>
        <span className={`oh-status-badge ${statusClass}`}>
          {order.status || "Pending"}
        </span>
      </div>

      <div className="oh-order-meta">
        <span className="oh-order-date">
          <FiCalendar />
          {formatDate(order.created_at)}
        </span>
        <span className="oh-order-time">
          <FiClock />
          {formatTime(order.created_at)}
        </span>
      </div>

      <div className="oh-order-items">
        {(order.items || []).slice(0, 2).map((item, i) => (
          <div key={i} className="oh-order-item">
            <span className="oh-item-name">{item.product?.name || "Product"}</span>
            <span className="oh-item-qty">×{item.quantity || 1}</span>
          </div>
        ))}
        {itemCount > 2 && (
          <div className="oh-order-more">+{itemCount - 2} more items</div>
        )}
      </div>

      <div className="oh-order-footer">
        <div className="oh-order-source">
          <SourceIcon />
          <span>{getSourceLabel(order.source)}</span>
        </div>
        <div className="oh-order-total">{formatCurrency(totalAmount)}</div>
      </div>

      <FiChevronRight className="oh-order-arrow" />
    </div>
  );
};

// Desktop Table View
const OrdersTable = ({ orders, highlightedId, highlightedRef, onOrderClick }) => (
  <div className="oh-table-wrapper">
    <table className="oh-table">
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Date & Time</th>
          <th>Items</th>
          <th>Source</th>
          <th>Total</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order, idx) => {
          const totalAmount = (order.items || []).reduce(
            (sum, it) => sum + parseFloat(it.price || 0) * (it.quantity || 1),
            0
          );
          const isHighlighted = order.id?.toString() === highlightedId?.toString();
          const statusClass = getStatusColor(order.status);
          const SourceIcon = getSourceIcon(order.source);

          return (
            <tr
              key={order.id || idx}
              ref={isHighlighted ? highlightedRef : null}
              className={`oh-table-row ${isHighlighted ? "highlighted" : ""}`}
              onClick={() => onOrderClick(order)}
            >
              <td>
                <span className="oh-table-id">{order.order_id || "—"}</span>
              </td>
              <td>
                <div className="oh-table-datetime">
                  <span className="oh-table-date">{formatDate(order.created_at)}</span>
                  <span className="oh-table-time">{formatTime(order.created_at)}</span>
                </div>
              </td>
              <td>
                <div className="oh-table-items">
                  {(order.items || []).slice(0, 2).map((it, i) => (
                    <span key={i} className="oh-table-item">
                      {it.product?.name} (×{it.quantity})
                    </span>
                  ))}
                  {(order.items?.length || 0) > 2 && (
                    <span className="oh-table-more">
                      +{order.items.length - 2} more
                    </span>
                  )}
                </div>
              </td>
              <td>
                <div className="oh-table-source">
                  <SourceIcon />
                  <span>{getSourceLabel(order.source)}</span>
                </div>
              </td>
              <td>
                <span className="oh-table-amount">{formatCurrency(totalAmount)}</span>
              </td>
              <td>
                <span className={`oh-status-badge ${statusClass}`}>
                  {order.status || "Pending"}
                </span>
              </td>
              <td>
                <FiChevronRight className="oh-table-arrow" />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

// Empty State
const EmptyState = ({ hasFilters, onReset }) => (
  <div className="oh-empty">
    <div className="oh-empty-icon">
      <HiOutlineClipboardList />
    </div>
    <h3 className="oh-empty-title">
      {hasFilters ? "No Orders Found" : "No Order History"}
    </h3>
    <p className="oh-empty-text">
      {hasFilters
        ? "Try adjusting your filters or search query"
        : "Your completed orders will appear here"}
    </p>
    {hasFilters && (
      <button className="oh-empty-btn" onClick={onReset}>
        <FiRefreshCw />
        Reset Filters
      </button>
    )}
  </div>
);

// Loading Skeleton
const LoadingSkeleton = () => (
  <div className="oh-skeleton">
    <div className="oh-skeleton-stats">
      <div className="oh-skeleton-stat"></div>
      <div className="oh-skeleton-stat"></div>
      <div className="oh-skeleton-stat"></div>
    </div>
    <div className="oh-skeleton-search"></div>
    <div className="oh-skeleton-card"></div>
    <div className="oh-skeleton-card"></div>
    <div className="oh-skeleton-card"></div>
  </div>
);

// ============ MAIN COMPONENT ============
export default function OrderHistoryPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const highlightedRef = useRef(null);

  // State
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [monthFilter, setMonthFilter] = useState("all");
  const [weekFilter, setWeekFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await API.get("orders/user-orders/");
        setOrders(res.data || []);
      } catch (err) {
        console.error("Failed to fetch order history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Extract unique months
  const months = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    const unique = new Set();
    orders.forEach((o) => {
      if (!o?.created_at) return;
      const d = new Date(o.created_at);
      unique.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    });
    return Array.from(unique).sort().reverse();
  }, [orders]);

  // Generate week ranges
  const weeks = useMemo(() => {
    if (monthFilter === "all") return [];
    const [year, month] = monthFilter.split("-");
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: Math.ceil(daysInMonth / 7) }, (_, i) => ({
      label: `Week ${i + 1}`,
      start: i * 7 + 1,
      end: Math.min((i + 1) * 7, daysInMonth),
    }));
  }, [monthFilter]);

  // Filter, Search, Sort
  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    let filtered = [...orders];

    // Month filter
    if (monthFilter !== "all") {
      filtered = filtered.filter((o) => {
        const d = new Date(o.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        return key === monthFilter;
      });
    }

    // Week filter
    if (weekFilter !== "all" && monthFilter !== "all") {
      const selectedWeek = weeks.find((w) => w.label === weekFilter);
      filtered = filtered.filter((o) => {
        const day = new Date(o.created_at).getDate();
        return selectedWeek && day >= selectedWeek.start && day <= selectedWeek.end;
      });
    }

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((o) => {
        const inOrderId = o.order_id?.toLowerCase().includes(query);
        const inItems = (o.items || []).some((it) =>
          it?.product?.name?.toLowerCase().includes(query)
        );
        return inOrderId || inItems;
      });
    }

    // Sort
    switch (sortBy) {
      case "date":
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case "date-asc":
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case "id":
        filtered.sort((a, b) => (a.order_id || "").localeCompare(b.order_id || ""));
        break;
      case "amount":
        filtered.sort((a, b) => {
          const aTotal = (a.items || []).reduce(
            (s, it) => s + parseFloat(it.price || 0) * (it.quantity || 1),
            0
          );
          const bTotal = (b.items || []).reduce(
            (s, it) => s + parseFloat(it.price || 0) * (it.quantity || 1),
            0
          );
          return bTotal - aTotal;
        });
        break;
      default:
        break;
    }

    return filtered;
  }, [orders, sortBy, monthFilter, weekFilter, searchQuery, weeks]);

  // Count active filters
  const activeFilters = useMemo(() => {
    let count = 0;
    if (monthFilter !== "all") count++;
    if (weekFilter !== "all") count++;
    if (sortBy !== "date") count++;
    return count;
  }, [monthFilter, weekFilter, sortBy]);

  // Reset filters
  const handleResetFilters = () => {
    setSortBy("date");
    setMonthFilter("all");
    setWeekFilter("all");
    setSearchQuery("");
  };

  // Scroll to highlighted
  useEffect(() => {
    if (orderId && highlightedRef.current) {
      highlightedRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [orderId, filteredOrders]);

  // Handle order click
  const handleOrderClick = (order) => {
    // Navigate to order details or expand
    console.log("Order clicked:", order.id);
  };

  // Loading
  if (loading) {
    return (
      <div className="oh-page">
        <HistoryHeader onBack={() => navigate(-1)} totalOrders={0} />
        <div className="oh-content">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="oh-page">
      {/* Header */}
      <HistoryHeader
        onBack={() => navigate(-1)}
        totalOrders={orders.length}
      />

      {/* Content */}
      <div className="oh-content">
        {/* Stats Summary */}
        {orders.length > 0 && <StatsSummary orders={orders} />}

        {/* Search & Filter */}
        <SearchFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          activeFilters={activeFilters}
        />

        {/* Filter Panel */}
        <FilterPanel
          show={showFilters}
          sortBy={sortBy}
          setSortBy={setSortBy}
          monthFilter={monthFilter}
          setMonthFilter={setMonthFilter}
          weekFilter={weekFilter}
          setWeekFilter={setWeekFilter}
          months={months}
          weeks={weeks}
          onReset={handleResetFilters}
        />

        {/* Results */}
        {filteredOrders.length === 0 ? (
          <EmptyState
            hasFilters={activeFilters > 0 || searchQuery.trim() !== ""}
            onReset={handleResetFilters}
          />
        ) : (
          <>
            <ResultsHeader count={filteredOrders.length} sortBy={sortBy} />

            {/* Mobile Cards */}
            <div className="oh-cards-view">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isHighlighted={order.id?.toString() === orderId?.toString()}
                  onView={() => handleOrderClick(order)}
                />
              ))}
            </div>

            {/* Desktop Table */}
            <OrdersTable
              orders={filteredOrders}
              highlightedId={orderId}
              highlightedRef={highlightedRef}
              onOrderClick={handleOrderClick}
            />
          </>
        )}
      </div>

      {/* Bottom Spacer */}
      <div className="oh-bottom-spacer"></div>
    </div>
  );
}