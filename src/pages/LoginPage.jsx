// src/pages/LoginPage.jsx
import React, { useState, useEffect } from "react";
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
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    password: "",
  });

  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  // Load saved credentials on component mount
  useEffect(() => {
    console.log("🔍 LOGIN PAGE MOUNTED - Checking localStorage...");
    
    const rememberedBusinessName = localStorage.getItem("remembered_business_name");
    const isRemembered = localStorage.getItem("remember_business_name") === "true";
    
    console.log("Remembered business name:", rememberedBusinessName);
    console.log("Is remembered flag:", isRemembered);
    
    if (rememberedBusinessName && isRemembered) {
      console.log("✅ Auto-filling business name:", rememberedBusinessName);
      setFormData(prev => ({ 
        ...prev, 
        businessName: rememberedBusinessName // Keep original case for display
      }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // 🔍 DEBUG: Track input changes but DON'T convert case here
    console.log(`🔍 Input changed - ${name}:`, value);
    
    // ✅ Keep original case for user experience
    setFormData({ ...formData, [name]: value });
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField("");
  };

  const shouldHideIcon = (fieldName) => {
    return focusedField === fieldName || formData[fieldName]?.length > 0;
  };

  const saveTokens = (access, refresh) => {
    console.log("💾 Saving tokens...");
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
    API.defaults.headers.common["Authorization"] = `Bearer ${access}`;
    console.log("✅ Tokens saved successfully");
  };

  const handleRememberMeChange = (e) => {
    const checked = e.target.checked;
    console.log("🔍 Remember me changed:", checked);
    setRememberMe(checked);
    
    if (!checked) {
      console.log("🗑️ Removing remembered credentials");
      localStorage.removeItem("remembered_business_name");
      localStorage.removeItem("remember_business_name");
    }
  };

  const handleCredentialStorage = () => {
    console.log("🔍 Handling credential storage...");
    
    if (rememberMe && formData.businessName.trim()) {
      // ✅ Store the original case business name for display purposes
      localStorage.setItem("remembered_business_name", formData.businessName.trim());
      localStorage.setItem("remember_business_name", "true");
      console.log("✅ Credentials stored for next login");
    } else {
      localStorage.removeItem("remembered_business_name");
      localStorage.removeItem("remember_business_name");
      console.log("🗑️ Credentials removed");
    }
  };

  const refreshAccessToken = async () => {
    const refresh = localStorage.getItem("refresh");
    if (!refresh) return null;

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"}/token/refresh/`, {
        refresh: refresh
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

    console.log("🚀 LOGIN FORM SUBMITTED");
    console.log("=".repeat(50));

    // Form validation
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

    if (formData.businessName.trim().length < 2) {
      toast.error("Business name must be at least 2 characters", { 
        position: "top-center",
        icon: "⚠️"
      });
      return;
    }

    setIsLoading(true);

    try {
      // ✅ FIXED: Send original case to backend - let backend handle case insensitivity
      const loginPayload = {
        business_name: formData.businessName.trim(), // ✅ Keep original case
        password: formData.password, // ✅ Always keep original case for password
      };

      console.log("🔍 PAYLOAD PREPARATION:");
      console.log("Original business name (what user typed):", JSON.stringify(formData.businessName));
      console.log("Trimmed business name (sent to API):", JSON.stringify(loginPayload.business_name));
      console.log("Password length:", loginPayload.password.length);

      console.log("📡 Making login API call with original case...");
      const res = await login(loginPayload);

      console.log("✅ LOGIN API RESPONSE RECEIVED:");
      console.log("Response status:", res?.status);
      console.log("Response data keys:", Object.keys(res?.data || {}));

      // Check if response is successful
      if (res && res.data) {
        const { access, refresh } = res.data;
        
        console.log("🔍 TOKEN VALIDATION:");
        console.log("Access token exists:", !!access);
        console.log("Refresh token exists:", !!refresh);
        
        if (!access || !refresh) {
          console.log("❌ Missing tokens in response");
          throw new Error("Invalid response from server - missing tokens");
        }

        console.log("✅ Tokens validated successfully");

        // Save credentials if "Remember me" is checked
        handleCredentialStorage();

        // Save tokens
        saveTokens(access, refresh);

        // Fetch user profile
        console.log("👤 Fetching user profile...");
        await refreshUser();

        const userData = JSON.parse(localStorage.getItem("auth_user"));
        console.log("User data loaded:", !!userData);

        // Apply theme
        try {
          console.log("🎨 Applying theme...");
          const themeRes = await API.get("/customers/theme/");
          const userTheme = themeRes.data?.theme || "light";
          if (userData?.id) {
            localStorage.setItem(`theme-${userData.id}`, userTheme);
          }
          document.documentElement.setAttribute("data-theme", userTheme);
          console.log(`✅ Theme applied:`, userTheme);
        } catch (themeErr) {
          console.warn("⚠️ Theme fetch failed:", themeErr.message);
        }

        // Wait for user data to be set
        console.log("⏳ Waiting for user data...");
        const waitForUser = () =>
          new Promise((resolve) => {
            let attempts = 0;
            const check = setInterval(() => {
              attempts++;
              const u = JSON.parse(localStorage.getItem("auth_user"));
              if (u) {
                clearInterval(check);
                resolve(u);
              }
              if (attempts > 100) {
                console.log("⏰ User data wait timeout");
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
        console.log("🏠 Navigating to home page...");
        setTimeout(() => {
          navigate("/home", { replace: true });
        }, 1000);

      } else {
        console.log("❌ Invalid response structure:", res);
        throw new Error("Invalid response from server");
      }

    } catch (err) {
      console.log("❌ LOGIN ERROR OCCURRED:");
      console.log("Error type:", err.constructor.name);
      console.log("Error message:", err.message);

      if (err.response) {
        console.log("🔍 HTTP ERROR RESPONSE:");
        console.log("Status:", err.response.status);
        console.log("Data:", err.response.data);
      } else if (err.request) {
        console.log("🔍 NETWORK ERROR - No response received");
      }

      // Check if actually successful (status 200/201 but thrown as error)
      if (err.response) {
        const status = err.response.status;
        
        if (status === 200 || status === 201) {
          console.log("✅ Error was actually successful response");
          handleCredentialStorage();
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

        console.log("🔍 Error details:", { status, errorData });

        switch (status) {
          case 400:
            errorTitle = "Invalid Request";
            if (errorData?.business_name) {
              errorMessage = `Business name error: ${errorData.business_name}`;
            } else if (errorData?.password) {
              errorMessage = `Password error: ${errorData.password}`;
            } else if (errorData?.non_field_errors) {
              errorMessage = Array.isArray(errorData.non_field_errors) 
                ? errorData.non_field_errors[0] 
                : errorData.non_field_errors;
            } else {
              errorMessage = "Please check your input and try again.";
            }
            break;
          case 401:
            errorTitle = "Invalid Credentials";
            errorMessage = "Business name or password is incorrect. Please check your credentials.";
            break;
          case 403:
            errorTitle = "Access Denied";
            errorMessage = "Your account may be suspended. Contact support.";
            break;
          case 404:
            errorTitle = "Account Not Found";
            errorMessage = "No account found with this business name. Please check the spelling.";
            break;
          case 429:
            errorTitle = "Too Many Attempts";
            errorMessage = "Please wait a moment before trying again.";
            break;
          case 500:
            errorTitle = "Server Error";
            errorMessage = "Something went wrong on our end. Please try again later.";
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
        errorMessage = "Please check your internet connection and try again.";
      } else {
        errorTitle = "Unexpected Error";
        errorMessage = err.message || "Something went wrong. Please try again.";
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
          autoClose: 5000,
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

          {/* Remember Me and Forgot Password Row */}
          <div className="login-options">
            <label className="remember-me-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={handleRememberMeChange}
                className="remember-me-checkbox"
              />
              <span className="checkmark"></span>
              <span className="remember-text">Remember my business name</span>
            </label>
            
            <Link to="/forgot-password" className="reset-link">
              Forgot password?
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