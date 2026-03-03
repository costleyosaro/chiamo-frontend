import React, { useState, useEffect } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import "./transaction-pin.css";

/**
 * Props:
 *  - isOpen
 *  - onClose
 *  - customerId
 *  - onSuccess
 */
export default function SetTransactionPinModal({ isOpen, onClose, customerId, onSuccess }) {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", ""]);
  const [activeField, setActiveField] = useState("pin"); // "pin" | "confirm"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setPin(["", "", "", ""]);
      setConfirmPin(["", "", "", ""]);
      setError("");
      setActiveField("pin");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNumber = (n) => {
    if (loading) return;
    const target = activeField === "pin" ? pin : confirmPin;
    const idx = target.findIndex((d) => d === "");
    if (idx === -1) return;
    const next = [...target];
    next[idx] = String(n);
    if (activeField === "pin") setPin(next);
    else setConfirmPin(next);
    // auto move to confirm when pin finished
    if (idx === 3 && activeField === "pin") {
      setTimeout(() => setActiveField("confirm"), 200);
    }
  };

  const handleBack = () => {
    if (loading) return;
    const target = activeField === "pin" ? pin : confirmPin;
    const rev = [...target].reverse();
    const lastFilled = rev.findIndex((d) => d !== "");
    if (lastFilled === -1) return;
    const idxToClear = 3 - lastFilled;
    const next = [...target];
    next[idxToClear] = "";
    if (activeField === "pin") setPin(next);
    else setConfirmPin(next);
  };

  const submit = async () => {
    const p = pin.join("");
    const cp = confirmPin.join("");
    if (p.length < 4) return setError("Enter a 4-digit PIN");
    if (p !== cp) return setError("PINs do not match");
    setLoading(true);
    setError("");
    try {
      await API.post("/customers/set-pin/", { customer_id: customerId, pin: p });
      toast.success("Transaction PIN set");
      setPin(["", "", "", ""]);
      setConfirmPin(["", "", "", ""]);
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.response?.data?.error || "Failed to set PIN";
      setError(String(msg));
      toast.error(String(msg));
    } finally {
      setLoading(false);
    }
  };

  // keypad same layout
  const padKeys = [1,2,3,4,5,6,7,8,9,"",0,"back"];

  return (
    <div className="tp-overlay" onMouseDown={onClose}>
      <div className="tp-modal tp-modal-sm" onMouseDown={(e) => e.stopPropagation()}>
        <button className="tp-close" onClick={onClose} aria-label="Close">✕</button>

        <h3 className="tp-title">Set Transaction PIN</h3>
        <p className="tp-sub">Enter a 4-digit PIN and confirm it.</p>

        <div className="tp-pin-row small-row">
          {pin.map((d, i) => <div key={i} className={`tp-pin-box ${d ? "filled" : ""}`}><span className="tp-pin-dot">{d ? "•" : ""}</span></div>)}
        </div>
        <div className="tp-field-label">Confirm PIN</div>
        <div className="tp-pin-row small-row">
          {confirmPin.map((d, i) => <div key={i} className={`tp-pin-box ${d ? "filled" : ""}`}><span className="tp-pin-dot">{d ? "•" : ""}</span></div>)}
        </div>

        {error && <div className="tp-error">{error}</div>}

        <div className="tp-secure-label" style={{marginTop: 10}}>
          <span className="tp-secure-badge">✓</span> Numeric Keypad
        </div>

        <div className="tp-keypad">
          {padKeys.map((k, idx) => {
            if (k === "") return <div key={idx} className="tp-key-empty" />;
            if (k === "back") {
              return <button key={idx} className="tp-key tp-key-back" onClick={handleBack}>⌫</button>;
            }
            return <button key={idx} className="tp-key" onClick={() => handleNumber(k)}>{k}</button>;
          })}
        </div>

        <div style={{display:'flex', gap:10, marginTop:12}}>
          <button className="tp-submit" onClick={submit} disabled={loading || pin.includes("") || confirmPin.includes("")}>
            {loading ? "Saving..." : "Set PIN"}
          </button>
          <button className="tp-cancel" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
