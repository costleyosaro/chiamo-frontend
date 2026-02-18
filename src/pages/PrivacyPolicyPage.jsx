import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiChevronLeft,
  FiHome,
  FiShield,
  FiLock,
  FiEye,
  FiDatabase,
  FiShare2,
  FiUser,
  FiRefreshCw,
  FiMail,
  FiPhone,
  FiMapPin,
  FiArrowUp,
  FiCheck,
  FiAlertCircle,
} from "react-icons/fi";
import {
  HiOutlineDocumentText,
  HiOutlineShieldCheck,
} from "react-icons/hi";
import "./PrivacyPolicy.css";

// ============ CONFIGURATION ============
const LAST_UPDATED = "January 15, 2025";
const COMPANY_NAME = "ChiamoOrder";
const COMPANY_EMAIL = "chiamoorder@gmail.com";
const COMPANY_PHONE = "0701 832 9357";
const COMPANY_ADDRESS = "Along GU Ake Airport Road, Port Harcourt, Rivers State, Nigeria";

// ============ POLICY SECTIONS DATA ============
const POLICY_SECTIONS = [
  {
    id: "information-collected",
    icon: FiDatabase,
    title: "Information We Collect",
    intro: "We collect personal and usage information necessary to process orders, manage deliveries, and improve user experience. This may include:",
    points: [
      "Full name, contact details, and delivery address",
      "Order history and transaction details",
      "Device and browser data for performance optimization",
      "Real-time location (only when actively delivering orders)",
      "Payment information processed through secure gateways",
    ],
  },
  {
    id: "information-usage",
    icon: FiEye,
    title: "How We Use Your Information",
    intro: "ChiamoOrder uses the collected data solely to enhance and facilitate the order management process. We use your information to:",
    points: [
      "Confirm and process your orders securely",
      "Ensure accurate and timely delivery",
      "Provide customer support and order updates",
      "Enhance our logistics and improve app performance",
      "Send important notifications about your orders",
    ],
  },
  {
    id: "data-protection",
    icon: FiLock,
    title: "Data Protection & Security",
    intro: "We employ industry-grade security measures to safeguard your data:",
    points: [
      "End-to-end encryption for all sensitive data",
      "Secure APIs with authentication protocols",
      "Regular security audits and vulnerability assessments",
      "PCI-DSS compliant payment processing",
      "Access restrictions and role-based permissions",
    ],
    note: "Sensitive details such as payment information are handled using verified third-party gateways in compliance with global standards.",
  },
  {
    id: "information-sharing",
    icon: FiShare2,
    title: "Sharing of Information",
    intro: "Your privacy is our priority. Here's how we handle data sharing:",
    points: [
      "We never sell your data to third parties",
      "No sharing for marketing purposes without consent",
      "Limited data shared with logistics partners for delivery",
      "Legal compliance when required by law",
      "Anonymized data may be used for analytics",
    ],
  },
  {
    id: "user-rights",
    icon: FiUser,
    title: "Your Rights & Control",
    intro: "You have full control over your personal data. Your rights include:",
    points: [
      "Right to access your personal information",
      "Right to correct inaccurate data",
      "Right to request data deletion",
      "Right to data portability",
      "Right to withdraw consent at any time",
    ],
    note: "Exercise your rights by contacting our support team.",
  },
  {
    id: "policy-updates",
    icon: FiRefreshCw,
    title: "Policy Updates",
    intro: "This policy may be updated periodically to reflect changes in our operations or legal requirements:",
    points: [
      "Users will be notified within the app for major updates",
      "Email notifications for significant changes",
      "Continued use implies acceptance of updated terms",
      "Previous versions available upon request",
    ],
  },
];

// ============ QUICK LINKS DATA ============
const QUICK_LINKS = [
  { id: "information-collected", label: "Information Collected" },
  { id: "information-usage", label: "How We Use Data" },
  { id: "data-protection", label: "Data Security" },
  { id: "information-sharing", label: "Data Sharing" },
  { id: "user-rights", label: "Your Rights" },
  { id: "policy-updates", label: "Updates" },
];

// ============ BACK TO TOP COMPONENT ============
const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 400);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      className={`pp-back-to-top ${isVisible ? "visible" : ""}`}
      onClick={scrollToTop}
      aria-label="Back to top"
    >
      <FiArrowUp />
    </button>
  );
};

