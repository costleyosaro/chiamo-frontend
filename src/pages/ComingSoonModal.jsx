// src/components/ComingSoonModal.jsx
import React from "react";
import { FiX, FiClock, FiBell } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi";
import "./ComingSoonModal.css";

const ComingSoonModal = ({ isOpen, onClose, feature = "This feature" }) => {
  if (!isOpen) return null;

  const handleNotify = () => {
    // You can integrate with your notification system or email service
    alert("We'll notify you when this feature is ready!");
    onClose();
  };

  return (
    <div className="coming-soon-overlay" onClick={onClose}>
      <div className="coming-soon-modal" onClick={(e) => e.stopPropagation()}>
        <button className="coming-soon-close" onClick={onClose}>
          <FiX />
        </button>

        <div className="coming-soon-icon">
          <HiOutlineSparkles className="sparkle-1" />
          <FiClock />
          <HiOutlineSparkles className="sparkle-2" />
        </div>

        <h2 className="coming-soon-title">Coming Soon!</h2>
        
        <p className="coming-soon-text">
          <strong>{feature}</strong> is currently under development. 
          We're working hard to bring you an amazing experience.
        </p>

        <div className="coming-soon-features">
          <div className="coming-soon-feature">
            <span className="feature-dot"></span>
            <span>Expected launch: Q2 2025</span>
          </div>
          <div className="coming-soon-feature">
            <span className="feature-dot"></span>
            <span>Be the first to know when it's ready</span>
          </div>
        </div>

        <div className="coming-soon-actions">
          <button className="coming-soon-btn primary" onClick={handleNotify}>
            <FiBell />
            Notify Me
          </button>
          <button className="coming-soon-btn secondary" onClick={onClose}>
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonModal;