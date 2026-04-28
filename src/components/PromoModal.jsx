// src/components/PromoModal.jsx
import React, { useEffect, useState } from "react";
import { FiX, FiGift, FiChevronRight } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import "./PromoModal.css";

// ── Promo Theme Colors ────────────────────
// ── Promo Theme Colors ────────────────────
const PROMO_THEMES = {
  jelly_promo: {
    primary: "#7c3aed",
    light: "rgba(124,58,237,0.08)",
    border: "rgba(124,58,237,0.2)",
    tag: "#7c3aed",
    btn: "linear-gradient(135deg, #7c3aed, #6d28d9)",
    btnShadow: "rgba(124,58,237,0.4)",
    btnText: "#ffffff",       // ✅ WHITE - dark purple bg
    titleColor: "#7c3aed",    // ✅ Clear purple title
    topBar: "linear-gradient(90deg, #7c3aed, #a78bfa, #7c3aed)",
  },
  power_mint_promo: {
    primary: "#d4a017",
    light: "rgba(212,160,23,0.08)",
    border: "rgba(212,160,23,0.25)",
    tag: "#d4a017",
    btn: "linear-gradient(135deg, #d4a017, #b8880f)",
    btnShadow: "rgba(212,160,23,0.4)",
    btnText: "#000000",       // ✅ BLACK - gold/yellow bg needs dark text
    titleColor: "#b8880f",    // ✅ Darker gold for title readability
    topBar: "linear-gradient(90deg, #d4a017, #f0c14b, #d4a017)",
  },
  beverage_promo: {
    primary: "#8b0000",
    light: "rgba(139,0,0,0.06)",
    border: "rgba(139,0,0,0.2)",
    tag: "#8b0000",
    btn: "linear-gradient(135deg, #8b0000, #6b0000)",
    btnShadow: "rgba(139,0,0,0.4)",
    btnText: "#ffffff",       // ✅ WHITE - dark red bg
    titleColor: "#8b0000",    // ✅ Clear dark red title
    topBar: "linear-gradient(90deg, #8b0000, #c41e1e, #8b0000)",
  },
  care_promo: {
    primary: "#064e3b",
    light: "rgba(6,78,59,0.06)",
    border: "rgba(6,78,59,0.2)",
    tag: "#064e3b",
    btn: "linear-gradient(135deg, #064e3b, #022c22)",
    btnShadow: "rgba(6,78,59,0.4)",
    btnText: "#ffffff",       // ✅ WHITE - dark green bg
    titleColor: "#064e3b",    // ✅ Clear dark green title
    topBar: "linear-gradient(90deg, #064e3b, #10b981, #064e3b)",
  },
  default: {
    primary: "#143a6e",
    light: "rgba(20,58,110,0.06)",
    border: "rgba(20,58,110,0.2)",
    tag: "#143a6e",
    btn: "linear-gradient(135deg, #143a6e, #0a1f3f)",
    btnShadow: "rgba(20,58,110,0.4)",
    btnText: "#ffffff",       // ✅ WHITE - dark navy bg
    titleColor: "#143a6e",    // ✅ Clear navy title
    topBar: "linear-gradient(90deg, #143a6e, #f5a623, #143a6e)",
  },
};

