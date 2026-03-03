// src/pages/Support.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiMail, FiPhone, FiSend } from "react-icons/fi";
import API from "../services/api";
import "../pages/Support.css";

export default function Support() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, text: "", type: "success" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const showToast = (text, type = "success") => {
    setToast({ show: true, text, type });
    setTimeout(() => setToast({ show: false, text: "", type: "success" }), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/orders/support/messages/", form);
      showToast("✅ Message sent successfully!");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      console.error(err);
      showToast("❌ Failed to send message. Try again later.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="supportpg-wrapper">
      {toast.show && (
        <div
          className={`supportpg-toast ${
            toast.type === "error" ? "supportpg-error" : "supportpg-success"
          }`}
        >
          {toast.text}
        </div>
      )}

      <div className="supportpg-card">
        <h1 className="supportpg-title">Chiamo Order Support</h1>
        <p className="supportpg-subtitle">
          Need help? We’re here 24/7 to assist you with any issue or inquiry.
        </p>

        <div className="supportpg-contacts">
          <div className="supportpg-contact-box">
            <FiMail className="supportpg-icon" />
            <div>
              <p className="supportpg-label">Email Support</p>
              <a
                href="mailto:chiamoorder@gmail.com"
                className="supportpg-link"
              >
                chiamoorder@gmail.com
              </a>
            </div>
          </div>

          <div className="supportpg-contact-box">
            <FiPhone className="supportpg-icon" />
            <div>
              <p className="supportpg-label">Customer Care</p>
              <p className="supportpg-link">+234 901 234 5678</p>
            </div>
          </div>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="supportpg-form"
        >
          <div className="supportpg-input-row">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your Name"
              required
            />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Your Email"
              required
            />
          </div>

          <input
            type="text"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            placeholder="Subject"
            required
          />

          <textarea
            name="message"
            rows="5"
            value={form.message}
            onChange={handleChange}
            placeholder="Describe your issue or feedback..."
            required
          />

          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={loading || !form.message}
            type="submit"
            className="supportpg-submit-btn"
          >
            <FiSend />
            {loading ? "Sending..." : "Send Message"}
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
}
