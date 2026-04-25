// src/components/PromoModal.jsx
import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";
import { FiX, FiGift, FiChevronRight } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import "./PromoModal.css";

// ============ CONFETTI PIECE ============
const ConfettiPiece = ({ style }) => (
  <div className="promo-confetti-piece" style={style} />
);

// ============ CONFETTI ============
const Confetti = () => {
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    style: {
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 2}s`,
      animationDuration: `${2 + Math.random() * 2}s`,
      background: [
        "#f5a623", "#143a6e", "#10b981",
        "#ef4444", "#8b5cf6", "#06b6d4",
      ][Math.floor(Math.random() * 6)],
      width: `${6 + Math.random() * 8}px`,
      height: `${6 + Math.random() * 8}px`,
      borderRadius: Math.random() > 0.5 ? "50%" : "2px",
    },
  }));

  return (
    <div className="promo-confetti">
      {pieces.map((p) => (
        <ConfettiPiece key={p.id} style={p.style} />
      ))}
    </div>
  );
};

// ============ PROMO MODAL ============
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
    navigate(promoData.redirectTo);
  };

  // Types: 'free_item' | 'redirect_promo'
  const isRedirectType =
    promoData.type === "beverage_promo" ||
    promoData.type === "care_promo";

  return (
    <div
      className={`promo-overlay ${animateIn ? "promo-overlay--in" : ""}`}
      onClick={handleReject}
    >
      <Confetti />

      <div
        className={`promo-modal ${animateIn ? "promo-modal--in" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button className="promo-close" onClick={handleReject}>
          <FiX size={18} />
        </button>

        {/* Balloons Row */}
        <div className="promo-balloons">
          <span className="promo-balloon promo-balloon--1">🎈</span>
          <span className="promo-balloon promo-balloon--2">🎈</span>
          <span className="promo-balloon promo-balloon--3">🎈</span>
        </div>

        {/* Trophy / Gift Icon */}
        <div className="promo-trophy">
          <span className="promo-trophy-emoji">
            {promoData.emoji || "🎁"}
          </span>
          <div className="promo-trophy-ring promo-trophy-ring--1" />
          <div className="promo-trophy-ring promo-trophy-ring--2" />
        </div>

        {/* Sparkles */}
        <div className="promo-sparkles">
          <HiOutlineSparkles className="promo-sparkle promo-sparkle--1" />
          <HiOutlineSparkles className="promo-sparkle promo-sparkle--2" />
          <HiOutlineSparkles className="promo-sparkle promo-sparkle--3" />
        </div>

        {/* Content */}
        <div className="promo-content">
          <div className="promo-congrats-tag">
            🎉 Congratulations!
          </div>

          <h2 className="promo-title">{promoData.title}</h2>

          <p className="promo-description">{promoData.description}</p>

          {/* Promo Detail Card */}
          <div className="promo-detail-card">
            <div className="promo-detail-icon">
              <FiGift size={20} />
            </div>
            <div className="promo-detail-text">
              <span className="promo-detail-label">Your Reward</span>
              <span className="promo-detail-value">
                {promoData.rewardText}
              </span>
              {/* ✅ Promo tag badge */}
              {promoData.freeItem?.promoTag && (
                <span className="promo-item-tag">
                  {promoData.freeItem.promoTag}
                </span>
              )}
            </div>
          </div>

          {/* Expiry Note */}
          <p className="promo-expiry">
            ⏰ Offer valid until <strong>June 14, 2025</strong>
          </p>
        </div>

        {/* Action Buttons */}
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
              onClick={handleRedirect}
            >
              <FiGift size={15} />
              Select Free Items
              <FiChevronRight size={15} />
            </button>
          ) : (
            <button
              className="promo-btn promo-btn--accept"
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