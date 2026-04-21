// src/components/CookieConsent.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./CookieConsent.css";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    // Check if user already made a choice
    const consent = localStorage.getItem("chiamoorder_cookie_consent");
    if (!consent) {
      // Show banner after a short delay (let page load first)
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    setClosing(true);
    setTimeout(() => {
      localStorage.setItem("chiamoorder_cookie_consent", "accepted");
      localStorage.setItem("chiamoorder_cookie_date", new Date().toISOString());
      setVisible(false);
    }, 500);
  };

  const handleReject = () => {
    setClosing(true);
    setTimeout(() => {
      localStorage.setItem("chiamoorder_cookie_consent", "rejected");
      localStorage.setItem("chiamoorder_cookie_date", new Date().toISOString());
      setVisible(false);
    }, 500);
  };

  if (!visible) return null;

  return (
    <div className={`cookie-overlay ${closing ? "cookie-overlay--closing" : ""}`}>
      <div className={`cookie-banner ${closing ? "cookie-banner--closing" : ""}`}>
        {/* Cookie Icon */}
        <div className="cookie-banner__icon">
          <svg
            width="48"
            height="48"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="32" cy="32" r="30" fill="#D4A017" />
            <circle cx="20" cy="22" r="4" fill="#8B6914" />
            <circle cx="38" cy="18" r="3" fill="#8B6914" />
            <circle cx="28" cy="38" r="4" fill="#8B6914" />
            <circle cx="44" cy="34" r="3" fill="#8B6914" />
            <circle cx="16" cy="40" r="2.5" fill="#8B6914" />
            <circle cx="42" cy="48" r="2" fill="#8B6914" />
            <circle cx="32" cy="28" r="2" fill="#8B6914" />
            {/* Bite mark */}
            <path
              d="M54 12 Q58 18 56 24 Q52 20 48 22 Q50 16 54 12Z"
              fill="white"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="cookie-banner__content">
          <h3 className="cookie-banner__title">🍪 We Value Your Privacy</h3>
          <p className="cookie-banner__text">
            We use cookies to enhance your shopping experience, remember your
            preferences, and analyze our traffic. By clicking{" "}
            <strong>"Accept All"</strong>, you consent to our use of cookies.
          </p>
          <Link to="/cookie-policy" className="cookie-banner__link">
            Read our Cookie Policy →
          </Link>
        </div>

        {/* Buttons */}
        <div className="cookie-banner__actions">
          <button
            className="cookie-btn cookie-btn--accept"
            onClick={handleAccept}
          >
            <span className="cookie-btn__icon">✓</span>
            Accept All
          </button>
          <button
            className="cookie-btn cookie-btn--reject"
            onClick={handleReject}
          >
            <span className="cookie-btn__icon">✕</span>
            Reject All
          </button>
        </div>

        {/* Decorative elements */}
        <div className="cookie-banner__sparkle cookie-banner__sparkle--1">✦</div>
        <div className="cookie-banner__sparkle cookie-banner__sparkle--2">✦</div>
        <div className="cookie-banner__sparkle cookie-banner__sparkle--3">✦</div>
      </div>
    </div>
  );
};

export default CookieConsent;