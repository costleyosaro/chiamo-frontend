import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiChevronLeft,
  FiHome,
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
  FiSend,
  FiArrowUp,
  FiUser,
  FiMessageSquare,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaTiktok,
  FaWhatsapp,
} from "react-icons/fa";
import { HiOutlineMail, HiOutlineLocationMarker } from "react-icons/hi";
import { BiSupport } from "react-icons/bi";
import "./ContactPage.css";

// ============ CONFIGURATION ============
const COMPANY_INFO = {
  name: "ChiamoOrder",
  email: "chiamoorder@gmail.com",
  phone: "0701 832 9357",
  whatsapp: "+2347018329357",
  address: "Along GU Ake Airport Road, Port Harcourt, Rivers State, Nigeria",
  workingHours: {
    days: "Monday - Saturday",
    hours: "8:00 AM - 6:00 PM",
    timezone: "WAT (West Africa Time)",
  },
};

const CONTACT_METHODS = [
  {
    id: "email",
    icon: FiMail,
    title: "Email Us",
    subtitle: "We'll respond within 24 hours",
    value: COMPANY_INFO.email,
    link: `mailto:${COMPANY_INFO.email}`,
    color: "#1b4b8c",
  },
  {
    id: "phone",
    icon: FiPhone,
    title: "Call Us",
    subtitle: "Available during business hours",
    value: COMPANY_INFO.phone,
    link: `tel:${COMPANY_INFO.phone.replace(/\s/g, "")}`,
    color: "#10b981",
  },
  {
    id: "whatsapp",
    icon: FaWhatsapp,
    title: "WhatsApp",
    subtitle: "Quick responses guaranteed",
    value: "Chat with us",
    link: `https://wa.me/${COMPANY_INFO.whatsapp.replace(/\+/g, "")}`,
    color: "#25d366",
  },
  {
    id: "location",
    icon: FiMapPin,
    title: "Visit Us",
    subtitle: "Our office location",
    value: "Port Harcourt, Nigeria",
    link: "https://maps.google.com",
    color: "#f5a623",
  },
];

const SOCIAL_LINKS = [
  { icon: FaFacebookF, link: "https://facebook.com", label: "Facebook" },
  { icon: FaInstagram, link: "https://instagram.com", label: "Instagram" },
  { icon: FaTwitter, link: "https://twitter.com", label: "Twitter" },
  { icon: FaTiktok, link: "https://tiktok.com", label: "TikTok" },
];

const FAQ_ITEMS = [
  {
    question: "What are your business hours?",
    answer: "We're available Monday to Saturday, 8:00 AM to 6:00 PM (WAT). We're closed on Sundays and public holidays.",
  },
  {
    question: "How quickly do you respond to inquiries?",
    answer: "We aim to respond to all emails within 24 hours. For urgent matters, please call or WhatsApp us for immediate assistance.",
  },
  {
    question: "Do you offer customer support?",
    answer: "Yes! Our dedicated support team is ready to help with orders, deliveries, account issues, and any other questions you may have.",
  },
  {
    question: "Can I partner with ChiamoOrder?",
    answer: "Absolutely! We welcome business partnerships. Please send us an email with your proposal and we'll get back to you promptly.",
  },
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
      className={`cp-back-to-top ${isVisible ? "visible" : ""}`}
      onClick={scrollToTop}
      aria-label="Back to top"
    >
      <FiArrowUp />
    </button>
  );
};

// ============ CONTACT CARD COMPONENT ============
const ContactCard = ({ method }) => {
  const IconComponent = method.icon;

  return (
    <a
      href={method.link}
      target={method.id === "whatsapp" || method.id === "location" ? "_blank" : "_self"}
      rel="noopener noreferrer"
      className="cp-contact-card"
    >
      <div
        className="cp-card-icon"
        style={{ backgroundColor: `${method.color}15`, color: method.color }}
      >
        <IconComponent />
      </div>
      <h3 className="cp-card-title">{method.title}</h3>
      <p className="cp-card-subtitle">{method.subtitle}</p>
      <span className="cp-card-value">{method.value}</span>
    </a>
  );
};

