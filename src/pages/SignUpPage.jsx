import { useState } from "react";
import API from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import { FaCamera, FaEye, FaEyeSlash, FaUser, FaStore, FaPhone, FaEnvelope, FaLock, FaUserTie, FaMapMarkerAlt, FaChevronDown } from "react-icons/fa";
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
    salesExecutive: "",
    location: "",
    latitude: "",
    longitude: "",
    timestamp: "",
    shopPhotoUrl: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const navigate = useNavigate();

  // Sales Executive options
  const salesExecutiveOptions = [
    { value: "", label: "Select Sales Executive (Optional)" },
    { value: "yes", label: "Yes, I have a Sales Executive" },
    { value: "no", label: "No Sales Executive" },
    { value: "request", label: "Request Sales Executive Assignment" }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Convert to lowercase for storage (except password fields)
    const processedValue = name === 'password' ? value : value.toLowerCase();
    
    setFormData({ ...formData, [name]: processedValue });
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

  // Enhanced location capture for mobile devices
  const handleLocationCapture = async () => {
    setIsCapturingLocation(true);
    
    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        toast.error("Location services not supported on this device.", { position: "top-center" });
        return;
      }

      // Show loading toast
      const loadingToast = toast.loading("📍 Capturing your location...", { position: "top-center" });

      // Get current position with mobile-optimized settings
      const position = await new Promise((resolve, reject) => {
        const options = {
          enableHighAccuracy: true, // Use GPS if available
          timeout: 15000, // Increased timeout for mobile
          maximumAge: 300000 // 5 minutes cache
        };

        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          options
        );
      });

      const { latitude, longitude } = position.coords;
      const timestamp = new Date().toISOString();

      console.log('Location captured:', { latitude, longitude, accuracy: position.coords.accuracy });

      // Get address from coordinates with fallback
      let address = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
      
      try {
        // Use multiple geocoding services for better mobile compatibility
        const geocodePromises = [
          // Primary: Nominatim
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`)
            .then(res => res.json()),
          
          // Fallback: Alternative service
          fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
            .then(res => res.json())
        ];

        // Race the geocoding requests
        const results = await Promise.allSettled(geocodePromises);
        
        // Use the first successful result
        for (const result of results) {
          if (result.status === 'fulfilled' && result.value) {
            if (result.value.display_name) {
              address = result.value.display_name;
              break;
            } else if (result.value.locality) {
              address = `${result.value.locality}, ${result.value.city || ''}, ${result.value.countryName || ''}`.replace(/,\s*,/g, ',').trim();
              break;
            }
          }
        }
      } catch (err) {
        console.warn("Geocoding failed:", err);
        toast.warning("Location captured, but address lookup failed. Using coordinates.", { position: "top-center" });
      }

      // Update form data with location
      setFormData((prev) => ({
        ...prev,
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        location: address,
        timestamp,
      }));

      toast.dismiss(loadingToast);
      toast.success("📍 Location captured successfully!", { position: "top-center" });

    } catch (error) {
      console.error("Error capturing location:", error);
      
      let errorMessage = "Failed to capture location. ";
      
      if (error.code === 1) {
        errorMessage += "Please enable location permissions in your browser/device settings.";
      } else if (error.code === 2) {
        errorMessage += "Location unavailable. Please check your GPS/internet connection.";
      } else if (error.code === 3) {
        errorMessage += "Location request timeout. Please try again.";
      } else {
        errorMessage += "Please try again or enter your address manually.";
      }
      
      toast.error(errorMessage, { 
        position: "top-center",
        autoClose: 6000 
      });
    } finally {
      setIsCapturingLocation(false);
    }
  };

  const handleCapture = async () => {
    try {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.capture = "environment";
      input.click();

      input.onchange = async (event) => {
        const file = event.target.files[0];
        if (file) {
          try {
            toast.info("📸 Uploading photo...", { position: "top-center" });
            
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
              shopPhotoUrl: uploadRes.secure_url,
            }));

            toast.success("📸 Shop photo uploaded successfully!", { position: "top-center" });
          } catch (error) {
            console.error("Error uploading photo:", error);
            toast.error("Failed to upload photo. Please try again.", { position: "top-center" });
          }
        }
      };
    } catch (err) {
      console.error("Error capturing photo:", err);
      toast.error("Failed to capture photo. Please try again.", { position: "top-center" });
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

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters!", { position: "top-center" });
      return;
    }

    setIsLoading(true);

    try {
      // Prepare payload with all lowercase fields (except passwords)
      const payload = {
        name: formData.name.toLowerCase(),
        businessName: formData.businessName.toLowerCase(),
        phone: formData.phone.toLowerCase(),
        email: formData.email.toLowerCase(),
        password: formData.password, // Keep original case for password
      };

      // Add optional fields if they have values
      if (formData.salesExecutive.trim() !== "") {
        payload.salesExecutive = formData.salesExecutive;
      }

      if (formData.location.trim() !== "") {
        payload.location = formData.location;
        payload.latitude = formData.latitude;
        payload.longitude = formData.longitude;
        payload.timestamp = formData.timestamp;
      }

      if (formData.shopPhotoUrl.trim() !== "") {
        payload.shopPhotoUrl = formData.shopPhotoUrl;
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
    <div className="signup-new-container">
      {/* Animated background elements */}
      <div className="signup-new-bg-shapes">
        <div className="shape-new shape-new-1"></div>
        <div className="shape-new shape-new-2"></div>
        <div className="shape-new shape-new-3"></div>
        <div className="shape-new shape-new-4"></div>
      </div>

      <div className="signup-new-card">
        <Link to="/" className="signup-new-logo" style={{ textDecoration: "none" }}>
          <div className="signup-new-logo-text">
            Chiamo<span>Order</span>
          </div>
        </Link>

        <form className="signup-new-form" onSubmit={handleSubmit}>
          <h2>Create Account</h2>
          <p className="signup-new-subtitle">Join us and start ordering today</p>

          {/* Full Name */}
          <div className={`input-new-group ${shouldHideIcon('name') ? 'icon-new-hidden' : ''}`}>
            <FaUser className="input-new-icon" />
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
          <div className={`input-new-group ${shouldHideIcon('businessName') ? 'icon-new-hidden' : ''}`}>
            <FaStore className="input-new-icon" />
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
          <div className={`input-new-group ${shouldHideIcon('phone') ? 'icon-new-hidden' : ''}`}>
            <FaPhone className="input-new-icon" />
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
          <div className={`input-new-group ${shouldHideIcon('email') ? 'icon-new-hidden' : ''}`}>
            <FaEnvelope className="input-new-icon" />
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

          {/* Sales Executive Dropdown */}
          <div className="select-new-wrapper">
            <FaUserTie className="select-new-icon" />
            <select 
              name="salesExecutive" 
              value={formData.salesExecutive} 
              onChange={handleChange}
              className="select-new-field"
            >
              {salesExecutiveOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FaChevronDown className="select-new-arrow" />
          </div>

          {/* Password */}
          <div className={`input-new-group password-new-group ${shouldHideIcon('password') ? 'icon-new-hidden' : ''}`}>
            <FaLock className="input-new-icon" />
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
            <label>Password (min 6 characters)</label>
            <span className="password-new-toggle" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Location Field */}
          <div className="location-new-field">
            <div className={`location-new-input-wrapper ${formData.location ? 'has-new-value' : ''}`}>
              <FaMapMarkerAlt className="location-new-icon" />
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
              className={`location-new-btn ${isCapturingLocation ? 'loading' : ''}`}
              onClick={handleLocationCapture} 
              disabled={isCapturingLocation}
              title="Capture your current location"
            >
              <FaMapMarkerAlt />
              <span>{isCapturingLocation ? 'Getting...' : 'Get Location'}</span>
            </button>
            <button 
              type="button" 
              className="camera-new-btn" 
              onClick={handleCapture} 
              title="Capture shop photo"
            >
              <FaCamera />
              <span>Photo</span>
            </button>
          </div>

          {formData.shopPhotoUrl && (
            <div className="photo-new-preview">
              <img src={formData.shopPhotoUrl} alt="Shop Preview" />
              <p>📸 Photo captured at {new Date(formData.timestamp).toLocaleString()}</p>
            </div>
          )}

          {/* Terms */}
          <div className="terms-new-container">
            <label className="terms-new-checkbox">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={() => setAgreeToTerms(!agreeToTerms)}
              />
              <span className="checkmark-new"></span>
              <span className="terms-new-text">
                I agree to the{" "}
                <Link to="/terms" className="privacy-new-link">Terms of Service</Link>
                {" "}and{" "}
                <Link to="/privacy-policy" className="privacy-new-link">Privacy Policy</Link>
              </span>
            </label>
          </div>

          <button
            type="submit"
            className={`signup-new-btn ${!agreeToTerms ? "disabled" : ""} ${isLoading ? "loading" : ""}`}
            disabled={!agreeToTerms || isLoading}
          >
            {isLoading ? (
              <span className="btn-new-loading">
                <span className="spinner-new"></span>
                Creating Account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>

          <div className="divider-new">
            <span>or</span>
          </div>

          <p className="already-new-account">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </form>

        {/* Security Note */}
        <div className="security-new-note">
          <span className="lock-new-icon">🔒</span>
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

export default SignUpPage;