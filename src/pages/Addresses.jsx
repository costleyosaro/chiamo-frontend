// src/pages/Addresses.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UniversalBackButton from "../components/UniversalBackButton";
import {
  FiMapPin,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiCrosshair,
  FiHome,
  FiStar,
  FiNavigation,
  FiAlertCircle,
} from "react-icons/fi";
import { BiStore } from "react-icons/bi";
import API from "../services/api";
import toast from "react-hot-toast";
import "./Addresses.css";

export default function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [form, setForm] = useState({
    label: "Home",
    street: "",
    city: "",
    state: "",
    latitude: "",
    longitude: "",
    is_default: false,
  });
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Label options
  const labelOptions = [
    { value: "Home", icon: <FiHome /> },
    { value: "Office", icon: <BiStore /> },
    { value: "Warehouse", icon: <FiNavigation /> },
    { value: "Other", icon: <FiMapPin /> },
  ];

  // ✅ Load addresses + registration address on mount
  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    setPageLoading(true);
    try {
      const res = await API.get("/customers/addresses/");
      let savedAddresses = Array.isArray(res.data) ? res.data : [];

      // ✅ If no addresses saved, auto-fill from user's registration data
      if (savedAddresses.length === 0) {
        try {
          const profileRes = await API.get("/customers/profile/");
          const user = profileRes.data;

          if (user.location && user.location.trim() !== "") {
            // Auto-create registration address
            const regAddress = {
              id: "registration",
              label: "Registration Address",
              street: user.location || "",
              city: "",
              state: "",
              latitude: user.latitude || "",
              longitude: user.longitude || "",
              is_default: true,
              is_registration: true, // Flag to show it's from registration
            };

            // Try to extract city/state from location string
            const parts = (user.location || "").split(",").map((p) => p.trim());
            if (parts.length >= 3) {
              regAddress.street = parts.slice(0, -2).join(", ");
              regAddress.city = parts[parts.length - 2] || "";
              regAddress.state = parts[parts.length - 1] || "";
            } else if (parts.length === 2) {
              regAddress.street = parts[0];
              regAddress.city = parts[1];
            }

            savedAddresses = [regAddress];
          }
        } catch (err) {
          console.warn("Could not load profile for registration address:", err);
        }
      }

      setAddresses(savedAddresses);
    } catch (err) {
      console.warn("Failed to load addresses:", err);
      toast.error("Failed to load addresses");
    } finally {
      setPageLoading(false);
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ Get Location — same as registration page (free services)
  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Location services not supported on this device.");
      return;
    }

    setLocating(true);
    const loadingToast = toast.loading("📍 Capturing your location...");

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000,
        });
      });

      const { latitude, longitude } = position.coords;

      // Get address from coordinates (free services)
      let street = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
      let city = "";
      let state = "";

      try {
        const geocodePromises = [
          fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          ).then((res) => res.json()),
          fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          ).then((res) => res.json()),
        ];

        const results = await Promise.allSettled(geocodePromises);

        for (const result of results) {
          if (result.status === "fulfilled" && result.value) {
            const data = result.value;

            if (data.display_name) {
              // Nominatim response
              street = data.display_name;
              city =
                data.address?.city ||
                data.address?.town ||
                data.address?.village ||
                "";
              state = data.address?.state || "";
              break;
            } else if (data.locality) {
              // BigDataCloud response
              street =
                `${data.locality}, ${data.city || ""}, ${data.countryName || ""}`
                  .replace(/,\s*,/g, ",")
                  .trim();
              city = data.city || data.locality || "";
              state = data.principalSubdivision || "";
              break;
            }
          }
        }
      } catch (err) {
        console.warn("Geocoding failed:", err);
      }

      setForm((prev) => ({
        ...prev,
        street,
        city,
        state,
        latitude: latitude.toString(),
        longitude: longitude.toString(),
      }));

      toast.dismiss(loadingToast);
      toast.success("📍 Location captured successfully!");
    } catch (error) {
      toast.dismiss(loadingToast);

      let errorMessage = "Failed to capture location. ";
      if (error.code === 1) {
        errorMessage += "Please enable location permissions.";
      } else if (error.code === 2) {
        errorMessage += "Location unavailable. Check GPS/internet.";
      } else if (error.code === 3) {
        errorMessage += "Location request timeout. Try again.";
      }

      toast.error(errorMessage);
    } finally {
      setLocating(false);
    }
  };

  // ✅ Save or update address
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.street.trim()) {
      toast.error("Street address is required.");
      return;
    }

    setLoading(true);

    const payload = {
      label: form.label || "Home",
      street: form.street,
      city: form.city,
      state: form.state,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      is_default: form.is_default || false,
    };

    try {
      if (editingAddress && editingAddress.id !== "registration") {
        await API.put(`/customers/addresses/${editingAddress.id}/`, payload);
        toast.success("Address updated successfully!");
      } else {
        await API.post("/customers/addresses/", payload);
        toast.success("Address saved successfully!");
      }

      resetForm();
      loadAddresses();
    } catch (err) {
      console.error("Save failed:", err.response?.data || err);
      toast.error("Failed to save address. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (id === "registration") {
      toast.error("Registration address cannot be deleted.");
      setShowDeleteConfirm(null);
      return;
    }

    try {
      await API.delete(`/customers/addresses/${id}/`);
      toast.success("Address deleted!");
      setShowDeleteConfirm(null);
      loadAddresses();
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete address.");
    }
  };

  const openEditForm = (addr) => {
    setEditingAddress(addr);
    setForm({
      label: addr.label || "Home",
      street: addr.street || "",
      city: addr.city || "",
      state: addr.state || "",
      latitude: addr.latitude || "",
      longitude: addr.longitude || "",
      is_default: addr.is_default || false,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingAddress(null);
    setForm({
      label: "Home",
      street: "",
      city: "",
      state: "",
      latitude: "",
      longitude: "",
      is_default: false,
    });
  };

  // Get label icon
  const getLabelIcon = (label) => {
    const option = labelOptions.find(
      (o) => o.value.toLowerCase() === (label || "").toLowerCase()
    );
    return option ? option.icon : <FiMapPin />;
  };

  return (
    <div className="addr-page">
      {/* Header */}
      <div className="addr-header">
        <div className="addr-header-left">
          <UniversalBackButton />
          <div>
            <h2 className="addr-title">My Addresses</h2>
            <p className="addr-subtitle">Manage your delivery locations</p>
          </div>
        </div>
        <button
          className="addr-add-btn"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <FiPlus />
          <span>Add New</span>
        </button>
      </div>

      {/* Content */}
      <div className="addr-content">
        {pageLoading ? (
          <div className="addr-loading">
            <div className="addr-spinner"></div>
            <p>Loading addresses...</p>
          </div>
        ) : addresses.length === 0 ? (
          <div className="addr-empty">
            <div className="addr-empty-icon">
              <FiMapPin />
            </div>
            <h3>No Saved Addresses</h3>
            <p>Add your delivery addresses for faster checkout</p>
            <button
              className="addr-empty-btn"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              <FiPlus /> Add Your First Address
            </button>
          </div>
        ) : (
          <div className="addr-list">
            {addresses.map((addr, i) => (
              <motion.div
                key={addr.id || i}
                className={`addr-card ${addr.is_default ? "default" : ""} ${
                  addr.is_registration ? "registration" : ""
                }`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                {/* Default / Registration Badge */}
                {(addr.is_default || addr.is_registration) && (
                  <div className="addr-badge">
                    <FiStar />
                    {addr.is_registration
                      ? "Registration Address"
                      : "Default"}
                  </div>
                )}

                <div className="addr-card-body">
                  <div className="addr-card-icon">
                    {getLabelIcon(addr.label)}
                  </div>

                  <div className="addr-card-info">
                    <h4 className="addr-card-label">
                      {addr.label || "Address"}
                    </h4>
                    <p className="addr-card-street">{addr.street}</p>
                    {(addr.city || addr.state) && (
                      <p className="addr-card-region">
                        {[addr.city, addr.state].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>

                  <div className="addr-card-actions">
                    <button
                      className="addr-action-btn edit"
                      onClick={() => openEditForm(addr)}
                      title="Edit"
                    >
                      <FiEdit2 />
                    </button>
                    {!addr.is_registration && (
                      <button
                        className="addr-action-btn delete"
                        onClick={() => setShowDeleteConfirm(addr.id)}
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Address Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="addr-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetForm}
          >
            <motion.div
              className="addr-modal"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="addr-modal-title">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </h3>

              <form onSubmit={handleSubmit} className="addr-form">
                {/* Label Selector */}
                <div className="addr-label-selector">
                  {labelOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`addr-label-btn ${
                        form.label === opt.value ? "active" : ""
                      }`}
                      onClick={() => setForm({ ...form, label: opt.value })}
                    >
                      {opt.icon}
                      <span>{opt.value}</span>
                    </button>
                  ))}
                </div>

                {/* Get Location Button */}
                <button
                  type="button"
                  className={`addr-location-btn ${locating ? "loading" : ""}`}
                  onClick={handleGetLocation}
                  disabled={locating}
                >
                  <FiCrosshair className={locating ? "spinning" : ""} />
                  <span>
                    {locating ? "Getting Location..." : "Get My Location"}
                  </span>
                </button>

                {/* Street */}
                <div className="addr-input-group">
                  <FiMapPin className="addr-input-icon" />
                  <input
                    type="text"
                    name="street"
                    value={form.street}
                    onChange={handleChange}
                    placeholder="Street Address *"
                    required
                  />
                </div>

                {/* City & State Row */}
                <div className="addr-input-row">
                  <div className="addr-input-group">
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="City"
                    />
                  </div>
                  <div className="addr-input-group">
                    <input
                      type="text"
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      placeholder="State"
                    />
                  </div>
                </div>

                {/* Default Address Toggle */}
                <label className="addr-default-toggle">
                  <input
                    type="checkbox"
                    checked={form.is_default}
                    onChange={(e) =>
                      setForm({ ...form, is_default: e.target.checked })
                    }
                  />
                  <span className="addr-toggle-slider"></span>
                  <span className="addr-toggle-text">
                    Set as default address
                  </span>
                </label>

                {/* Buttons */}
                <div className="addr-modal-btns">
                  <button
                    type="submit"
                    className="addr-save-btn"
                    disabled={loading}
                  >
                    {loading
                      ? "Saving..."
                      : editingAddress
                      ? "Update Address"
                      : "Save Address"}
                  </button>
                  <button
                    type="button"
                    className="addr-cancel-btn"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="addr-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              className="addr-delete-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="addr-delete-icon">
                <FiAlertCircle />
              </div>
              <h3>Delete Address?</h3>
              <p>This action cannot be undone.</p>
              <div className="addr-delete-btns">
                <button
                  className="addr-cancel-btn"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Cancel
                </button>
                <button
                  className="addr-confirm-delete-btn"
                  onClick={() => handleDelete(showDeleteConfirm)}
                >
                  <FiTrash2 /> Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}