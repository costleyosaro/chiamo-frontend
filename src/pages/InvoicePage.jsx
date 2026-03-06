// src/pages/InvoicePage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import "./InvoicePage.css";
import { FiChevronLeft, FiDownload, FiMail, FiCheck } from "react-icons/fi";

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

// ============ MAIN COMPONENT ============
export default function InvoicePage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const invoiceRef = useRef(null);

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Get customer info
  const storedUser = JSON.parse(localStorage.getItem("auth_user") || "{}");
  const customerName =
    storedUser.business_name ||
    storedUser.company_name ||
    storedUser.shop_name ||
    [storedUser.first_name, storedUser.last_name].filter(Boolean).join(" ") ||
    storedUser.name ||
    storedUser.username ||
    "Valued Customer";
  const customerEmail =
    storedUser.email || storedUser.user_email || "";
  const customerPhone =
    storedUser.phone || storedUser.phone_number || "";

  // Fetch order if not passed via state
  useEffect(() => {
    if (order) return;

    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await API.get(`orders/user-orders/${orderId}/`);
        setOrder(res.data);
      } catch (err) {
        console.error("Failed to fetch order:", err);
        toast.error("Could not load order details");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, order, navigate]);

  // Calculate totals
  const items = order?.items || [];
  const subtotal = items.reduce(
    (sum, item) => sum + getItemPrice(item) * getItemQty(item),
    0
  );
  const deliveryFee = Number(order?.delivery_fee || 0);
  const grandTotal = order?.total
    ? Number(order.total)
    : subtotal + deliveryFee;

  // Invoice number
  const invoiceNumber =
    order?.order_id || order?.invoice_number || `INV-${orderId}`;

  const invoiceDate = order?.created_at || order?.createdAt || new Date().toISOString();

  // Delivery method
  const deliveryMethod =
    order?.delivery_method === "pickup" ? "Pickup" : "Delivery";

  // ============ DOWNLOAD (Print as PDF) ============
  const handleDownload = () => {
    window.print();
  };

  // ============ SEND TO EMAIL ============
  const handleSendEmail = async () => {
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
      toast.error("Failed to send invoice. Please try again.");
    } finally {
      setSendingEmail(false);
    }
  };

  // Loading state
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
      {/* Top bar — hidden when printing */}
      <div className="invoice-topbar no-print">
        <button className="invoice-back-btn" onClick={() => navigate(-1)}>
          <FiChevronLeft />
          <span>Back to Orders</span>
        </button>
        <div className="invoice-topbar-actions">
          <button className="invoice-dl-btn" onClick={handleDownload}>
            <FiDownload />
            <span>Download PDF</span>
          </button>
          <button
            className={`invoice-email-btn ${emailSent ? "sent" : ""}`}
            onClick={handleSendEmail}
            disabled={sendingEmail || emailSent}
          >
            {sendingEmail ? (
              <>
                <span className="invoice-btn-spinner" />
                Sending...
              </>
            ) : emailSent ? (
              <>
                <FiCheck />
                Sent!
              </>
            ) : (
              <>
                <FiMail />
                <span>Send to Email</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ========== INVOICE BODY ========== */}
      <div className="invoice-container" ref={invoiceRef}>
        <div className="invoice-paper">
          {/* Logo */}
          <div className="invoice-logo-section">
            <img
              src="https://ik.imagekit.io/ljwnlcbqyu/CHIAMO-ORDER-LOGO2.png?tr=w-200,f-auto,q-80"
              alt="ChiamoOrder"
              className="invoice-logo"
            />
            <h1 className="invoice-company-name">ChiamoOrder</h1>
            <p className="invoice-company-tagline">
              Shop Smarter, Order Faster
            </p>
          </div>

          {/* Divider */}
          <div className="invoice-divider" />

          {/* Invoice Title */}
          <div className="invoice-title-row">
            <h2 className="invoice-label">INVOICE</h2>
          </div>

          {/* Header Info: Customer + Order details */}
          <div className="invoice-header-grid">
            {/* Left: Customer info */}
            <div className="invoice-header-left">
              <div className="invoice-info-group">
                <span className="invoice-info-label">Bill To:</span>
                <span className="invoice-info-value invoice-customer-name">
                  {customerName}
                </span>
              </div>
              {customerEmail && (
                <div className="invoice-info-group">
                  <span className="invoice-info-label">Email:</span>
                  <span className="invoice-info-value">{customerEmail}</span>
                </div>
              )}
              {customerPhone && (
                <div className="invoice-info-group">
                  <span className="invoice-info-label">Phone:</span>
                  <span className="invoice-info-value">{customerPhone}</span>
                </div>
              )}
            </div>

            {/* Right: Order details */}
            <div className="invoice-header-right">
              <div className="invoice-info-group">
                <span className="invoice-info-label">Invoice No:</span>
                <span className="invoice-info-value invoice-order-id">
                  {invoiceNumber}
                </span>
              </div>
              <div className="invoice-info-group">
                <span className="invoice-info-label">Date:</span>
                <span className="invoice-info-value">
                  {formatInvoiceDate(invoiceDate)}
                </span>
              </div>
              <div className="invoice-info-group">
                <span className="invoice-info-label">Time:</span>
                <span className="invoice-info-value">
                  {formatInvoiceTime(invoiceDate)}
                </span>
              </div>
              <div className="invoice-info-group">
                <span className="invoice-info-label">Method:</span>
                <span className="invoice-info-value">{deliveryMethod}</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="invoice-divider" />

          {/* Items Table */}
          <table className="invoice-table">
            <thead>
              <tr>
                <th className="invoice-th sn">#</th>
                <th className="invoice-th name">Product</th>
                <th className="invoice-th category">Category</th>
                <th className="invoice-th qty">Qty</th>
                <th className="invoice-th price">Unit Price</th>
                <th className="invoice-th total">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const price = getItemPrice(item);
                const qty = getItemQty(item);
                const lineTotal = price * qty;

                return (
                  <tr key={index} className="invoice-tr">
                    <td className="invoice-td sn">{index + 1}</td>
                    <td className="invoice-td name">{getItemName(item)}</td>
                    <td className="invoice-td category">
                      {getItemCategory(item)}
                    </td>
                    <td className="invoice-td qty">{qty}</td>
                    <td className="invoice-td price">
                      {formatCurrency(price)}
                    </td>
                    <td className="invoice-td total">
                      {formatCurrency(lineTotal)}
                    </td>
                  </tr>
                );
              })}

              {/* Empty rows if fewer than 3 items (for aesthetic) */}
              {items.length < 3 &&
                [...Array(3 - items.length)].map((_, i) => (
                  <tr key={`empty-${i}`} className="invoice-tr empty-row">
                    <td className="invoice-td">&nbsp;</td>
                    <td className="invoice-td"></td>
                    <td className="invoice-td"></td>
                    <td className="invoice-td"></td>
                    <td className="invoice-td"></td>
                    <td className="invoice-td"></td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="invoice-totals">
            <div className="invoice-totals-spacer" />
            <div className="invoice-totals-box">
              <div className="invoice-total-row">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="invoice-total-row">
                <span>Delivery Fee</span>
                <span>
                  {deliveryFee === 0 ? "FREE" : formatCurrency(deliveryFee)}
                </span>
              </div>
              <div className="invoice-total-divider" />
              <div className="invoice-total-row grand">
                <span>Grand Total</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="invoice-payment-status">
            <span className="invoice-stamp">PAID</span>
          </div>

          {/* Footer */}
          <div className="invoice-footer-section">
            <div className="invoice-divider" />
            <div className="invoice-footer-content">
              <p className="invoice-thanks">
                Thank you for your order!
              </p>
              <div className="invoice-footer-details">
                <p>ChiamoOrder — Port Harcourt, Rivers State, Nigeria</p>
                <p>Email: chiamoorder@gmail.com | Phone: +234 703 241 0362</p>
                <p className="invoice-footer-note">
                  This is a computer-generated invoice. No signature required.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom action buttons (mobile) — hidden when printing */}
      <div className="invoice-bottom-actions no-print">
        <button className="invoice-bottom-btn download" onClick={handleDownload}>
          <FiDownload />
          Download PDF
        </button>
        <button
          className={`invoice-bottom-btn email ${emailSent ? "sent" : ""}`}
          onClick={handleSendEmail}
          disabled={sendingEmail || emailSent}
        >
          {sendingEmail ? (
            <>
              <span className="invoice-btn-spinner" />
              Sending...
            </>
          ) : emailSent ? (
            <>
              <FiCheck />
              Sent!
            </>
          ) : (
            <>
              <FiMail />
              Send to Email
            </>
          )}
        </button>
      </div>
    </div>
  );
}