// src/pages/EditProfile.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import "./EditProfile.css";

// Icons
import {
  FiChevronLeft,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCamera,
  FiUpload,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiSave,
  FiRefreshCw,
  FiShield,
  FiTrash2,
  FiBriefcase,
  FiNavigation,
  FiImage,
} from "react-icons/fi";
import { HiOutlineQrcode } from "react-icons/hi";

// ============ SUB-COMPONENTS ============

// Header Component
const EditHeader = ({ onBack, onSave, saving }) => (
  <header className="ep-header">
    <button className="ep-back-btn" onClick={onBack} aria-label="Go back">
      <FiChevronLeft />
    </button>
    <h1 className="ep-header-title">Edit Profile</h1>
    <button
      className="ep-save-btn"
      onClick={onSave}
      disabled={saving}
      aria-label="Save"
    >
      {saving ? <span className="ep-btn-loader"></span> : <FiCheck />}
    </button>
  </header>
);

// Avatar Section
const AvatarSection = ({ photoUrl, name, onPhotoChange }) => {
  const fileInputRef = useRef(null);
  const initial = name?.[0]?.toUpperCase() || "U";

  return (
    <div className="ep-avatar-section">
      <div className="ep-avatar-wrapper">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt="Profile"
            className="ep-avatar-image"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className="ep-avatar-fallback"
          style={{ display: photoUrl ? "none" : "flex" }}
        >
          {initial}
        </div>
        <button
          className="ep-avatar-edit"
          onClick={() => fileInputRef.current?.click()}
        >
          <FiCamera />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onPhotoChange}
          style={{ display: "none" }}
        />
      </div>
      <p className="ep-avatar-hint">Tap to change photo</p>
    </div>
  );
};

// Input Field Component
const InputField = ({
  icon: Icon,
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled,
  required,
  multiline,
}) => (
  <div className="ep-field">
    <label className="ep-label">{label}</label>
    <div className={`ep-input-wrapper ${disabled ? "disabled" : ""}`}>
      <Icon className="ep-input-icon" />
      {multiline ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="ep-textarea"
          rows={3}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="ep-input"
        />
      )}
    </div>
  </div>
);

// Section Header
const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="ep-section-header">
    <div className="ep-section-icon">
      <Icon />
    </div>
    <div className="ep-section-info">
      <h3 className="ep-section-title">{title}</h3>
      {subtitle && <p className="ep-section-subtitle">{subtitle}</p>}
    </div>
  </div>
);

// PIN Input Component
const PinInput = ({ value, onChange, placeholder, show, onToggleShow, name }) => (
  <div className="ep-pin-input-wrapper">
    <FiLock className="ep-pin-icon" />
    <input
      type={show ? "text" : "password"}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="ep-pin-input"
      maxLength={4}
      inputMode="numeric"
      pattern="[0-9]*"
    />
    <button
      type="button"
      className="ep-pin-toggle"
      onClick={onToggleShow}
    >
      {show ? <FiEyeOff /> : <FiEye />}
    </button>
  </div>
);

// QR Code Section
const QRCodeSection = ({ qrUrl }) => (
  <div className="ep-qr-section">
    <SectionHeader
      icon={HiOutlineQrcode}
      title="Your QR Code"
      subtitle="Scan to share your profile"
    />
    <div className="ep-qr-container">
      {qrUrl ? (
        <img src={qrUrl} alt="QR Code" className="ep-qr-image" />
      ) : (
        <div className="ep-qr-placeholder">
          <HiOutlineQrcode />
          <span>QR code will appear here</span>
        </div>
      )}
    </div>
  </div>
);

// Loading Skeleton
const EditProfileSkeleton = () => (
  <div className="ep-skeleton">
    <div className="ep-skeleton-avatar"></div>
    <div className="ep-skeleton-field"></div>
    <div className="ep-skeleton-field"></div>
    <div className="ep-skeleton-field"></div>
    <div className="ep-skeleton-field"></div>
  </div>
);

// ============ MAIN COMPONENT ============
export default function EditProfile() {
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);

  const [form, setForm] = useState({
    name: "",
    business_name: "",
    email: "",
    phone: "",
    location: "",
    sales_executive: "",
    latitude: "",
    longitude: "",
    shop_photo_url: "",
  });

  const [qrUrl, setQrUrl] = useState(null);
  const [hasPin, setHasPin] = useState(false);
  const [pinInputs, setPinInputs] = useState({
    newPin: "",
    confirmPin: "",
  });
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [settingPin, setSettingPin] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await API.get("/customers/profile/");
        if (!mounted) return;
        const data = res.data || {};
        setForm({
          name: data.name ?? "",
          business_name: data.business_name ?? data.businessName ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          location: data.location ?? "",
          sales_executive: data.sales_executive ?? data.salesExecutive ?? "",
          latitude: data.latitude ?? "",
          longitude: data.longitude ?? "",
          shop_photo_url: data.shop_photo_url ?? data.shopPhotoUrl ?? "",
        });
        setQrUrl(data.qr_code ?? data.qrCode ?? null);
        setHasPin(Boolean(data.has_pin));
      } catch (err) {
        console.error("Failed to load profile:", err);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    return () => {
      mounted = false;
    };
  }, []);

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePinChange = (e) => {
    const { name, value } = e.target;
    setPinInputs((prev) => ({
      ...prev,
      [name]: value.replace(/\D/g, "").slice(0, 4),
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const url = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, shop_photo_url: url }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (photoFile) {
        const fd = new FormData();
        Object.keys(form).forEach((k) => fd.append(k, form[k] ?? ""));
        fd.append("shop_photo", photoFile);

        try {
          await API.patch("/customers/profile/", fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } catch {
          await API.post("/customers/profile/", fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
      } else {
        await API.patch("/customers/profile/", form);
      }

      toast.success("Profile updated successfully!", { icon: "✅" });

      try {
        const fresh = await API.get("/customers/profile/");
        localStorage.setItem("auth_user", JSON.stringify(fresh.data));
      } catch {}
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSetPin = async () => {
    const { newPin, confirmPin } = pinInputs;

    if (!newPin || newPin.length < 4) {
      toast.error("PIN must be 4 digits");
      return;
    }
    if (newPin !== confirmPin) {
      toast.error("PINs do not match");
      return;
    }

    setSettingPin(true);
    try {
      await API.post("/customers/transaction-pin/", { pin: newPin });
      setHasPin(true);
      setPinInputs({ newPin: "", confirmPin: "" });
      toast.success("Transaction PIN set successfully!", { icon: "🔐" });
    } catch (err) {
      console.error("Set PIN failed:", err);
      toast.error("Failed to set PIN");
    } finally {
      setSettingPin(false);
    }
  };

  const handleRemovePin = async () => {
    if (!window.confirm("Remove your transaction PIN?")) return;

    try {
      await API.delete("/customers/transaction-pin/");
      setHasPin(false);
      toast.success("PIN removed successfully");
    } catch (err) {
      console.error("Remove PIN failed:", err);
      toast.error("Failed to remove PIN");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="ep-page">
        <EditHeader
          onBack={() => navigate(-1)}
          onSave={() => {}}
          saving={false}
        />
        <div className="ep-content">
          <EditProfileSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="ep-page">
      {/* Header */}
      <EditHeader
        onBack={() => navigate(-1)}
        onSave={handleSave}
        saving={saving}
      />

      {/* Content */}
      <div className="ep-content">
        {/* Avatar Section */}
        <AvatarSection
          photoUrl={form.shop_photo_url}
          name={form.business_name || form.name}
          onPhotoChange={handlePhotoChange}
        />

        {/* Business Information */}
        <section className="ep-section">
          <SectionHeader
            icon={FiBriefcase}
            title="Business Information"
            subtitle="Your business details"
          />

          <div className="ep-fields">
            <InputField
              icon={FiBriefcase}
              label="Business Name"
              name="business_name"
              value={form.business_name}
              onChange={handleChange}
              placeholder="Enter business name"
              disabled
              required
            />

            <InputField
              icon={FiUser}
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
            />

            <InputField
              icon={FiMail}
              label="Email Address"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email address"
              type="email"
              required
            />

            <InputField
              icon={FiPhone}
              label="Phone Number"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              type="tel"
            />
          </div>
        </section>

        {/* Location Information */}
        <section className="ep-section">
          <SectionHeader
            icon={FiMapPin}
            title="Location"
            subtitle="Your address and coordinates"
          />

          <div className="ep-fields">
            <InputField
              icon={FiMapPin}
              label="Address"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Enter your address"
              multiline
            />

            <div className="ep-row">
              <InputField
                icon={FiNavigation}
                label="Latitude"
                name="latitude"
                value={form.latitude}
                onChange={handleChange}
                placeholder="0.000000"
              />
              <InputField
                icon={FiNavigation}
                label="Longitude"
                name="longitude"
                value={form.longitude}
                onChange={handleChange}
                placeholder="0.000000"
              />
            </div>

            <InputField
              icon={FiUser}
              label="Sales Executive"
              name="sales_executive"
              value={form.sales_executive}
              onChange={handleChange}
              placeholder="Enter sales executive name"
            />
          </div>
        </section>

        {/* Shop Photo */}
        <section className="ep-section">
          <SectionHeader
            icon={FiImage}
            title="Shop Photo"
            subtitle="Upload or link your shop image"
          />

          <div className="ep-fields">
            <div className="ep-photo-preview">
              {form.shop_photo_url ? (
                <img
                  src={form.shop_photo_url}
                  alt="Shop"
                  onError={(e) => {
                    e.target.src = "/assets/images/placeholder.png";
                  }}
                />
              ) : (
                <div className="ep-photo-placeholder">
                  <FiImage />
                  <span>No photo uploaded</span>
                </div>
              )}
            </div>

            <div className="ep-photo-actions">
              <label className="ep-upload-btn">
                <FiUpload />
                <span>Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ display: "none" }}
                />
              </label>
            </div>

            <InputField
              icon={FiImage}
              label="Or enter image URL"
              name="shop_photo_url"
              value={form.shop_photo_url}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>
        </section>

        {/* QR Code */}
        <QRCodeSection qrUrl={qrUrl} />

        {/* Transaction PIN */}
        <section className="ep-section">
          <SectionHeader
            icon={FiShield}
            title="Transaction PIN"
            subtitle={hasPin ? "Your PIN is set" : "Secure your transactions"}
          />

          <div className="ep-pin-section">
            {hasPin ? (
              <div className="ep-pin-status">
                <div className="ep-pin-status-icon success">
                  <FiCheck />
                </div>
                <div className="ep-pin-status-info">
                  <span className="ep-pin-status-title">PIN is active</span>
                  <span className="ep-pin-status-text">
                    Your transactions are protected
                  </span>
                </div>
                <button className="ep-pin-remove-btn" onClick={handleRemovePin}>
                  <FiTrash2 />
                  Remove
                </button>
              </div>
            ) : (
              <div className="ep-pin-form">
                <PinInput
                  name="newPin"
                  value={pinInputs.newPin}
                  onChange={handlePinChange}
                  placeholder="Enter 4-digit PIN"
                  show={showPin}
                  onToggleShow={() => setShowPin(!showPin)}
                />

                <PinInput
                  name="confirmPin"
                  value={pinInputs.confirmPin}
                  onChange={handlePinChange}
                  placeholder="Confirm PIN"
                  show={showConfirmPin}
                  onToggleShow={() => setShowConfirmPin(!showConfirmPin)}
                />

                <button
                  className="ep-set-pin-btn"
                  onClick={handleSetPin}
                  disabled={settingPin || pinInputs.newPin.length < 4}
                >
                  {settingPin ? (
                    <span className="ep-btn-loader"></span>
                  ) : (
                    <>
                      <FiLock />
                      Set Transaction PIN
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Action Buttons */}
        <div className="ep-actions">
          <button
            className="ep-action-btn secondary"
            onClick={() => window.location.reload()}
          >
            <FiRefreshCw />
            Reset Changes
          </button>
          <button
            className="ep-action-btn primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="ep-btn-loader"></span>
                Saving...
              </>
            ) : (
              <>
                <FiSave />
                Save Profile
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Spacer */}
      <div className="ep-bottom-spacer"></div>
    </div>
  );
}