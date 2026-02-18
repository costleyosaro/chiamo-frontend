// src/pages/Addresses.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  FiMapPin,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiCrosshair,
} from "react-icons/fi";
import API from "../services/api";
import "../pages/Addresses.css";

export default function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [form, setForm] = useState({
    label: "",
    street: "",
    city: "",
    state: "",
    latitude: "",
    longitude: "",
  });
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const mapRefs = useRef({});
  const autocompleteRef = useRef(null);

  // ✅ Load saved addresses from API
  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const res = await API.get("/customers/addresses/");
      setAddresses(res.data);
    } catch (err) {
      console.warn("Failed to load addresses:", err);
    }
  };

  // ✅ Initialize Google Autocomplete
  useEffect(() => {
    if (!showForm || !autocompleteRef.current) return;
    const el = autocompleteRef.current;

    const onPlaceChange = async () => {
      const placeValue = el.value;
      if (!placeValue) return;

      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            placeValue
          )}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();
        const loc = data.results?.[0];
        if (!loc) return;

        const lat = loc.geometry?.location?.lat;
        const lng = loc.geometry?.location?.lng;

        setForm((prev) => ({
          ...prev,
          street: loc.formatted_address || placeValue,
          city:
            loc.address_components?.find((a) =>
              a.types.includes("locality")
            )?.long_name || "",
          state:
            loc.address_components?.find((a) =>
              a.types.includes("administrative_area_level_1")
            )?.long_name || "",
          latitude: lat || "",
          longitude: lng || "",
        }));
      } catch (error) {
        console.error("Error fetching geocode details:", error);
      }
    };

    el.addEventListener("gmpx-placechange", onPlaceChange);
    return () => el.removeEventListener("gmpx-placechange", onPlaceChange);
  }, [showForm]);

  // ✅ Render map previews
  useEffect(() => {
    if (!window.google || addresses.length === 0) return;
    addresses.forEach((addr) => {
      const lat = parseFloat(addr.latitude);
      const lng = parseFloat(addr.longitude);
      if (isNaN(lat) || isNaN(lng) || !mapRefs.current[addr.id]) return;

      const map = new window.google.maps.Map(mapRefs.current[addr.id], {
        center: { lat, lng },
        zoom: 14,
        disableDefaultUI: true,
      });
      new window.google.maps.Marker({ position: { lat, lng }, map });
    });
  }, [addresses]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ Save or update address
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Clean payload to match Django model
    const payload = {
      street: form.street,
      city: form.city,
      state: form.state,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      is_default: false,
    };

    try {
      if (editingAddress)
        await API.put(`/customers/addresses/${editingAddress.id}/`, payload);
      else await API.post("/customers/addresses/", payload);

      setShowForm(false);
      setEditingAddress(null);
      setForm({
        label: "",
        street: "",
        city: "",
        state: "",
        latitude: "",
        longitude: "",
      });
      loadAddresses();
    } catch (err) {
      console.error("Save failed:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      await API.delete(`/customers/addresses/${id}/`);
      loadAddresses();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const openEditForm = (addr) => {
    setEditingAddress(addr);
    setForm({
      ...addr,
      label: addr.label || "",
    });
    setShowForm(true);
  };

  // ✅ Use current GPS location
  const handleUseLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
          console.error("Invalid coordinates:", lat, lng);
          setLocating(false);
          return;
        }

        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${
              import.meta.env.VITE_GOOGLE_MAPS_API_KEY
            }`
          );
          const data = await res.json();
          const place = data.results?.[0];

          setForm((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            street: place?.formatted_address || "",
            city:
              place?.address_components?.find((a) =>
                a.types.includes("locality")
              )?.long_name || "",
            state:
              place?.address_components?.find((a) =>
                a.types.includes("administrative_area_level_1")
              )?.long_name || "",
          }));
        } catch (error) {
          console.error("Reverse geocoding failed:", error);
        } finally {
          setLocating(false);
        }
      },
      () => {
        alert("Failed to get location.");
        setLocating(false);
      }
    );
  };

  return (
    <div className="address-page">
      <div className="address-header">
        <h2>My Saved Addresses</h2>
        <button onClick={() => setShowForm(true)} className="address-add-btn">
          <FiPlus /> Add Address
        </button>
      </div>

      {/* ✅ Saved addresses list */}
      {addresses.length === 0 ? (
        <p className="address-empty">No saved addresses yet.</p>
      ) : (
        <div className="address-grid">
          {addresses.map((addr, i) => (
            <motion.div
              key={i}
              className="address-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div
                className="address-map"
                ref={(el) => (mapRefs.current[addr.id] = el)}
              />
              <div className="address-details">
                <h4>
                  <FiMapPin /> {addr.label || "Address"}
                </h4>
                <p>{addr.street}</p>
                <p>
                  {addr.city}, {addr.state}
                </p>
                <div className="address-actions">
                  <button
                    className="address-edit-btn"
                    onClick={() => openEditForm(addr)}
                  >
                    <FiEdit2 /> Edit
                  </button>
                  <button
                    className="address-delete-btn"
                    onClick={() => handleDelete(addr.id)}
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ✅ Address form modal */}
      {showForm && (
        <div className="address-modal-overlay">
          <motion.div
            className="address-modal"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h3>{editingAddress ? "Edit Address" : "Add New Address"}</h3>
            <form onSubmit={handleSubmit} className="address-form">
              <input
                type="text"
                name="label"
                value={form.label}
                onChange={handleChange}
                placeholder="Label (Home, Office)"
              />

              {/* Google Autocomplete Search */}
              <gmpx-place-autocomplete
                ref={autocompleteRef}
                placeholder="Search for an address"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  fontSize: "14px",
                  marginBottom: "10px",
                }}
              ></gmpx-place-autocomplete>

              {/* ✅ Visible Street Address Field */}
              <input
                type="text"
                name="street"
                value={form.street}
                onChange={handleChange}
                placeholder="Street Address"
                required
              />

              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="City"
              />

              <input
                type="text"
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="State"
              />

              <button
                type="button"
                className="address-gps-btn"
                onClick={handleUseLocation}
                disabled={locating}
              >
                <FiCrosshair />{" "}
                {locating ? "Fetching location..." : "Use My Location"}
              </button>

              <div className="address-modal-actions">
                <button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  className="address-cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
