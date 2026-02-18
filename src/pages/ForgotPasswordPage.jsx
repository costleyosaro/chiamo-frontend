// src/pages/ForgotPasswordPage.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaEnvelope, FaPaperPlane, FaArrowLeft } from "react-icons/fa";
import API from "../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Auth.css";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  const handleFocus = () => {
    setFocusedField("email");
  };

  const handleBlur = () => {
    setFocusedField("");
  };

  // Check if icon should be hidden
  const shouldHideIcon = () => {
    return focusedField === "email" || email.length > 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Email validation
    if (!email.trim()) {
      toast.error("Please enter your email address", {
        position: "top-center",
        icon: "⚠️"
      });
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address", {
        position: "top-center",
        icon: "⚠️"
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await API.post("forgot-password/", { email });

      if (response && (response.status === 200 || response.status === 201 || response.data)) {
        setIsEmailSent(true);
        toast.success(
          <div className="toast-content">
            <span className="toast-icon">📩</span>
            <div className="toast-text">
              <strong>Email Sent!</strong>
              <span>Check your inbox for the reset link</span>
            </div>
          </div>,
          { 
            position: "top-center",
            autoClose: 4000,
          }
        );
        return;
      }

    } catch (err) {
      console.error("Error:", err);

      // Check if actually successful
      if (err.response) {
        const status = err.response.status;
        
        if (status === 200 || status === 201) {
          setIsEmailSent(true);
          toast.success("Password reset link sent to your email 📩", {
            position: "top-center",
          });
          return;
        }
      }

      // Handle different error cases
      let errorTitle = "Request Failed";
      let errorMessage = "Please try again.";

      if (err.response) {
        const errorData = err.response.data;
        const status = err.response.status;

        switch (status) {
          case 400:
            errorTitle = "Invalid Email";
            errorMessage = "Please check your email address.";
            break;
          case 404:
            errorTitle = "Email Not Found";
            errorMessage = "No account found with this email.";
            break;
          case 429:
            errorTitle = "Too Many Requests";
            errorMessage = "Please wait before trying again.";
            break;
          case 500:
            errorTitle = "Server Error";
            errorMessage = "Something went wrong. Try again later.";
            break;
          default:
            if (errorData?.error) {
              errorMessage = errorData.error;
            } else if (errorData?.detail) {
              errorMessage = errorData.detail;
            } else if (errorData?.message) {
              errorMessage = errorData.message;
            }
        }
      } else if (err.request) {
        errorTitle = "Network Error";
        errorMessage = "Please check your internet connection.";
      }

      toast.error(
        <div className="toast-content">
          <span className="toast-icon">❌</span>
          <div className="toast-text">
            <strong>{errorTitle}</strong>
            <span>{errorMessage}</span>
          </div>
        </div>,
        { 
          position: "top-center",
          autoClose: 4000,
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    setIsEmailSent(false);
    setEmail("");
  };

  return (
    <div className="auth-container">
      {/* Animated background elements */}
      <div className="auth-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="auth-card">
        {/* Back to Login Link */}
        <Link to="/login" className="back-link">
          <FaArrowLeft />
          <span>Back to Login</span>
        </Link>

        {/* Logo */}
        <Link to="/" className="logo-section">
          <div className="logo-text">
            Chiamo<span>Order</span>
          </div>
        </Link>

        {!isEmailSent ? (
          /* Form State */
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-header">
              <div className="icon-circle">
                <FaEnvelope />
              </div>
              <h2>Forgot Password?</h2>
              <p className="auth-subtitle">
                No worries! Enter your email and we'll send you a reset link.
              </p>
            </div>

            {/* Email Field */}
            <div className={`input-group ${shouldHideIcon() ? 'icon-hidden' : ''}`}>
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder=" "
                required
                autoComplete="email"
              />
              <label>Email Address</label>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className={`auth-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="btn-loading">
                  <span className="spinner"></span>
                  Sending...
                </span>
              ) : (
                <span className="btn-content">
                  <FaPaperPlane className="btn-icon" />
                  Send Reset Link
                </span>
              )}
            </button>

            {/* Divider */}
            <div className="divider">
              <span>or</span>
            </div>

            {/* Back to Login */}
            <p className="switch-auth">
              Remember your password? <Link to="/login">Sign In</Link>
            </p>
          </form>
        ) : (
          /* Success State */
          <div className="success-state">
            <div className="success-icon">
              <span>✉️</span>
            </div>
            <h2>Check Your Email</h2>
            <p className="success-message">
              We've sent a password reset link to:
            </p>
            <p className="email-sent">{email}</p>
            <p className="success-note">
              Didn't receive the email? Check your spam folder or
            </p>
            <button 
              type="button" 
              className="resend-btn"
              onClick={handleResend}
            >
              Try another email
            </button>

            <div className="divider">
              <span>or</span>
            </div>

            <Link to="/login" className="back-to-login-btn">
              <FaArrowLeft />
              Back to Login
            </Link>
          </div>
        )}

        {/* Help Note */}
        <div className="help-note">
          <span>🔐</span>
          <span>Need help? <a href="mailto:support@chiamoorder.com">Contact Support</a></span>
        </div>
      </div>

      <ToastContainer 
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default ForgotPasswordPage;