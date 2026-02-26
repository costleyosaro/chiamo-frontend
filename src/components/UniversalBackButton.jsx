// src/components/UniversalBackButton.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiChevronLeft, FiHome } from "react-icons/fi";
import "./UniversalBackButton.css";

const UniversalBackButton = ({ 
  customAction = null, 
  showOnHome = false, 
  className = "",
  style = {} 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on home page unless explicitly requested
  const isHomePage = location.pathname === "/" || location.pathname === "/home";
  if (isHomePage && !showOnHome) {
    return null;
  }

  const handleBack = () => {
    if (customAction) {
      customAction();
    } else {
      // Check if there's history to go back to
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        // Fallback to home if no history
        navigate("/");
      }
    }
  };

  return (
    <button 
      className={`universal-back-btn ${className}`}
      onClick={handleBack}
      style={style}
      aria-label="Go back"
    >
      <FiChevronLeft />
      <span className="back-text">Back</span>
    </button>
  );
};

export default UniversalBackButton;