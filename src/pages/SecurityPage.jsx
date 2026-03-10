// src/pages/SecurityPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronLeft, FiShield, FiLock, FiServer, FiEye, FiCheckCircle } from "react-icons/fi";
import "./LegalPages.css";

export default function SecurityPage() {
  const navigate = useNavigate();

  const securityFeatures = [
    {
      icon: FiLock,
      title: "End-to-End Encryption",
      description: "All data transmitted between you and our servers is encrypted using industry-standard TLS 1.3 encryption."
    },
    {
      icon: FiServer,
      title: "Secure Infrastructure",
      description: "Our servers are hosted in secure data centers with 24/7 monitoring, firewalls, and intrusion detection systems."
    },
    {
      icon: FiEye,
      title: "Privacy by Design",
      description: "We collect only the data we need and never sell your personal information to third parties."
    },
    {
      icon: FiCheckCircle,
      title: "Regular Security Audits",
      description: "We conduct regular security assessments and penetration testing to identify and fix vulnerabilities."
    }
  ];

  return (
    <div className="legal-page security-page">
      <header className="legal-header">
        <button className="legal-back-btn" onClick={() => navigate(-1)}>
          <FiChevronLeft />
        </button>
        <h1>Security</h1>
        <div className="legal-header-icon">
          <FiShield />
        </div>
      </header>

      <div className="legal-content">
        <div className="security-hero">
          <div className="security-hero-icon">
            <FiShield />
          </div>
          <h2>Your Security is Our Priority</h2>
          <p>
            At ChiamoOrder, we take the security of your data seriously. 
            Here's how we protect your information.
          </p>
        </div>

        <div className="security-features-grid">
          {securityFeatures.map((feature, index) => (
            <div key={index} className="security-feature-card">
              <div className="security-feature-icon">
                <feature.icon />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>

        <section className="legal-section">
          <h2>How We Protect Your Data</h2>
          <ul>
            <li>
              <strong>Secure Authentication:</strong> We use secure password hashing 
              and support two-factor authentication for added security.
            </li>
            <li>
              <strong>Payment Security:</strong> All payment transactions are processed 
              through PCI-DSS compliant payment processors.
            </li>
            <li>
              <strong>Access Controls:</strong> Strict access controls ensure only 
              authorized personnel can access sensitive data.
            </li>
            <li>
              <strong>Data Backup:</strong> Regular automated backups ensure your 
              data is never lost.
            </li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>Reporting Security Issues</h2>
          <p>
            If you discover a security vulnerability, please report it to us responsibly. 
            We appreciate your help in keeping ChiamoOrder secure.
          </p>
          <div className="legal-contact">
            <p><strong>Security Email:</strong> security@chiamoorder.com</p>
            <p><strong>Response Time:</strong> Within 24 hours</p>
          </div>
        </section>

        <section className="legal-section">
          <h2>Security Tips for Users</h2>
          <div className="security-tips">
            <div className="security-tip">
              <span className="tip-number">1</span>
              <p>Use a strong, unique password for your account</p>
            </div>
            <div className="security-tip">
              <span className="tip-number">2</span>
              <p>Never share your login credentials with anyone</p>
            </div>
            <div className="security-tip">
              <span className="tip-number">3</span>
              <p>Log out when using shared or public devices</p>
            </div>
            <div className="security-tip">
              <span className="tip-number">4</span>
              <p>Keep your app updated to the latest version</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}