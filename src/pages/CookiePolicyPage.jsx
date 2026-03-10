// src/pages/CookiePolicyPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronLeft, FiSettings } from "react-icons/fi";
import { BsCookie } from "react-icons/bs";
import "./LegalPages.css";

export default function CookiePolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="legal-page">
      <header className="legal-header">
        <button className="legal-back-btn" onClick={() => navigate(-1)}>
          <FiChevronLeft />
        </button>
        <h1>Cookie Policy</h1>
        <div className="legal-header-icon">
          <BsCookie />
        </div>
      </header>

      <div className="legal-content">
        <div className="legal-last-updated">
          Last updated: January 15, 2025
        </div>

        <section className="legal-section">
          <h2>What Are Cookies?</h2>
          <p>
            Cookies are small text files that are placed on your device when you visit 
            our website. They help us provide you with a better experience by remembering 
            your preferences and understanding how you use our platform.
          </p>
        </section>

        <section className="legal-section">
          <h2>Types of Cookies We Use</h2>
          
          <div className="cookie-type">
            <h3>🔒 Essential Cookies</h3>
            <p>
              These cookies are necessary for the website to function properly. 
              They enable basic functions like page navigation and access to secure areas.
            </p>
            <span className="cookie-badge required">Required</span>
          </div>

          <div className="cookie-type">
            <h3>📊 Analytics Cookies</h3>
            <p>
              These cookies help us understand how visitors interact with our website 
              by collecting and reporting information anonymously.
            </p>
            <span className="cookie-badge optional">Optional</span>
          </div>

          <div className="cookie-type">
            <h3>🎯 Functional Cookies</h3>
            <p>
              These cookies enable enhanced functionality and personalization, 
              such as remembering your preferences and login details.
            </p>
            <span className="cookie-badge optional">Optional</span>
          </div>

          <div className="cookie-type">
            <h3>📢 Marketing Cookies</h3>
            <p>
              These cookies are used to track visitors across websites to display 
              relevant advertisements.
            </p>
            <span className="cookie-badge optional">Optional</span>
          </div>
        </section>

        <section className="legal-section">
          <h2>How to Manage Cookies</h2>
          <p>
            You can control and manage cookies in various ways:
          </p>
          <ul>
            <li>
              <strong>Browser Settings:</strong> Most browsers allow you to refuse 
              or accept cookies through their settings.
            </li>
            <li>
              <strong>Our Cookie Settings:</strong> You can adjust your preferences 
              using our cookie consent tool when you first visit our site.
            </li>
            <li>
              <strong>Third-Party Tools:</strong> Various browser extensions can 
              help you manage cookies.
            </li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>Cookies We Use</h2>
          <div className="cookie-table">
            <div className="cookie-row header">
              <span>Cookie Name</span>
              <span>Purpose</span>
              <span>Duration</span>
            </div>
            <div className="cookie-row">
              <span>session_id</span>
              <span>User authentication</span>
              <span>Session</span>
            </div>
            <div className="cookie-row">
              <span>user_preferences</span>
              <span>Store user settings</span>
              <span>1 year</span>
            </div>
            <div className="cookie-row">
              <span>cart_items</span>
              <span>Remember cart contents</span>
              <span>30 days</span>
            </div>
            <div className="cookie-row">
              <span>_ga</span>
              <span>Google Analytics</span>
              <span>2 years</span>
            </div>
          </div>
        </section>

        <section className="legal-section">
          <h2>Contact Us</h2>
          <p>
            If you have questions about our use of cookies, please contact us at:
          </p>
          <div className="legal-contact">
            <p><strong>Email:</strong> privacy@chiamoorder.com</p>
            <p><strong>Phone:</strong> +234 703 241 0362</p>
          </div>
        </section>
      </div>
    </div>
  );
}