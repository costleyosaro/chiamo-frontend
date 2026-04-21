// src/components/CookieConsent.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./CookieConsent.css";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("chiamoorder_cookie_consent");
    if (!consent) {
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

        {/* Top Row: Emoji + Title */}
        <div className="cookie-banner__header">
          <span className="cookie-banner__emoji">🍪</span>
          <div>
            <h3 className="cookie-banner__title">We Use Cookies</h3>
            <p className="cookie-banner__subtitle">Your privacy matters to us</p>
          </div>
        </div>

        {/* Divider */}
        <div className="cookie-banner__divider" />

        {/* Body Text */}
        <p className="cookie-banner__text">
          We use cookies to enhance your shopping experience on{" "}
          <strong>ChiamoOrder</strong>, remember your preferences, and
          understand how you interact with our platform. You can choose to
          accept or decline.
        </p>

        {/* Cookie Policy Link */}
        <Link to="/cookie-policy" className="cookie-banner__link">
          📄 Read our full Cookie Policy
        </Link>

        {/* Buttons */}
        <div className="cookie-banner__actions">
          <button
            className="cookie-btn cookie-btn--reject"
            onClick={handleReject}
          >
            Reject All
          </button>
          <button
            className="cookie-btn cookie-btn--accept"
            onClick={handleAccept}
          >
            ✓ Accept All Cookies
          </button>
        </div>

      </div>
    </div>
  );
};

export default CookieConsent;