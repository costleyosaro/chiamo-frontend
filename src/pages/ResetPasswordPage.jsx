// src/pages/ResetPasswordPage.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Auth.css"; // ✅ reuse login/signup CSS

const ResetPasswordPage = () => {
  const { uid, token } = useParams(); // or however your backend passes reset tokens
  const navigate = useNavigate();
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("password/reset/", { uid, token, password });
      toast.success("Password reset successful 🎉", { position: "top-center" });
      navigate("/login");
    } catch (err) {
      console.error("Error:", err);
      toast.error("Failed to reset password ❌", { position: "top-center" });
    }
  };

  return (
    <div className="auth-container">
      {/* Logo + animation */}
      <div className="logo-section">

        <div className="logo-text">
          Chiamo<span>Order</span>
        </div>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Reset Password</h2>

        <div className="input-group">
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label>New Password</label>
        </div>

        <button type="submit" className="auth-btn">Reset Password</button>
      </form>

      <ToastContainer />
    </div>
  );
};

export default ResetPasswordPage;