// ============ FAQ ITEM COMPONENT ============
const FAQItem = ({ item, isOpen, onToggle }) => {
  return (
    <div className={`cp-faq-item ${isOpen ? "open" : ""}`}>
      <button className="cp-faq-question" onClick={onToggle}>
        <span>{item.question}</span>
        <span className="cp-faq-icon">{isOpen ? "−" : "+"}</span>
      </button>
      <div className="cp-faq-answer">
        <p>{item.answer}</p>
      </div>
    </div>
  );
};

// ============ CONTACT FORM COMPONENT ============
const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStatus({
        type: "success",
        message: "Thank you! Your message has been sent successfully. We'll get back to you soon.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      setStatus({
        type: "error",
        message: "Oops! Something went wrong. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setStatus({ type: "", message: "" }), 5000);
    }
  };

  return (
    <form className="cp-form" onSubmit={handleSubmit}>
      <div className="cp-form-row">
        <div className="cp-form-group">
          <label htmlFor="name">
            <FiUser className="cp-label-icon" />
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="cp-form-group">
          <label htmlFor="email">
            <FiMail className="cp-label-icon" />
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="cp-form-group">
        <label htmlFor="subject">
          <FiMessageSquare className="cp-label-icon" />
          Subject
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          placeholder="How can we help you?"
          value={formData.subject}
          onChange={handleChange}
          required
        />
      </div>

      <div className="cp-form-group">
        <label htmlFor="message">
          <FiMessageSquare className="cp-label-icon" />
          Your Message
        </label>
        <textarea
          id="message"
          name="message"
          placeholder="Write your message here..."
          rows="5"
          value={formData.message}
          onChange={handleChange}
          required
        ></textarea>
      </div>

      {status.message && (
        <div className={`cp-form-status ${status.type}`}>
          {status.type === "success" ? (
            <FiCheckCircle className="cp-status-icon" />
          ) : (
            <FiAlertCircle className="cp-status-icon" />
          )}
          <p>{status.message}</p>
        </div>
      )}

      <button type="submit" className="cp-submit-btn" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <span className="cp-spinner"></span>
            Sending...
          </>
        ) : (
          <>
            <FiSend />
            Send Message
          </>
        )}
      </button>
    </form>
  );
};