// ── Confetti ──────────────────────────────
const Confetti = ({ color }) => {
  const pieces = Array.from({ length: 35 }, (_, i) => ({
    id: i,
    style: {
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 2}s`,
      animationDuration: `${2 + Math.random() * 2}s`,
      background: [
        color,
        "#f5a623",
        "#ffffff",
        color,
        "#f0c14b",
      ][Math.floor(Math.random() * 5)],
      width: `${6 + Math.random() * 7}px`,
      height: `${6 + Math.random() * 7}px`,
      borderRadius: Math.random() > 0.5 ? "50%" : "2px",
      opacity: Math.random() * 0.6 + 0.4,
    },
  }));

  return (
    <div className="promo-confetti">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="promo-confetti-piece"
          style={p.style}
        />
      ))}
    </div>
  );
};

// ── Main Modal ────────────────────────────
const PromoModal = ({
  isOpen,
  onClose,
  onAccept,
  onReject,
  promoData,
}) => {
  const [animateIn, setAnimateIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setAnimateIn(true), 50);
    } else {
      setAnimateIn(false);
    }
  }, [isOpen]);

  if (!isOpen || !promoData) return null;

  // Get theme based on promo type
  const theme =
    PROMO_THEMES[promoData.type] || PROMO_THEMES.default;

  const isRedirectType =
    promoData.type === "beverage_promo" ||
    promoData.type === "care_promo";

  const handleAccept = () => {
    onAccept(promoData);
    onClose();
  };

  const handleReject = () => {
    onReject?.();
    onClose();
  };

  const handleRedirect = () => {
  onAccept(promoData);
  onClose();
  // ✅ Add promobag=true to URL so AllProducts knows it's selection mode
  // NOT trigger mode
  const baseUrl = promoData.redirectTo;
  // baseUrl is like "/all-products?category=beverage&promo=beverage_500"
  // We add &promobag=true to it
  navigate(`${baseUrl}&promobag=true`);
};

  return (
    <div
      className={`promo-overlay ${animateIn ? "promo-overlay--in" : ""}`}
      onClick={handleReject}
    >
      <Confetti color={theme.primary} />

      <div
        className={`promo-modal ${animateIn ? "promo-modal--in" : ""}`}
        style={{
          background: "#fff",
          borderColor: theme.border,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Colored top bar */}
        <div
          className="promo-modal__topbar"
          style={{ background: theme.topBar }}
        />

        {/* Close */}
        <button className="promo-close" onClick={handleReject}>
          <FiX size={18} />
        </button>

        {/* Balloons */}
        <div className="promo-balloons">
          <span
            className="promo-balloon promo-balloon--1"
            style={{ filter: `hue-rotate(${promoData.type === "jelly_promo" ? "260deg" : "0deg"})` }}
          >
            🎈
          </span>
          <span className="promo-balloon promo-balloon--2">🎈</span>
          <span className="promo-balloon promo-balloon--3">🎈</span>
        </div>

        {/* Trophy */}
        <div className="promo-trophy">
          <span className="promo-trophy-emoji">
            {promoData.emoji || "🎁"}
          </span>
          <div
            className="promo-trophy-ring promo-trophy-ring--1"
            style={{ borderColor: `${theme.primary}30` }}
          />
          <div
            className="promo-trophy-ring promo-trophy-ring--2"
            style={{ borderColor: `${theme.primary}15` }}
          />
        </div>

        {/* Sparkles */}
        <div className="promo-sparkles">
          <HiOutlineSparkles
            className="promo-sparkle promo-sparkle--1"
            style={{ color: theme.primary }}
          />
          <HiOutlineSparkles
            className="promo-sparkle promo-sparkle--2"
            style={{ color: theme.primary }}
          />
          <HiOutlineSparkles
            className="promo-sparkle promo-sparkle--3"
            style={{ color: "#f5a623" }}
          />
        </div>

        {/* Content */}
        <div className="promo-content">
          {/* Congrats tag */}
          <div
            className="promo-congrats-tag"
            style={{ background: theme.tag }}
          >
            {/* ✅ FIXED: Always white text on colored tag */}
            <span style={{ color: "#ffffff", fontWeight: 800 }}>
              🎉 Congratulations!
            </span>
          </div>

          {/* ✅ FIXED: Use titleColor for better contrast */}
          <h2
            className="promo-title"
            style={{ color: theme.titleColor || theme.primary }}
          >
            {promoData.title}
          </h2>

          {/* ✅ Description always readable */}
          <p className="promo-description" style={{ color: "#374151" }}>
            {promoData.description}
          </p>

          {/* Reward card */}
          <div
            className="promo-detail-card"
            style={{
              background: theme.light,
              borderColor: theme.border,
            }}
          >
            <div
              className="promo-detail-icon"
              style={{ background: theme.primary }}
            >
              {/* ✅ Icon always white */}
              <FiGift size={20} color="#ffffff" />
            </div>
            <div className="promo-detail-text">
              <span className="promo-detail-label">
                Your Reward
              </span>
              <span
                className="promo-detail-value"
                style={{ color: theme.titleColor || theme.primary }}
              >
                {promoData.rewardText}
              </span>
              {promoData.freeItem?.promoTag && (
                <span
                  className="promo-item-tag"
                  style={{ 
                    background: theme.primary,
                    color: "#ffffff"  // ✅ Always white on colored tag
                  }}
                >
                  {promoData.freeItem.promoTag}
                </span>
              )}
            </div>
          </div>

          {/* Expiry */}
          <p className="promo-expiry">
            ⏰ Offer valid until{" "}
            <strong style={{ color: theme.titleColor || theme.primary }}>
              July 14, 2025
            </strong>
          </p>
        </div>

        {/* Buttons */}
        <div className="promo-actions">
          <button
            className="promo-btn promo-btn--reject"
            onClick={handleReject}
          >
            No Thanks
          </button>

          {isRedirectType ? (
            <button
              className="promo-btn promo-btn--accept"
              style={{
                background: theme.btn,
                boxShadow: `0 4px 14px ${theme.btnShadow}`,
                color: theme.btnText,          // ✅ Always explicit color
                textShadow: theme.btnText === "#000000" 
                  ? "none"                      // ✅ No shadow on dark text
                  : "0 1px 3px rgba(0,0,0,0.4)", // ✅ Shadow only on white text
                fontWeight: "800",
              }}
              onClick={handleRedirect}
            >
              <FiGift size={15} />
              Select Free Items
              <FiChevronRight size={15} />
            </button>
          ) : (
            <button
              className="promo-btn promo-btn--accept"
              style={{
                background: theme.btn,
                boxShadow: `0 4px 14px ${theme.btnShadow}`,
                color: theme.btnText,          // ✅ Always explicit color
                textShadow: theme.btnText === "#000000"
                  ? "none"
                  : "0 1px 3px rgba(0,0,0,0.4)",
                fontWeight: "800",
              }}
              onClick={handleAccept}
            >
              <FiGift size={15} />
              Claim Reward!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromoModal;