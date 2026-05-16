// src/pages/InvoicePage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import html2pdf from "html2pdf.js";
import "./InvoicePage.css";
import { FiChevronLeft, FiDownload, FiMail, FiCheck, FiGift } from "react-icons/fi";

// ============ HELPERS ============
const formatCurrency = (val) =>
  `₦${Number(val || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatInvoiceDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatInvoiceTime = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

const getItemCategory = (item) => {
  const candidates = [
    item?.product?.category?.name,
    item?.product?.category,
    item?.category?.name,
    item?.category,
    item?.product_category,
  ];
  const raw = candidates.find(
    (v) => v !== undefined && v !== null && String(v).trim() !== ""
  );
  if (!raw) return "—";
  const s = String(raw).trim().toLowerCase();
  if (["uncategorized", "unknown", "n/a", "none", "null"].includes(s))
    return "—";
  return String(raw).trim().replace(/^\w/, (c) => c.toUpperCase());
};

const getItemName = (item) =>
  item?.product?.name || item?.name || item?.product_name || "Unnamed Product";

const getItemPrice = (item) =>
  Number(item?.product?.price || item?.price || item?.unit_price || 0);

const getItemQty = (item) => Number(item?.quantity || item?.qty || 1);

const calculateDeliveryFee = (subtotal, deliveryMethod) => {
  const isPickup =
    deliveryMethod === "pickup" || deliveryMethod === "warehouse_pickup";
  if (isPickup) return 0;
  if (subtotal >= 50000) return 0;
  else if (subtotal >= 25000) return 1000;
  else if (subtotal >= 10000) return 1500;
  else return 2000;
};

const getCustomerLocation = (user, order, addresses = []) => {
  const registeredLocation =
    user?.location ||
    user?.registered_location ||
    user?.default_location ||
    user?.registration_address ||
    user?.primary_location;

  if (registeredLocation && String(registeredLocation).trim()) {
    return { value: String(registeredLocation).trim(), source: "registered" };
  }

  const registrationParts = [
    user?.street_address || user?.street,
    user?.area || user?.neighborhood,
    user?.city,
    user?.state,
    user?.lga,
  ].filter((part) => part && String(part).trim());

  if (registrationParts.length > 0) {
    return { value: registrationParts.join(", "), source: "registered" };
  }

  const defaultAddress = addresses.find(
    (addr) =>
      addr?.is_default === true ||
      addr?.is_primary === true ||
      addr?.default === true ||
      addr?.primary === true
  );

  if (defaultAddress) {
    const addressString = formatAddress(defaultAddress);
    if (addressString) return { value: addressString, source: "addresses" };
  }

  if (addresses.length > 0) {
    const addressString = formatAddress(addresses[0]);
    if (addressString) return { value: addressString, source: "addresses" };
  }

  const userAddress =
    user?.address ||
    user?.delivery_address ||
    user?.shipping_address ||
    user?.saved_address;

  if (userAddress && String(userAddress).trim()) {
    return { value: String(userAddress).trim(), source: "addresses" };
  }

  const orderAddress =
    order?.delivery_address ||
    order?.shipping_address ||
    order?.address ||
    order?.location ||
    order?.customer_address;

  if (orderAddress && String(orderAddress).trim()) {
    return { value: String(orderAddress).trim(), source: "order" };
  }

  return { value: null, source: "none" };
};

const formatAddress = (address) => {
  if (!address) return null;
  if (typeof address === "string") return address.trim() || null;
  const parts = [
    address?.street_address || address?.street || address?.address_line_1,
    address?.address_line_2,
    address?.area || address?.neighborhood || address?.district,
    address?.city || address?.town,
    address?.lga,
    address?.state,
    address?.country,
  ].filter((part) => part && String(part).trim());
  return parts.length > 0 ? parts.join(", ") : null;
};

// ============ MAIN COMPONENT ============
export default function InvoicePage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const invoiceRef = useRef(null);
  const dropdownRef = useRef(null);

  const [order, setOrder] = useState(location.state?.order || null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(!order);
  const [downloading, setDownloading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // ✅ Load promo free items from sessionStorage and localStorage
  const [promoFreeItems, setPromoFreeItems] = useState(() => {
    try {
      // Virtual items (Jelly / PowerMint)
      const virtual = JSON.parse(
        sessionStorage.getItem("same_product_promo_items") || "[]"
      );
      return virtual;
    } catch {
      return [];
    }
  });

  // Also load beverage/care free item keys
  const [promoFreeItemKeys] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("promo_free_item_keys") || "[]"
      );
    } catch {
      return [];
    }
  });

  const storedUser = JSON.parse(localStorage.getItem("auth_user") || "{}");

  const customerName =
    storedUser.business_name ||
    storedUser.company_name ||
    storedUser.shop_name ||
    [storedUser.first_name, storedUser.last_name].filter(Boolean).join(" ") ||
    storedUser.name ||
    storedUser.username ||
    "Valued Customer";

  const customerEmail = storedUser.email || storedUser.user_email || "";
  const customerPhone = storedUser.phone || storedUser.phone_number || "";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showDropdown]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let orderData = order;
        if (!orderData) {
          const orderRes = await API.get(`orders/user-orders/${orderId}/`);
          orderData = orderRes.data;
          setOrder(orderData);
        }
        try {
          const addressRes = await API.get("/customers/addresses/");
          const addressData = addressRes.data;
          setAddresses(
            Array.isArray(addressData)
              ? addressData
              : addressData?.results || []
          );
        } catch (addrErr) {
          console.warn("Could not fetch addresses:", addrErr);
          setAddresses([]);
        }
      } catch (err) {
        console.error("Failed to fetch order:", err);
        toast.error("Could not load order details");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [orderId, order, navigate]);

  const deliveryMethod = order?.delivery_method || "delivery";
  const isPickup =
    deliveryMethod === "pickup" || deliveryMethod === "warehouse_pickup";

  const locationResult = getCustomerLocation(storedUser, order, addresses);
  const customerLocation = locationResult.value;

  // ✅ Regular items only (exclude free promo items from totals)
  const items = order?.items || [];

  // ✅ Calculate subtotal from regular items only
  const subtotal = items.reduce(
    (sum, item) => sum + getItemPrice(item) * getItemQty(item),
    0
  );

  const deliveryFee = calculateDeliveryFee(subtotal, deliveryMethod);
  const grandTotal = subtotal + deliveryFee;

  const invoiceNumber =
    order?.order_id || order?.invoice_number || `INV-${orderId}`;
  const invoiceDate =
    order?.created_at || order?.createdAt || new Date().toISOString();
  const deliveryMethodDisplay = isPickup ? "Warehouse Pickup" : "Delivery";

  // ✅ Download as PDF
  const handleDownload = async () => {
    if (!invoiceRef.current || downloading) return;
    setShowDropdown(false);
    setDownloading(true);
    const toastId = toast.loading("Generating PDF...");
    try {
      const element = invoiceRef.current;
      const options = {
        margin: [8, 10, 8, 10],
        filename: `ChiamoOrder-Invoice-${invoiceNumber}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
      };
      await html2pdf().set(options).from(element).save();
      toast.success("Invoice downloaded!", { id: toastId, icon: "📄" });
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to download. Try again.", { id: toastId });
    } finally {
      setDownloading(false);
    }
  };

  // ✅ Send to email
  const handleSendEmail = async () => {
    if (sendingEmail || emailSent) return;
    setShowDropdown(false);
    if (!customerEmail) {
      toast.error("No email address found on your account");
      return;
    }
    setSendingEmail(true);
    try {
      await API.post(`orders/user-orders/${orderId}/send-invoice/`, {
        email: customerEmail,
      });
      setEmailSent(true);
      toast.success(`Invoice sent to ${customerEmail}`, { icon: "📧" });
      setTimeout(() => setEmailSent(false), 5000);
    } catch (err) {
      console.error("Failed to send invoice:", err);
      toast.error(
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        "Failed to send invoice. Please try again."
      );
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="invoice-page">
        <div className="invoice-loading">
          <div className="invoice-loading-spinner" />
          <p>Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="invoice-page">
      {/* ===== TOP BAR ===== */}
      <header className="inv-topbar">
        <button className="inv-back-btn" onClick={() => navigate(-1)}>
          <FiChevronLeft />
          <span className="inv-back-text">Back</span>
        </button>

        <h2 className="inv-topbar-title">Invoice</h2>

        {/* Desktop buttons */}
        <div className="inv-topbar-inline">
          <button
            className={`inv-btn inv-btn-download ${downloading ? "inv-btn-loading" : ""}`}
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? (
              <><span className="inv-btn-spinner" />Generating...</>
            ) : (
              <><FiDownload />Download PDF</>
            )}
          </button>

          <button
            className={`inv-btn inv-btn-email ${emailSent ? "inv-btn-sent" : ""}`}
            onClick={handleSendEmail}
            disabled={sendingEmail || emailSent}
          >
            {sendingEmail ? (
              <><span className="inv-btn-spinner" />Sending...</>
            ) : emailSent ? (
              <><FiCheck />Sent!</>
            ) : (
              <><FiMail />Send to Email</>
            )}
          </button>
        </div>

        {/* Mobile dropdown */}
        <div className="inv-topbar-mobile" ref={dropdownRef}>
          <button
            className={`inv-more-btn ${showDropdown ? "active" : ""}`}
            onClick={() => setShowDropdown((prev) => !prev)}
            aria-label="More actions"
          >
            <span className="inv-hamburger">
              <span className="inv-hamburger-line" />
              <span className="inv-hamburger-line" />
              <span className="inv-hamburger-line" />
            </span>
          </button>

          {showDropdown && (
            <div className="inv-dropdown">
              <button
                className="inv-dropdown-item"
                onClick={handleDownload}
                disabled={downloading}
              >
                <FiDownload />
                <span>{downloading ? "Generating..." : "Download PDF"}</span>
              </button>
              <button
                className="inv-dropdown-item"
                onClick={handleSendEmail}
                disabled={sendingEmail || emailSent}
              >
                {emailSent ? <FiCheck /> : <FiMail />}
                <span>
                  {sendingEmail ? "Sending..." : emailSent ? "Sent!" : "Send to Email"}
                </span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ========== INVOICE BODY ========== */}
      <div className="inv-container">
        <div className="inv-paper" ref={invoiceRef}>

          {/* Logo */}
          <div className="inv-logo-section">
            <img
              src="https://ik.imagekit.io/ljwnlcbqyu/chiamoorderlogo.png"
              alt="ChiamoOrder"
              className="inv-logo"
              crossOrigin="anonymous"
            />
            <h1 className="inv-company-name">ChiamoOrder</h1>
            <p className="inv-company-tagline">Shop Smarter, Order Faster</p>
          </div>

          <div className="inv-divider" />

          <div className="inv-title-row">
            <h2 className="inv-title">INVOICE</h2>
          </div>

          {/* Header Grid */}
          <div className="inv-header-grid">
            {/* LEFT: Customer Info */}
            <div className="inv-header-col inv-header-left">
              <div className="inv-info-group">
                <span className="inv-info-label">Bill To:</span>
                <span className="inv-info-value inv-customer-name">
                  {customerName}
                </span>
              </div>
              <div className="inv-info-group">
                <span className="inv-info-label">Email:</span>
                <span className="inv-info-value">
                  {customerEmail || <span className="inv-nil">Not specified</span>}
                </span>
              </div>
              <div className="inv-info-group">
                <span className="inv-info-label">Phone:</span>
                <span className="inv-info-value">
                  {customerPhone || <span className="inv-nil">Not specified</span>}
                </span>
              </div>
              <div className="inv-info-group">
                <span className="inv-info-label">
                  {isPickup ? "Pickup Location:" : "Delivery Address:"}
                </span>
                <span className="inv-info-value inv-location">
                  {isPickup
                    ? "ChiamoOrder Warehouse, Port Harcourt"
                    : customerLocation || (
                        <span className="inv-nil">Location not specified</span>
                      )}
                </span>
              </div>
            </div>

            {/* RIGHT: Invoice Details */}
            <div className="inv-header-col inv-header-right">
              <div className="inv-info-group">
                <span className="inv-info-label">Invoice No:</span>
                <span className="inv-info-value inv-order-id">{invoiceNumber}</span>
              </div>
              <div className="inv-info-group">
                <span className="inv-info-label">Date:</span>
                <span className="inv-info-value">{formatInvoiceDate(invoiceDate)}</span>
              </div>
              <div className="inv-info-group">
                <span className="inv-info-label">Time:</span>
                <span className="inv-info-value">{formatInvoiceTime(invoiceDate)}</span>
              </div>
              <div className="inv-info-group">
                <span className="inv-info-label">Fulfillment:</span>
                <span
                  className={`inv-info-value inv-method ${
                    isPickup ? "inv-method-pickup" : "inv-method-delivery"
                  }`}
                >
                  {deliveryMethodDisplay}
                </span>
              </div>
            </div>
          </div>

          <div className="inv-divider" />

          {/* ✅ ITEMS TABLE — Regular Items */}
          <table className="inv-table">
            <thead>
              <tr>
                <th className="inv-th inv-th-sn">#</th>
                <th className="inv-th inv-th-name">Product</th>
                <th className="inv-th inv-th-cat">Category</th>
                <th className="inv-th inv-th-qty">Qty</th>
                <th className="inv-th inv-th-price">Unit Price</th>
                <th className="inv-th inv-th-total">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const price = getItemPrice(item);
                const qty = getItemQty(item);
                const lineTotal = price * qty;
                return (
                  <tr key={index} className="inv-tr">
                    <td className="inv-td inv-td-sn">{index + 1}</td>
                    <td className="inv-td inv-td-name">{getItemName(item)}</td>
                    <td className="inv-td inv-td-cat">{getItemCategory(item)}</td>
                    <td className="inv-td inv-td-qty">{qty}</td>
                    <td className="inv-td inv-td-price">{formatCurrency(price)}</td>
                    <td className="inv-td inv-td-total">{formatCurrency(lineTotal)}</td>
                  </tr>
                );
              })}

              {/* ✅ PROMO FREE ITEMS — Virtual rows (Jelly / PowerMint) */}
              {promoFreeItems.length > 0 &&
                promoFreeItems.map((promoItem, index) => (
                  <tr
                    key={`promo-virtual-${index}`}
                    className="inv-tr inv-tr-promo"
                  >
                    <td className="inv-td inv-td-sn">
                      {items.length + index + 1}
                    </td>
                    <td className="inv-td inv-td-name">
                      <span className="inv-promo-item-name">
                        {promoItem.name}
                      </span>
                      <span className="inv-promo-tag">
                        <FiGift size={10} />
                        Free Promo Item
                      </span>
                    </td>
                    <td className="inv-td inv-td-cat">—</td>
                    <td className="inv-td inv-td-qty">1</td>
                    <td className="inv-td inv-td-price">
                      <span className="inv-promo-price-struck">
                        {formatCurrency(promoItem.originalPrice || promoItem.price || 0)}
                      </span>
                    </td>
                    <td className="inv-td inv-td-total inv-promo-free-total">
                      FREE
                    </td>
                  </tr>
                ))}

              {/* ✅ PROMO FREE ITEMS — Beverage / Care (from real cart, tagged via keys) */}
              {promoFreeItemKeys.length > 0 &&
                (() => {
                  // Get the cart items from localStorage
                  const userId = storedUser?.id;
                  let cartItems = [];
                  try {
                    cartItems = JSON.parse(
                      localStorage.getItem(`cart_${userId}`) || "[]"
                    );
                  } catch {
                    cartItems = [];
                  }

                  // Match cart items that are tagged as free
                  const freeCartItems = cartItems.filter((cartItem) => {
                    const productId = String(
                      cartItem.productId || cartItem.id || ""
                    );
                    const slug = cartItem.slug || "";
                    return promoFreeItemKeys.some((key) => {
                      const [storedId, promoParam] = key.split("::");
                      const isBagPromo =
                        promoParam === "beverage_500" ||
                        promoParam === "care_300";
                      return (
                        isBagPromo &&
                        (storedId === productId || storedId === slug)
                      );
                    });
                  });

                  if (freeCartItems.length === 0) return null;

                  return freeCartItems.map((cartItem, index) => {
                    const price = parseFloat(cartItem.price) || 0;
                    const promoKey = promoFreeItemKeys.find((key) => {
                      const [storedId] = key.split("::");
                      return (
                        storedId === String(cartItem.productId || cartItem.id)
                      );
                    });
                    const isBeverage = promoKey?.includes("beverage_500");

                    return (
                      <tr
                        key={`promo-bag-${index}`}
                        className="inv-tr inv-tr-promo"
                      >
                        <td className="inv-td inv-td-sn">
                          {items.length + promoFreeItems.length + index + 1}
                        </td>
                        <td className="inv-td inv-td-name">
                          <span className="inv-promo-item-name">
                            {cartItem.name}
                          </span>
                          <span
                            className={`inv-promo-tag ${
                              isBeverage
                                ? "inv-promo-tag-beverage"
                                : "inv-promo-tag-care"
                            }`}
                          >
                            <FiGift size={10} />
                            {isBeverage
                              ? "Free — Beverage Promo"
                              : "Free — Care Promo"}
                          </span>
                        </td>
                        <td className="inv-td inv-td-cat">
                          {isBeverage ? "Beverage" : "Care"}
                        </td>
                        <td className="inv-td inv-td-qty">
                          {cartItem.quantity || 1}
                        </td>
                        <td className="inv-td inv-td-price">
                          <span className="inv-promo-price-struck">
                            {formatCurrency(price)}
                          </span>
                        </td>
                        <td className="inv-td inv-td-total inv-promo-free-total">
                          FREE
                        </td>
                      </tr>
                    );
                  });
                })()}

              {/* Empty row padding */}
              {items.length + promoFreeItems.length < 3 &&
                [...Array(Math.max(0, 3 - items.length - promoFreeItems.length))].map(
                  (_, i) => (
                    <tr key={`empty-${i}`} className="inv-tr inv-tr-empty">
                      <td className="inv-td">&nbsp;</td>
                      <td className="inv-td" />
                      <td className="inv-td" />
                      <td className="inv-td" />
                      <td className="inv-td" />
                      <td className="inv-td" />
                    </tr>
                  )
                )}
            </tbody>
          </table>

          {/* Totals */}
          <div className="inv-totals">
            <div className="inv-totals-box">
              <div className="inv-total-row">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              {/* ✅ Show promo savings if any */}
              {(promoFreeItems.length > 0 || promoFreeItemKeys.length > 0) && (
                <div className="inv-total-row inv-total-promo-savings">
                  <span className="inv-promo-savings-label">
                    <FiGift size={12} />
                    Promo Savings
                  </span>
                  <span className="inv-promo-savings-value">FREE</span>
                </div>
              )}

              <div className="inv-total-row">
                <span>
                  Delivery Fee
                  {isPickup && (
                    <small className="inv-fee-note"> (Pickup)</small>
                  )}
                </span>
                <span className={deliveryFee === 0 ? "inv-free-delivery" : ""}>
                  {deliveryFee === 0 ? "FREE" : formatCurrency(deliveryFee)}
                </span>
              </div>
              <div className="inv-total-line" />
              <div className="inv-total-row inv-total-grand">
                <span>Grand Total</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Delivery note */}
          {!isPickup && (
            <div className="inv-delivery-note">
              <small>
                {subtotal < 10000 &&
                  "Orders below ₦10,000 incur a ₦2,000 delivery fee."}
                {subtotal >= 10000 &&
                  subtotal < 25000 &&
                  "Orders ₦10,000 – ₦24,999 incur a ₦1,500 delivery fee."}
                {subtotal >= 25000 &&
                  subtotal < 50000 &&
                  "Orders ₦25,000 – ₦49,999 incur a ₦1,000 delivery fee."}
                {subtotal >= 50000 &&
                  "Free delivery on orders ₦50,000 and above!"}
              </small>
            </div>
          )}

          {/* Stamp */}
          <div className="inv-stamp-wrapper">
            <span className="inv-stamp">RAISED</span>
          </div>

          {/* Footer */}
          <div className="inv-footer">
            <div className="inv-divider" />
            <p className="inv-thanks">Thank you for your order!</p>
            <p className="inv-footer-line">
              ChiamoOrder — Port Harcourt, Rivers State, Nigeria
            </p>
            <p className="inv-footer-line">
              Email: chiamoorder@gmail.com | Phone: +234 703 241 0362
            </p>
            <p className="inv-footer-note">
              This is a computer-generated invoice. No signature required.
            </p>
          </div>
        </div>

        {/* ✅ DOWNLOAD BUTTON BELOW INVOICE */}
        <div className="inv-download-footer">
          <button
            className={`inv-download-footer-btn ${downloading ? "loading" : ""}`}
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? (
              <>
                <span className="inv-btn-spinner" />
                Generating your invoice...
              </>
            ) : (
              <>
                <FiDownload size={18} />
                Download Your Invoice
              </>
            )}
          </button>
          <p className="inv-download-footer-hint">
            Save a copy of this invoice to your device
          </p>
        </div>
      </div>

      <div className="inv-bottom-spacer" />
    </div>
  );
}