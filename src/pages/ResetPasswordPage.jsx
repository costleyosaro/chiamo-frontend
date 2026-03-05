import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import "./Auth.css";

const ResetPasswordPage = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters!", { position: "top-center" });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!", { position: "top-center" });
      return;
    }

    setIsLoading(true);

    try {
      // ✅ Correct endpoint and payload
      const response = await API.post("customers/reset-password/confirm/", {
        uid: uid,
        token: token,
        new_password: password,
      });

      toast.success("Password reset successful! 🎉", { position: "top-center" });
      setTimeout(() => navigate("/login"), 2000);

    } catch (err) {
      console.error("Reset password error:", err);

      if (err.response?.data?.error) {
        toast.error(err.response.data.error, { position: "top-center" });
      } else if (err.response?.status === 400) {
        toast.error("Invalid or expired reset link. Please request a new one.", {
          position: "top-center",
        });
      } else {
        toast.error("Failed to reset password ❌", { position: "top-center" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="logo-section">
        <div className="logo-text">
          Chiamo<span>Order</span>
        </div>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Reset Password</h2>
        <p style={{ color: "#666", marginBottom: "20px" }}>
          Enter your new password below
        </p>

        <div className="input-group">
          <FaLock className="input-icon" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder=" "
            required
            minLength={6}
          />
          <label>New Password</label>
          <span
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <div className="input-group">
          <FaLock className="input-icon" />
          <input
            type={showConfirm ? "text" : "password"}
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder=" "
            required
            minLength={6}
          />
          <label>Confirm New Password</label>
          <span
            className="password-toggle"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button
          type="submit"
          className={`auth-btn ${isLoading ? "loading" : ""}`}
          disabled={isLoading}
        >
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        theme="colored"
      />
    </div>
  );
};

export default ResetPasswordPage;