// ============ MAIN COMPONENT ============
export default function ContactPage() {
  const navigate = useNavigate();
  const [openFAQ, setOpenFAQ] = useState(0);

  return (
    <div className="cp-page">
      {/* ===== HEADER ===== */}
      <header className="cp-header">
        <div className="cp-header-container">
          <div className="cp-header-left">
            <button className="cp-back-btn" onClick={() => navigate(-1)}>
              <FiChevronLeft />
              <span>Back</span>
            </button>
            <div className="cp-breadcrumb">
              <FiHome />
              <span>/</span>
              <span className="cp-breadcrumb-current">Contact Us</span>
            </div>
          </div>

          <div className="cp-header-right">
            <button className="cp-home-btn" onClick={() => navigate("/")}>
              <FiHome />
              <span>Home</span>
            </button>
          </div>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="cp-hero">
        <div className="cp-hero-background">
          <div className="cp-hero-pattern"></div>
        </div>

        <div className="cp-hero-content">
          <div className="cp-hero-icon">
            <HiOutlineMail />
          </div>

          <h1 className="cp-hero-title">Get In Touch</h1>

          <p className="cp-hero-description">
            We'd love to hear from you! Whether you have a question about our services, 
            need assistance with an order, or want to explore partnership opportunities, 
            our team is ready to help.
          </p>

          <div className="cp-hero-badges">
            <div className="cp-badge">
              <FiClock />
              <span>24hr Response Time</span>
            </div>
            <div className="cp-badge">
              <BiSupport />
              <span>Dedicated Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTACT CARDS ===== */}
      <section className="cp-cards-section">
        <div className="cp-cards-container">
          {CONTACT_METHODS.map((method) => (
            <ContactCard key={method.id} method={method} />
          ))}
        </div>
      </section>

      {/* ===== MAIN CONTENT ===== */}
      <main className="cp-main">
        <div className="cp-main-container">
          {/* Contact Form Section */}
          <div className="cp-form-section">
            <div className="cp-section-header">
              <h2 className="cp-section-title">Send Us a Message</h2>
              <p className="cp-section-subtitle">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>
            </div>
            <ContactForm />
          </div>

          {/* Info Section */}
          <div className="cp-info-section">
            {/* Business Hours */}
            <div className="cp-info-card">
              <div className="cp-info-card-header">
                <FiClock className="cp-info-icon" />
                <h3>Business Hours</h3>
              </div>
              <div className="cp-hours-grid">
                <div className="cp-hours-row">
                  <span className="cp-hours-label">Days:</span>
                  <span className="cp-hours-value">{COMPANY_INFO.workingHours.days}</span>
                </div>
                <div className="cp-hours-row">
                  <span className="cp-hours-label">Hours:</span>
                  <span className="cp-hours-value">{COMPANY_INFO.workingHours.hours}</span>
                </div>
                <div className="cp-hours-row">
                  <span className="cp-hours-label">Timezone:</span>
                  <span className="cp-hours-value">{COMPANY_INFO.workingHours.timezone}</span>
                </div>
              </div>
              <p className="cp-hours-note">
                We're closed on Sundays and public holidays.
              </p>
            </div>

            {/* Office Location */}
            <div className="cp-info-card">
              <div className="cp-info-card-header">
                <HiOutlineLocationMarker className="cp-info-icon" />
                <h3>Our Office</h3>
              </div>
              <p className="cp-address">{COMPANY_INFO.address}</p>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="cp-map-link"
              >
                <FiMapPin />
                View on Google Maps
              </a>
            </div>

            {/* Social Media */}
            <div className="cp-info-card">
              <div className="cp-info-card-header">
                <span className="cp-info-icon">📱</span>
                <h3>Follow Us</h3>
              </div>
              <p className="cp-social-text">
                Stay connected and get the latest updates on our social media channels.
              </p>
              <div className="cp-social-links">
                {SOCIAL_LINKS.map((social, index) => (
                  <a
                    key={index}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cp-social-link"
                    aria-label={social.label}
                  >
                    <social.icon />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ===== FAQ SECTION ===== */}
      <section className="cp-faq-section">
        <div className="cp-faq-container">
          <div className="cp-section-header centered">
            <h2 className="cp-section-title">Frequently Asked Questions</h2>
            <p className="cp-section-subtitle">
              Quick answers to common questions about contacting us.
            </p>
          </div>

          <div className="cp-faq-list">
            {FAQ_ITEMS.map((item, index) => (
              <FAQItem
                key={index}
                item={item}
                isOpen={openFAQ === index}
                onToggle={() => setOpenFAQ(openFAQ === index ? -1 : index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="cp-cta-section">
        <div className="cp-cta-container">
          <div className="cp-cta-content">
            <h2>Ready to Get Started?</h2>
            <p>
              Join thousands of satisfied customers who trust ChiamoOrder for 
              their ordering needs.
            </p>
          </div>
          <div className="cp-cta-buttons">
            <button className="cp-cta-btn primary" onClick={() => navigate("/signup")}>
              Create Account
            </button>
            <a
              href={`https://wa.me/${COMPANY_INFO.whatsapp.replace(/\+/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="cp-cta-btn secondary"
            >
              <FaWhatsapp />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="cp-footer">
        <div className="cp-footer-container">
          <div className="cp-footer-left">
            <p>© {new Date().getFullYear()} {COMPANY_INFO.name}. All rights reserved.</p>
          </div>
          <div className="cp-footer-right">
            <button onClick={() => navigate("/")}>Home</button>
            <button onClick={() => navigate("/privacy-policy")}>Privacy Policy</button>
            <button onClick={() => navigate("/about-us")}>About Us</button>
          </div>
        </div>
      </footer>

      {/* Back to Top */}
      <BackToTop />
    </div>
  );
}