// ============ POLICY SECTION COMPONENT ============
const PolicySection = ({ section, index }) => {
  const IconComponent = section.icon;

  return (
    <div className="pp-section" id={section.id}>
      <div className="pp-section-header">
        <div className="pp-section-icon">
          <IconComponent />
        </div>
        <div className="pp-section-number">{String(index + 1).padStart(2, "0")}</div>
        <h2 className="pp-section-title">{section.title}</h2>
      </div>

      <div className="pp-section-content">
        <p className="pp-section-intro">{section.intro}</p>

        {section.points && (
          <ul className="pp-section-list">
            {section.points.map((point, i) => (
              <li key={i}>
                <FiCheck className="pp-list-icon" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        )}

        {section.note && (
          <div className="pp-section-note">
            <FiAlertCircle className="pp-note-icon" />
            <p>{section.note}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============ MAIN COMPONENT ============
export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("");

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = POLICY_SECTIONS.map((s) => s.id);
      
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="pp-page">
      {/* ===== HEADER ===== */}
      <header className="pp-header">
        <div className="pp-header-container">
          <div className="pp-header-left">
            <button className="pp-back-btn" onClick={() => navigate(-1)}>
              <FiChevronLeft />
              <span>Back</span>
            </button>
            <div className="pp-breadcrumb">
              <FiHome />
              <span>/</span>
              <span className="pp-breadcrumb-current">Privacy Policy</span>
            </div>
          </div>

          <div className="pp-header-right">
            <button className="pp-home-btn" onClick={() => navigate("/")}>
              <FiHome />
              <span>Home</span>
            </button>
          </div>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="pp-hero">
        <div className="pp-hero-background">
          <div className="pp-hero-pattern"></div>
        </div>
        
        <div className="pp-hero-content">
          <div className="pp-hero-icon">
            <HiOutlineShieldCheck />
          </div>
          
          <h1 className="pp-hero-title">Privacy Policy</h1>
          
          <p className="pp-hero-description">
            Your privacy is important to us. This policy explains how {COMPANY_NAME} collects, 
            uses, and protects your information while ensuring a safe, efficient, and 
            reliable order and delivery experience.
          </p>

          <div className="pp-hero-meta">
            <div className="pp-meta-item">
              <HiOutlineDocumentText />
              <span>Last Updated: {LAST_UPDATED}</span>
            </div>
            <div className="pp-meta-divider"></div>
            <div className="pp-meta-item">
              <FiShield />
              <span>GDPR Compliant</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MAIN CONTENT ===== */}
      <main className="pp-main">
        <div className="pp-main-container">
          {/* Quick Navigation Sidebar */}
          <aside className="pp-sidebar">
            <div className="pp-sidebar-sticky">
              <h3 className="pp-sidebar-title">Quick Navigation</h3>
              <nav className="pp-sidebar-nav">
                {QUICK_LINKS.map((link) => (
                  <button
                    key={link.id}
                    className={`pp-sidebar-link ${activeSection === link.id ? "active" : ""}`}
                    onClick={() => scrollToSection(link.id)}
                  >
                    {link.label}
                  </button>
                ))}
              </nav>

              <div className="pp-sidebar-contact">
                <h4>Need Help?</h4>
                <p>Contact our privacy team</p>
                <a href={`mailto:${COMPANY_EMAIL}`} className="pp-sidebar-email">
                  <FiMail />
                  {COMPANY_EMAIL}
                </a>
              </div>
            </div>
          </aside>

          {/* Policy Content */}
          <div className="pp-content">
            {/* Introduction Card */}
            <div className="pp-intro-card">
              <div className="pp-intro-icon">
                <FiShield />
              </div>
              <div className="pp-intro-text">
                <h3>Our Commitment to Privacy</h3>
                <p>
                  At {COMPANY_NAME}, we are committed to protecting your personal information 
                  and being transparent about how we collect and use it. This policy applies 
                  to all users of our platform, mobile applications, and services.
                </p>
              </div>
            </div>

            {/* Policy Sections */}
            {POLICY_SECTIONS.map((section, index) => (
              <PolicySection key={section.id} section={section} index={index} />
            ))}

            {/* Contact Section */}
            <div className="pp-contact-section" id="contact">
              <h2 className="pp-contact-title">
                <FiMail className="pp-contact-title-icon" />
                Contact Us
              </h2>
              
              <p className="pp-contact-intro">
                For privacy concerns, data requests, or any clarifications regarding this 
                policy, please reach out to us through any of the following channels:
              </p>

              <div className="pp-contact-cards">
                <div className="pp-contact-card">
                  <div className="pp-contact-card-icon">
                    <FiMail />
                  </div>
                  <h4>Email</h4>
                  <a href={`mailto:${COMPANY_EMAIL}`}>{COMPANY_EMAIL}</a>
                </div>

                <div className="pp-contact-card">
                  <div className="pp-contact-card-icon">
                    <FiPhone />
                  </div>
                  <h4>Phone</h4>
                  <a href={`tel:${COMPANY_PHONE.replace(/\s/g, "")}`}>{COMPANY_PHONE}</a>
                </div>

                <div className="pp-contact-card">
                  <div className="pp-contact-card-icon">
                    <FiMapPin />
                  </div>
                  <h4>Address</h4>
                  <p>{COMPANY_ADDRESS}</p>
                </div>
              </div>
            </div>

            {/* Acceptance Notice */}
            <div className="pp-acceptance">
              <FiCheck className="pp-acceptance-icon" />
              <p>
                By using {COMPANY_NAME}'s services, you acknowledge that you have read, 
                understood, and agree to be bound by this Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="pp-footer">
        <div className="pp-footer-container">
          <div className="pp-footer-left">
            <p>© {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.</p>
          </div>
          <div className="pp-footer-right">
            <button onClick={() => navigate("/")}>Home</button>
            <button onClick={() => navigate("/contact-us")}>Contact Us</button>
            <button onClick={() => navigate("/about-us")}>About Us</button>
          </div>
        </div>
      </footer>

      {/* Back to Top */}
      <BackToTop />
    </div>
  );
}