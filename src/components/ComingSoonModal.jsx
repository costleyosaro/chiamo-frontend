// src/components/ComingSoonModal.jsx
import React, { useState, useEffect } from "react";
import { FaTimes, FaBell, FaRocket, FaCheckCircle } from "react-icons/fa";
import "./ComingSoonModal.css";

const ComingSoonModal = ({ isOpen, onClose, featureName = "This Feature" }) => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  
  // Handle Escape key and body scroll
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Small delay to allow close animation
      const timer = setTimeout(() => {
        setIsSubscribed(false);
        setEmail("");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // ✅ NOW we can do conditional return - AFTER all hooks
  if (!isOpen) return null;

  const handleNotifyMe = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) return;

    setIsLoading(true);
    
    try {
      // TODO: Replace with your actual API call
      // await API.post('/notifications/subscribe/', { email, feature: featureName });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      setIsSubscribed(true);
    } catch (error) {
      console.error("Failed to subscribe:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="coming-soon-overlay" onClick={handleClose}>
      <div className="coming-soon-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button 
          className="coming-soon-close" 
          onClick={handleClose}
          aria-label="Close modal"
        >
          <FaTimes />
        </button>

        {/* Animated Rocket Icon */}
        <div className="coming-soon-icon">
          <div className="rocket-container">
            <FaRocket className="rocket-icon" />
            <div className="rocket-stars">
              <span className="star star-1">✦</span>
              <span className="star star-2">✦</span>
              <span className="star star-3">✦</span>
            </div>
          </div>
          <div className="rocket-glow"></div>
        </div>

        {/* Content */}
        <div className="coming-soon-content">
          <span className="coming-soon-badge-large">Coming Soon</span>
          <h2 className="coming-soon-title">{featureName}</h2>
          <p className="coming-soon-description">
            We're working hard to bring you this exciting feature. 
            Stay tuned for updates!
          </p>

          {/* Features Preview */}
          <div className="coming-soon-features">
            <div className="feature-preview">
              <span className="feature-icon">💳</span>
              <span className="feature-text">Seamless transactions</span>
            </div>
            <div className="feature-preview">
              <span className="feature-icon">🔒</span>
              <span className="feature-text">Secure & encrypted</span>
            </div>
            <div className="feature-preview">
              <span className="feature-icon">🎁</span>
              <span className="feature-text">Exclusive rewards</span>
            </div>
          </div>

          {/* Notify Form or Success Message */}
          {!isSubscribed ? (
            <form className="notify-form" onSubmit={handleNotifyMe}>
              <div className="notify-input-group">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
                <button 
                  type="submit" 
                  className={`notify-btn ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="btn-spinner"></span>
                  ) : (
                    <>
                      <FaBell className="btn-icon" />
                      <span>Notify Me</span>
                    </>
                  )}
                </button>
              </div>
              <p className="notify-note">
                Be the first to know when <strong>{featureName}</strong> launches!
              </p>
            </form>
          ) : (
            <div className="subscribed-message">
              <div className="success-icon-wrapper">
                <FaCheckCircle className="success-icon" />
              </div>
              <h3>You're on the list!</h3>
              <p>We'll notify you when <strong>{featureName}</strong> is ready.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="coming-soon-footer">
          <button className="back-btn" onClick={handleClose}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonModal;