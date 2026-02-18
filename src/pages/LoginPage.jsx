// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaStore, FaLock, FaSignInAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { login } from "../services/customers";
import API from "../services/api";
import "./Login.css";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [formData, setFormData] = useState({
    businessName: "",
    password: "",
  });

  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField("");
  };

  // Check if icon should be hidden (when focused or has value)
  const shouldHideIcon = (fieldName) => {
    return focusedField === fieldName || formData[fieldName]?.length > 0;
  };

  const saveTokens = (access, refresh) => {
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
    API.defaults.headers.common["Authorization"] = `Bearer ${access}`;
  };

  const refreshAccessToken = async () => {
    const refresh = localStorage.getItem("refresh");
    if (!refresh) return null;

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/token/refresh/", {
        refresh,
      });
      const newAccess = res.data.access;
      if (newAccess) {
        localStorage.setItem("access", newAccess);
        API.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
        console.log("🔁 Access token refreshed");
        return newAccess;
      }
    } catch (err) {
      console.warn("❌ Token refresh failed:", err.response?.data || err.message);
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.businessName.trim()) {
      toast.error("Please enter your business name", { 
        position: "top-center",
        icon: "⚠️"
      });
      return;
    }

    if (!formData.password) {
      toast.error("Please enter your password", { 
        position: "top-center",
        icon: "⚠️"
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await login({
        business_name: formData.businessName,
        password: formData.password,
      });

      // Check if response is successful
      if (res && res.data) {
        const { access, refresh } = res.data;
        
        if (!access || !refresh) {
          throw new Error("Invalid response from server");
        }

        saveTokens(access, refresh);

        // Fetch user profile
        await refreshUser();

        const userData = JSON.parse(localStorage.getItem("auth_user"));

        // Apply theme
        try {
          const themeRes = await API.get("/customers/theme/");
          const userTheme = themeRes.data?.theme || "light";
          if (userData?.id) {
            localStorage.setItem(`theme-${userData.id}`, userTheme);
          }
          document.documentElement.setAttribute("data-theme", userTheme);
          console.log(`🎨 Applied theme:`, userTheme);
        } catch (themeErr) {
          console.warn("⚠️ Theme fetch failed:", themeErr.message);
        }

        // Wait for user data to be set
        const waitForUser = () =>
          new Promise((resolve, reject) => {
            let attempts = 0;
            const check = setInterval(() => {
              attempts++;
              const u = JSON.parse(localStorage.getItem("auth_user"));
              if (u) {
                clearInterval(check);
                resolve(u);
              }
              if (attempts > 100) { // 5 seconds timeout
                clearInterval(check);
                resolve(null);
              }
            }, 50);
          });

        await waitForUser();

        // Show success message
        toast.success(
          <div className="toast-content">
            <span className="toast-icon">🎉</span>
            <div className="toast-text">
              <strong>Welcome back!</strong>
              <span>Login successful</span>
            </div>
          </div>,
          { 
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
          }
        );

        // Start sliding session refresh
        setInterval(refreshAccessToken, 4 * 60 * 1000);

        // Navigate to home after short delay
        setTimeout(() => {
          navigate("/home", { replace: true });
        }, 1000);
      }

    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);

      // Check if actually successful (same fix as signup)
      if (err.response) {
        const status = err.response.status;
        
        if (status === 200 || status === 201) {
          // Actually successful
          toast.success("✅ Login successful!", { position: "top-center" });
          setTimeout(() => navigate("/home", { replace: true }), 1500);
          return;
        }
      }

      // Handle different error cases
      let errorTitle = "Login Failed";
      let errorMessage = "Please try again.";

      if (err.response) {
        const errorData = err.response.data;
        const status = err.response.status;

        switch (status) {
          case 400:
            errorTitle = "Invalid Request";
            errorMessage = "Please check your input and try again.";
            break;
          case 401:
            errorTitle = "Invalid Credentials";
            errorMessage = "Business name or password is incorrect.";
            break;
          case 403:
            errorTitle = "Access Denied";
            errorMessage = "Your account may be suspended. Contact support.";
            break;
          case 404:
            errorTitle = "Account Not Found";
            errorMessage = "No account found with this business name.";
            break;
          case 429:
            errorTitle = "Too Many Attempts";
            errorMessage = "Please wait a moment before trying again.";
            break;
          case 500:
            errorTitle = "Server Error";
            errorMessage = "Something went wrong. Please try again later.";
            break;
          default:
            if (errorData?.error) {
              errorMessage = errorData.error;
            } else if (errorData?.detail) {
              errorMessage = errorData.detail;
            } else if (errorData?.message) {
              errorMessage = errorData.message;
            } else if (typeof errorData === 'string') {
              errorMessage = errorData;
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

  return (
    <div className="login-container">
      {/* Animated background elements */}
      <div className="login-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>

      <div className="login-card">
        <Link to="/" className="logo-section">
          <div className="signin-logo-text">
            Chiamo<span>Order</span>
          </div>
        </Link>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-header">
            <h2>Welcome Back</h2>
            <p className="login-subtitle">Sign in to continue to your account</p>
          </div>

          {/* Business Name Field */}
          <div className={`input-group ${shouldHideIcon('businessName') ? 'icon-hidden' : ''}`}>
            <FaStore className="input-icon" />
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              onFocus={() => handleFocus('businessName')}
              onBlur={handleBlur}
              placeholder=" "
              required
              autoComplete="organization"
            />
            <label>Business Name</label>
          </div>

          {/* Password Field */}
          <div className={`input-group password-field ${shouldHideIcon('password') ? 'icon-hidden' : ''}`}>
            <FaLock className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => handleFocus('password')}
              onBlur={handleBlur}
              placeholder=" "
              required
              autoComplete="current-password"
            />
            <label>Password</label>
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              role="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Forgot Password */}
          <div className="forgot-password">
            <Link to="/forgot-password" className="reset-link">
              Forgot your password?
            </Link>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className={`login-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="btn-loading">
                <span className="spinner"></span>
                Signing in...
              </span>
            ) : (
              <span className="btn-content">
                <FaSignInAlt className="btn-icon" />
                Sign In
              </span>
            )}
          </button>

          {/* Divider */}
          <div className="divider">
            <span>or</span>
          </div>

          {/* Register Link */}
          <p className="switch-auth">
            Don't have an account? <Link to="/signup">Create Account</Link>
          </p>
        </form>

        {/* Security Note */}
        <div className="security-note">
          <span className="lock-icon">🔒</span>
          <span>Your data is protected with end-to-end encryption</span>
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

export default LoginPage;