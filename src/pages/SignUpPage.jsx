import { useState } from "react";
import API from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import { FaCamera, FaEye, FaEyeSlash, FaUser, FaStore, FaPhone, FaEnvelope, FaLock, FaUserTie, FaMapMarkerAlt } from "react-icons/fa";
import "./SignUp.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    salesExecutive: "",
    location: "",
    latitude: "",
    longitude: "",
    timestamp: "",
    shopPhotoUrl: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const navigate = useNavigate();

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

  const handleCapture = async () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          const timestamp = new Date().toISOString();

          let address = `Lat: ${latitude}, Lng: ${longitude}`;
          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const geoData = await geoRes.json();
            if (geoData?.display_name) address = geoData.display_name;
          } catch (err) {
            console.warn("Reverse geocoding failed:", err);
          }

          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.capture = "environment";
          input.click();

          input.onchange = async (event) => {
            const file = event.target.files[0];
            if (file) {
              const data = new FormData();
              data.append("file", file);
              data.append("upload_preset", "your_unsigned_preset");

              const res = await fetch(
                "https://api.cloudinary.com/v1_1/djq2ywwry/image/upload",
                { method: "POST", body: data }
              );
              const uploadRes = await res.json();

              setFormData((prev) => ({
                ...prev,
                latitude,
                longitude,
                location: address,
                timestamp,
                shopPhotoUrl: uploadRes.secure_url,
              }));
            }
          };
        });
      } else {
        toast.error("Geolocation not supported.", { position: "top-center" });
      }
    } catch (err) {
      console.error("Error capturing photo:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agreeToTerms) {
      toast.error("Please agree to the Terms & Privacy Policy before proceeding.", {
        position: "top-center",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!", { position: "top-center" });
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters!", { position: "top-center" });
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name: formData.name,
        businessName: formData.businessName,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      if (formData.salesExecutive.trim() !== "") {
        payload.salesExecutive = formData.salesExecutive;
      }

      const response = await API.post("customers/register/", payload);

      if (response && (response.status === 200 || response.status === 201 || response.data)) {
        toast.success("✅ Registration successful! 🎉", { position: "top-center" });
        setTimeout(() => navigate("/login"), 1500);
        return;
      }

    } catch (error) {
      console.error("Registration error:", error);

      if (error.response) {
        const status = error.response.status;
        
        if (status === 200 || status === 201) {
          toast.success("✅ Registration successful! 🎉", { position: "top-center" });
          setTimeout(() => navigate("/login"), 1500);
          return;
        }

        const errorData = error.response.data;
        let errorMsg = "❌ Registration failed, please try again.";

        if (errorData) {
          if (typeof errorData === 'string') {
            errorMsg = errorData;
          } else if (errorData.message) {
            errorMsg = errorData.message;
          } else if (errorData.error) {
            errorMsg = errorData.error;
          } else if (errorData.email) {
            errorMsg = `Email: ${errorData.email}`;
          } else if (errorData.phone) {
            errorMsg = `Phone: ${errorData.phone}`;
          } else {
            const firstKey = Object.keys(errorData)[0];
            if (firstKey && Array.isArray(errorData[firstKey])) {
              errorMsg = `${firstKey}: ${errorData[firstKey][0]}`;
            } else if (firstKey) {
              errorMsg = `${firstKey}: ${errorData[firstKey]}`;
            }
          }
        }

        toast.error(errorMsg, { position: "top-center" });
      } else if (error.request) {
        toast.error("❌ Network error. Please check your connection.", { position: "top-center" });
      } else {
        toast.error("❌ Registration failed, please try again.", { position: "top-center" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      {/* Animated background elements */}
      <div className="signup-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="signup-card">
        <Link to="/" className="signup-logo" style={{ textDecoration: "none" }}>
          <div className="signup-logo-text">
            Chiamo<span>Order</span>
          </div>
        </Link>

        <form className="signup-form" onSubmit={handleSubmit}>
          <h2>Create Account</h2>
          <p className="signup-subtitle">Join us and start ordering today</p>

          {/* Full Name */}
          <div className={`input-group ${shouldHideIcon('name') ? 'icon-hidden' : ''}`}>
            <FaUser className="input-icon" />
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange}
              onFocus={() => handleFocus('name')}
              onBlur={handleBlur}
              placeholder=" "
              required 
            />
            <label>Full Name</label>
          </div>

          {/* Business Name */}
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
            />
            <label>Business Name</label>
          </div>

          {/* Phone Number */}
          <div className={`input-group ${shouldHideIcon('phone') ? 'icon-hidden' : ''}`}>
            <FaPhone className="input-icon" />
            <input 
              type="tel" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange}
              onFocus={() => handleFocus('phone')}
              onBlur={handleBlur}
              placeholder=" "
              required 
            />
            <label>Phone Number</label>
          </div>

          {/* Email */}
          <div className={`input-group ${shouldHideIcon('email') ? 'icon-hidden' : ''}`}>
            <FaEnvelope className="input-icon" />
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange}
              onFocus={() => handleFocus('email')}
              onBlur={handleBlur}
              placeholder=" "
              required 
            />
            <label>Email Address</label>
          </div>

          {/* Sales Executive */}
          <div className={`input-group ${shouldHideIcon('salesExecutive') ? 'icon-hidden' : ''}`}>
            <FaUserTie className="input-icon" />
            <input 
              type="text" 
              name="salesExecutive" 
              value={formData.salesExecutive} 
              onChange={handleChange}
              onFocus={() => handleFocus('salesExecutive')}
              onBlur={handleBlur}
              placeholder=" "
            />
            <label>Sales Executive (Optional)</label>
          </div>

          {/* Password */}
          <div className={`input-group password-group ${shouldHideIcon('password') ? 'icon-hidden' : ''}`}>
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
            />
            <label>Password</label>
            <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Confirm Password */}
          <div className={`input-group password-group ${shouldHideIcon('confirmPassword') ? 'icon-hidden' : ''}`}>
            <FaLock className="input-icon" />
            <input 
              type={showConfirmPassword ? "text" : "password"} 
              name="confirmPassword" 
              value={formData.confirmPassword} 
              onChange={handleChange}
              onFocus={() => handleFocus('confirmPassword')}
              onBlur={handleBlur}
              placeholder=" "
              required 
            />
            <label>Confirm Password</label>
            <span className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Location Field */}
          <div className="location-field">
            <div className={`location-input-wrapper ${formData.location ? 'has-value' : ''}`}>
              <FaMapMarkerAlt className="location-icon" />
              <input 
                type="text" 
                name="location" 
                placeholder="Shop Address (auto-filled)" 
                value={formData.location} 
                readOnly 
              />
            </div>
            <button 
              type="button" 
              className="camera-btn" 
              onClick={handleCapture} 
              title="Capture shop photo & location"
            >
              <FaCamera />
              <span>Capture</span>
            </button>
          </div>

          {formData.shopPhotoUrl && (
            <div className="photo-preview">
              <img src={formData.shopPhotoUrl} alt="Shop Preview" />
              <p>📍 Photo captured at {new Date(formData.timestamp).toLocaleString()}</p>
            </div>
          )}

          {/* Terms */}
          <div className="terms-container">
            <label className="terms-checkbox">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={() => setAgreeToTerms(!agreeToTerms)}
              />
              <span className="checkmark"></span>
              <span className="terms-text">
                I agree to the{" "}
                <Link to="/terms" className="privacy-link">Terms of Service</Link>
                {" "}and{" "}
                <Link to="/privacy-policy" className="privacy-link">Privacy Policy</Link>
              </span>
            </label>
          </div>

          <button
            type="submit"
            className={`signup-btn ${!agreeToTerms ? "disabled" : ""} ${isLoading ? "loading" : ""}`}
            disabled={!agreeToTerms || isLoading}
          >
            {isLoading ? (
              <span className="btn-loading">
                <span className="spinner"></span>
                Creating Account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>

          <div className="divider">
            <span>or</span>
          </div>

          <p className="already-account">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </form>
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

export default SignUpPage;