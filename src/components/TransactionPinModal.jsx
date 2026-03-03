import React, { useState, useEffect, useRef } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import "./transaction-pin.css";

/**
 * Props:
 *  - isOpen (bool)
 *  - onClose (fn)
 *  - customerId (number)
 *  - onSuccess (fn) called after successful validation
 *  - onRequestSetPin (fn) called when user has no pin
 */
export default function TransactionPinModal({
  isOpen,
  onClose,
  customerId,
  onSuccess,
  onRequestSetPin,
}) {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setDigits(["", "", "", ""]);
      setError("");
    }
  }, [isOpen]);

  // keep focus trapping minimal: close on ESC
  useEffect(() => {
    const onKey = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNumber = (n) => {
    if (loading) return;
    const idx = digits.findIndex((d) => d === "");
    if (idx === -1) return;
    const next = [...digits];
    next[idx] = String(n);
    setDigits(next);
    if (idx === 3) {
      // auto-submit a bit after last press for nice UX
      setTimeout(() => submitPin(next.join("")), 120);
    }
  };

  const handleBack = () => {
    if (loading) return;
    const rev = [...digits].reverse();
    const lastFilled = rev.findIndex((d) => d !== "");
    if (lastFilled === -1) return;
    const idxToClear = 3 - lastFilled;
    const next = [...digits];
    next[idxToClear] = "";
    setDigits(next);
    setError("");
  };

  const submitPin = async (pinValue) => {
    if (pinValue.length < 4) return;
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/customers/validate-pin/", {
        customer_id: customerId,
        pin: pinValue,
      });

      if (res.data?.valid) {
        toast.success("PIN validated successfully");
        setDigits(["", "", "", ""]);
        onSuccess?.();
        onClose();
      } else if (res.data?.message?.toLowerCase?.().includes("not set")) {
        onClose();
        onRequestSetPin?.();
      } else {
        setError("Invalid PIN");
        setDigits(["", "", "", ""]);
      }
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.response?.data?.error || "PIN validation failed";
      if (String(msg).toLowerCase().includes("not set")) {
        onClose();
        onRequestSetPin?.();
      } else {
        setError(String(msg));
        toast.error(String(msg));
        setDigits(["", "", "", ""]);
      }
    } finally {
      setLoading(false);
    }
  };

  // keypad numbers layout similar to OPay: 1-9, blank, 0, back
  const padKeys = [1,2,3,4,5,6,7,8,9,"",0,"back"];

  return (
    <div className="tp-overlay" onMouseDown={onClose}>
      <div
        className="tp-modal"
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
        ref={containerRef}
      >
        <button className="tp-close" onClick={onClose} aria-label="Close">✕</button>

        <h3 className="tp-title">Enter Payment PIN</h3>

        <div className="tp-pin-row" aria-hidden="true">
          {digits.map((d, i) => (
            <div
              key={i}
              className={`tp-pin-box ${d ? "filled" : ""}`}
            >
              <span className="tp-pin-dot">{d ? "•" : ""}</span>
            </div>
          ))}
        </div>

        {error ? <div className="tp-error">{error}</div> : <div className="tp-forgot"><button className="tp-forgot-btn" onClick={() => { toast("Forgot PIN flow coming soon"); }}>Forgot Payment PIN?</button></div>}

        <div className="tp-secure-label">
          <span className="tp-secure-badge">✓</span>
          <span>Secure Numeric Keypad</span>
        </div>

        <div className="tp-keypad" aria-hidden="true">
          {padKeys.map((k, idx) => {
            if (k === "") {
              return <div key={idx} className="tp-key-empty" />;
            }
            if (k === "back") {
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={handleBack}
                  className="tp-key tp-key-back"
                  aria-label="Backspace"
                >
                  ⌫
                </button>
              );
            }
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleNumber(k)}
                className="tp-key"
              >
                {k}
              </button>
            );
          })}
        </div>

        <button
          className="tp-submit"
          disabled={loading || digits.some((d) => d === "")}
          onClick={() => submitPin(digits.join(""))}
        >
          {loading ? "Verifying..." : "Proceed"}
        </button>

        <button className="tp-cancel" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
