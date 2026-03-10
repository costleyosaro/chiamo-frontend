// src/pages/TermsOfServicePage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronLeft, FiFileText } from "react-icons/fi";
import "./LegalPages.css";

export default function TermsOfServicePage() {
  const navigate = useNavigate();

  return (
    <div className="legal-page">
      <header className="legal-header">
        <button className="legal-back-btn" onClick={() => navigate(-1)}>
          <FiChevronLeft />
        </button>
        <h1>Terms of Service</h1>
        <div className="legal-header-icon">
          <FiFileText />
        </div>
      </header>

      <div className="legal-content">
        <div className="legal-last-updated">
          Last updated: January 15, 2025
        </div>

        <section className="legal-section">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using ChiamoOrder's services, you accept and agree to be bound by 
            the terms and provisions of this agreement. If you do not agree to abide by these 
            terms, please do not use this service.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Description of Service</h2>
          <p>
            ChiamoOrder provides a digital ordering platform that allows users to browse products, 
            place orders, and track deliveries. Our services include but are not limited to:
          </p>
          <ul>
            <li>Product catalog browsing</li>
            <li>QR code scanning for quick ordering</li>
            <li>Order placement and management</li>
            <li>Delivery tracking</li>
            <li>Customer support</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. User Accounts</h2>
          <p>
            To use certain features of our service, you must register for an account. You agree to:
          </p>
          <ul>
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your password</li>
            <li>Accept responsibility for all activities under your account</li>
            <li>Notify us immediately of any unauthorized use</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>4. Orders and Payments</h2>
          <p>
            When you place an order through ChiamoOrder:
          </p>
          <ul>
            <li>All prices are in Nigerian Naira (₦) unless otherwise stated</li>
            <li>We reserve the right to refuse or cancel any order</li>
            <li>Payment must be made through our approved payment methods</li>
            <li>Delivery times are estimates and not guaranteed</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>5. User Conduct</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the service for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Interfere with the proper functioning of the service</li>
            <li>Upload malicious code or content</li>
            <li>Impersonate any person or entity</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>6. Intellectual Property</h2>
          <p>
            All content on ChiamoOrder, including text, graphics, logos, and software, 
            is the property of ChiamoOrder or its licensors and is protected by 
            intellectual property laws.
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Limitation of Liability</h2>
          <p>
            ChiamoOrder shall not be liable for any indirect, incidental, special, 
            consequential, or punitive damages resulting from your use of the service.
          </p>
        </section>

        <section className="legal-section">
          <h2>8. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify users 
            of any material changes via email or through the service.
          </p>
        </section>

        <section className="legal-section">
          <h2>9. Contact Information</h2>
          <p>
            For questions about these Terms of Service, please contact us at:
          </p>
          <div className="legal-contact">
            <p><strong>Email:</strong> legal@chiamoorder.com</p>
            <p><strong>Phone:</strong> +234 703 241 0362</p>
            <p><strong>Address:</strong> Port Harcourt, Rivers State, Nigeria</p>
          </div>
        </section>
      </div>
    </div>
  );
}