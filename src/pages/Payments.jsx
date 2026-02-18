import React from "react";
import { useNavigate } from "react-router-dom";
import "./Payments.css";

export default function Payments() {
  const navigate = useNavigate();

  return (
    <div className="payments-page">
      <button onClick={() => navigate(-1)} className="payments-back-btn">
        ← Back
      </button>

      <div className="payments-content">
        <h1 className="payments-title">Payments</h1>
        <div className="payments-coming-soon">
          <h2>💳 Coming Soon</h2>
          <p>
            This feature will be available in <strong>Chiamo Order 2.0</strong>.
            <br /> Stay tuned for a seamless, secure payment experience!
          </p>
        </div>
      </div>
    </div>
  );
}
