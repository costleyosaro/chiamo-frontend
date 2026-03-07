// src/pages/InvoicePage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import html2pdf from "html2pdf.js";
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
  const [downloading, setDownloading] = useState(false);
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
  const customerEmail = storedUser.email || storedUser.user_email || "";
  const customerPhone = storedUser.phone || storedUser.phone_number || "";

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
  const grandTotal = order?.total ? Number(order.total) : subtotal + deliveryFee;

  const invoiceNumber = order?.order_id || order?.invoice_number || `INV-${orderId}`;
  const invoiceDate = order?.created_at || order?.createdAt || new Date().toISOString();
  const deliveryMethod = order?.delivery_method === "pickup" ? "Pickup" : "Delivery";

  // ✅ Download as real PDF
  const handleDownload = async () => {
    if (!invoiceRef.current || downloading) return;

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
      const errorMsg =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        "Failed to send invoice. Please try again.";
      toast.error(errorMsg);
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
      {/* ===== ✅ UNIFIED TOP BAR - SAME ON ALL SCREEN SIZES ===== */}
      <header className="inv-topbar">
        <button className="inv-back-btn" onClick={() => navigate(-1)}>
          <FiChevronLeft />
          <span>Back</span>
        </button>

        <h2 className="inv-topbar-title">Invoice</h2>

        {/* ✅ BOTH BUTTONS LIVE HERE, ON EVERY SCREEN SIZE */}
        <div className="inv-topbar-actions">

          {/* Download Button */}
          <button
            className={`inv-btn inv-btn-download ${downloading ? "inv-btn-loading" : ""}`}
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? (
              <>
                <span className="inv-btn-spinner" />
                <span className="inv-btn-text">Generating...</span>
              </>
            ) : (
              <>
                <FiDownload />
                <span className="inv-btn-text">Download</span>
              </>
            )}
          </button>

          {/* Send Email Button */}
          <button
            className={`inv-btn inv-btn-email ${emailSent ? "inv-btn-sent" : ""}`}
            onClick={handleSendEmail}
            disabled={sendingEmail || emailSent}
          >
            {sendingEmail ? (
              <>
                <span className="inv-btn-spinner" />
                <span className="inv-btn-text">Sending...</span>
              </>
            ) : emailSent ? (
              <>
                <FiCheck />
                <span className="inv-btn-text">Sent!</span>
              </>
            ) : (
              <>
                <FiMail />
                <span className="inv-btn-text">Email</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ========== INVOICE BODY ========== */}
      <div className="inv-container">
        <div className="inv-paper" ref={invoiceRef}>
          {/* Logo */}
          <div className="inv-logo-section">
            <img
              src="https://ik.imagekit.io/ljwnlcbqyu/CHIAMO-ORDER-LOGO2.png?tr=w-200,f-auto,q-80"
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
            <div className="inv-header-left">
              <div className="inv-info-group">
                <span className="inv-info-label">Bill To:</span>
                <span className="inv-info-value inv-customer-name">{customerName}</span>
              </div>
              {customerEmail && (
                <div className="inv-info-group">
                  <span className="inv-info-label">Email:</span>
                  <span className="inv-info-value">{customerEmail}</span>
                </div>
              )}
              {customerPhone && (
                <div className="inv-info-group">
                  <span className="inv-info-label">Phone:</span>
                  <span className="inv-info-value">{customerPhone}</span>
                </div>
              )}
            </div>

            <div className="inv-header-right">
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
                <span className="inv-info-label">Method:</span>
                <span className="inv-info-value">{deliveryMethod}</span>
              </div>
            </div>
          </div>

          <div className="inv-divider" />

          {/* Items Table */}
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
              {items.length < 3 &&
                [...Array(3 - items.length)].map((_, i) => (
                  <tr key={`empty-${i}`} className="inv-tr inv-tr-empty">
                    <td className="inv-td">&nbsp;</td>
                    <td className="inv-td" />
                    <td className="inv-td" />
                    <td className="inv-td" />
                    <td className="inv-td" />
                    <td className="inv-td" />
                  </tr>
                ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="inv-totals">
            <div className="inv-totals-box">
              <div className="inv-total-row">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="inv-total-row">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? "FREE" : formatCurrency(deliveryFee)}</span>
              </div>
              <div className="inv-total-line" />
              <div className="inv-total-row inv-total-grand">
                <span>Grand Total</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* RAISED Stamp */}
          <div className="inv-stamp-wrapper">
            <span className="inv-stamp">RAISED</span>
          </div>

          {/* Footer */}
          <div className="inv-footer">
            <div className="inv-divider" />
            <p className="inv-thanks">Thank you for your order!</p>
            <p className="inv-footer-line">ChiamoOrder — Port Harcourt, Rivers State, Nigeria</p>
            <p className="inv-footer-line">Email: chiamoorder@gmail.com | Phone: +234 703 241 0362</p>
            <p className="inv-footer-note">
              This is a computer-generated invoice. No signature required.
            </p>
          </div>
        </div>
      </div>

      {/* ✅ ❌ OLD BOTTOM BAR COMPLETELY REMOVED ❌ */}

      <div className="inv-bottom-spacer"></div>
    </div>
  );
}