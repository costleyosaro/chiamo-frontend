// src/pages/PreHomePage.jsx
import React, { useState, useEffect, useRef } from "react";
import "./PreHomePage.css";
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaTwitter,
  FaLinkedinIn,
  FaWhatsapp,
  FaCheck,
  FaArrowRight,
  FaQuoteLeft,
  FaStar,
  FaShoppingCart,
  FaQrcode,
  FaTruck,
  FaHeadset,
  FaShieldAlt,
  FaClock,
  FaUsers,
  FaStore,
  FaChartLine,
  FaPlay,
  FaChevronDown,
  FaChevronUp,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";
import {
  FiMenu,
  FiX,
  FiImage,
  FiChevronRight,
  FiArrowUpRight,
} from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi";
import Lottie from "lottie-react";
import { QrReader } from "react-qr-reader";
import { useNavigate } from "react-router-dom";
import Avatar from "react-avatar";

// Import animations
import cartAnimation from "../assets/animations/cart.json";
import scanAnimation from "../assets/animations/scan.json";
import carDeliveryAnimation from "../assets/animations/car_delivery.json";
import easyAnimation from "../assets/animations/easy.json";
import reliableAnimation from "../assets/animations/reliable.json";
import ShoppingAnimation from "../assets/animations/Shopping.json";
import scanningAnimation from "../assets/animations/scanning.json";

// Import logos
import chiamoLogo from "../assets/CHIAMO_MULTITRADE_LOGO.png";
import ghadcoLogo from "../assets/GHADCO_LOGO.png";
import mamudaLogo from "../assets/mamuda-logo.png";

// ============ CONFIGURATION ============
const CONFIG = {
  companyName: "ChiamoOrder",
  tagline: "Shop Smarter, Order Faster",
  version: "v1.0.0",
  currentYear: new Date().getFullYear(),
};

// ============ NAVIGATION LINKS ============
const NAV_LINKS = [
  { name: "Home", href: "#home" },
  { name: "Features", href: "#features" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Testimonials", href: "#testimonials" },
  { name: "FAQ", href: "#faq" },
  { name: "Contact", href: "#contact" },
];

// ============ STATS DATA ============
const STATS = [
  { number: "5K+", label: "Active Users", icon: FaUsers },
  { number: "200+", label: "Partner Stores", icon: FaStore },
  { number: "20K+", label: "Orders Delivered", icon: FaTruck },
  { number: "99.9%", label: "Uptime", icon: FaChartLine },
];

// ============ FEATURES DATA ============
const FEATURES = [
  {
    icon: FaQrcode,
    title: "QR Code Ordering",
    description:
      "Scan product QR codes instantly to add items to your cart. No more manual searching or typing.",
    color: "#4a9eff",
  },
  {
    icon: FaTruck,
    title: "Fast Delivery",
    description:
      "Get your orders delivered quickly and reliably. Track your delivery in real-time.",
    color: "#10b981",
  },
  {
    icon: FaShieldAlt,
    title: "Secure Payments",
    description:
      "Multiple secure payment options including cards, bank transfer, and cash on delivery.",
    color: "#f59e0b",
  },
  {
    icon: FaHeadset,
    title: "24/7 Support",
    description:
      "Our dedicated support team is always ready to help you with any questions or issues.",
    color: "#ef4444",
  },
  {
    icon: FaClock,
    title: "Real-time Tracking",
    description:
      "Track your orders from placement to delivery. Know exactly when to expect your items.",
    color: "#8b5cf6",
  },
  {
    icon: FaChartLine,
    title: "Business Analytics",
    description:
      "Get insights into your ordering patterns and spending to make smarter decisions.",
    color: "#06b6d4",
  },
];

// ============ HOW IT WORKS DATA ============
const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Create Account",
    description: "Sign up in seconds with your email or phone number. Quick and hassle-free.",
    animation: easyAnimation,
  },
  {
    step: "02",
    title: "Browse & Scan",
    description: "Explore our product catalog or scan QR codes to find what you need instantly.",
    animation: scanAnimation,
  },
  {
    step: "03",
    title: "Place Order",
    description: "Add items to cart, choose payment method, and confirm your order with one tap.",
    animation: cartAnimation,
  },
  {
    step: "04",
    title: "Get Delivered",
    description: "Sit back and relax. Your order will be delivered right to your doorstep.",
    animation: carDeliveryAnimation,
  },
];

// ============ TESTIMONIALS DATA ============
const TESTIMONIALS = [
  {
    name: "Abdullahi Gombe",
    role: "Café Owner",
    avatar: "Abdullahi",
    rating: 5,
    text: "ChiamoOrder has completely transformed how we manage our supply orders. What used to take hours now takes minutes. The QR scanning feature is a game-changer!",
    color: "#1b4b8c",
  },
  {
    name: "Mr. David Okonkwo",
    role: "Restaurant Manager",
    avatar: "David",
    rating: 5,
    text: "Our team saves hours every week thanks to the streamlined ordering system. The real-time tracking gives us peace of mind knowing exactly when supplies will arrive.",
    color: "#d4a017",
  },
  {
    name: "Anitta Johnson",
    role: "Bakery Owner",
    avatar: "Anitta",
    rating: 5,
    text: "Easy to use and my customers love it. The support team is incredibly responsive. I've recommended ChiamoOrder to all my business friends!",
    color: "#10b981",
  },
  {
    name: "Emeka Nwosu",
    role: "Supermarket Owner",
    avatar: "Emeka",
    rating: 5,
    text: "The analytics feature helps me understand my ordering patterns better. I've reduced waste and saved money since I started using ChiamoOrder.",
    color: "#8b5cf6",
  },
];

// ============ FAQ DATA ============
const FAQ_DATA = [
  {
    question: "How do I create an account?",
    answer:
      "Simply click the 'Sign Up' button, enter your email or phone number, create a password, and you're ready to start ordering. The process takes less than a minute.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "We accept multiple payment methods including debit/credit cards, bank transfers, USSD payments, and cash on delivery for your convenience.",
  },
  {
    question: "How does the QR code scanning work?",
    answer:
      "Each product has a unique QR code. Simply open the scanner in our app, point your camera at the QR code, and the product will be automatically added to your cart with all details filled in.",
  },
  {
    question: "What are the delivery times?",
    answer:
      "Delivery times vary based on your location. Typically, orders within the city are delivered within 2-4 hours, while other areas may take 1-2 business days.",
  },
  {
    question: "Can I track my order?",
    answer:
      "Yes! Once your order is confirmed, you can track it in real-time through the app. You'll receive notifications at each stage of the delivery process.",
  },
  {
    question: "Is there a minimum order amount?",
    answer:
      "There's no minimum order amount for pickup orders. For deliveries, a minimum order of ₦5,000 applies to qualify for free delivery within the city.",
  },
];

// ============ PARTNER LOGOS ============
const PARTNERS = [
  { src: chiamoLogo, alt: "Chiamo Multitrade", name: "Chiamo Multitrade" },
  { src: ghadcoLogo, alt: "Ghadco Nigeria", name: "Ghadco Nigeria" },
  { src: mamudaLogo, alt: "Mamuda Group", name: "Mamuda Group" },
];

// ============ NAVBAR COMPONENT ============
const Navbar = ({ onScanClick, navigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Update active section based on scroll position
      const sections = NAV_LINKS.map((link) => link.href.slice(1));
      for (const section of sections.reverse()) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href) => {
    setMenuOpen(false);
    const element = document.getElementById(href.slice(1));
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <nav className={`navbar ${isScrolled ? "navbar-scrolled" : ""}`}>
        <div className="navbar-container">
          {/* Logo */}
          <div className="navbar-logo" onClick={() => handleNavClick("#home")}>
            <img
              src="https://ik.imagekit.io/ljwnlcbqyu/CHIAMO-ORDER-LOGO2.png?tr=w-200,f-auto,q-80"
              alt="ChiamoOrder Logo"
              className="logo-image"
              loading="lazy"
            />
            <div className="logo-text">
              Chiamo<span>Order</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <ul className="navbar-links">
            {NAV_LINKS.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className={activeSection === link.href.slice(1) ? "active" : ""}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>

          {/* Right Actions */}
          <div className="navbar-actions">
            {/* Scan Button */}
            <button className="scan-btn" onClick={onScanClick}>
              <Lottie
                animationData={scanningAnimation}
                loop
                className="scan-animation"
              />
              <span>Scan</span>
            </button>

            {/* Gallery Button */}
            <button
              className="gallery-btn"
              onClick={() => navigate("/product-gallery")}
            >
              <FiImage size={18} />
              <span>Gallery</span>
            </button>

            {/* Auth Buttons */}
            <div className="auth-buttons">
              <button
                className="btn btn-outline"
                onClick={() => navigate("/login")}
              >
                Sign In
              </button>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/signup")}
              >
                Get Started
                <FiArrowUpRight size={16} />
              </button>
            </div>

            {/* Hamburger */}
            <button
              className="hamburger-btn"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <FiMenu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-overlay ${menuOpen ? "active" : ""}`}>
        <div className="mobile-menu">
          <div className="mobile-menu-header">
            <div className="navbar-logo">
              <img
                src="/assets/images/CHIAMO-ORDER-LOGO2.png"
                alt="ChiamoOrder Logo"
                className="logo-image"
              />
              <div className="logo-text">
                Chiamo<span>Order</span>
              </div>
            </div>
            <button
              className="close-btn"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <FiX size={24} />
            </button>
          </div>

          <ul className="mobile-nav-links">
            {NAV_LINKS.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }}
                >
                  {link.name}
                  <FiChevronRight size={18} />
                </a>
              </li>
            ))}
          </ul>

          <div className="mobile-menu-divider" />

          <div className="mobile-menu-actions">
            <button
              className="mobile-action-btn"
              onClick={() => {
                setMenuOpen(false);
                onScanClick();
              }}
            >
              <FaQrcode size={20} />
              <span>Scan QR Code</span>
            </button>
            <button
              className="mobile-action-btn"
              onClick={() => {
                setMenuOpen(false);
                navigate("/product-gallery");
              }}
            >
              <FiImage size={20} />
              <span>Product Gallery</span>
            </button>
          </div>

          <div className="mobile-auth-buttons">
            <button
              className="btn btn-outline btn-block"
              onClick={() => {
                setMenuOpen(false);
                navigate("/login");
              }}
            >
              Sign In
            </button>
            <button
              className="btn btn-primary btn-block"
              onClick={() => {
                setMenuOpen(false);
                navigate("/signup");
              }}
            >
              Create Account
              <FaArrowRight size={14} />
            </button>
          </div>

          <div className="mobile-menu-footer">
            <p>Follow us</p>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noreferrer">
                <FaFacebookF />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer">
                <FaInstagram />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer">
                <FaTwitter />
              </a>
              <a href="https://wa.me/1234567890" target="_blank" rel="noreferrer">
                <FaWhatsapp />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ============ HERO SECTION ============
const HeroSection = ({ navigate, onScanClick }) => (
  <section id="home" className="hero-section">
    <div className="hero-background">
      <div className="hero-gradient" />
      <div className="hero-pattern" />
    </div>

    <div className="hero-container">
      <div className="hero-content">
        <div className="hero-badge">
          <HiOutlineSparkles />
          <span>New: QR Code Scanning Available</span>
        </div>

        <h1 className="hero-title">
          <span className="highlight-yellow">Shop Smarter,</span>
          <br />
          <span className="highlight-blue">Order Faster</span>
          <Lottie
            animationData={cartAnimation}
            loop
            className="title-animation"
          />
        </h1>

        {/* Scan Animation - Added between title and description */}
        <div className="hero-scan-wrapper">
          <Lottie
            animationData={scanAnimation}
            loop
            className="hero-scan-animation"
          />
        </div>

        <p className="hero-description">
          ChiamoOrder revolutionizes how you place orders. From the comfort of
          your home or shop, scan, order, and receive — all digitally. No more
          manual processes, just seamless efficiency.
        </p>

        <div className="hero-cta">
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate("/signup")}
          >
            Get Started Free
            <FaArrowRight />
          </button>
          <button className="btn btn-secondary btn-lg" onClick={onScanClick}>
            <FaQrcode />
            Scan to Order
          </button>
        </div>

        <div className="hero-trust">
          <div className="trust-avatars">
            {["A", "B", "C", "D", "E"].map((letter, i) => (
              <Avatar
                key={i}
                name={letter}
                size="36"
                round
                color={["#1b4b8c", "#f5a623", "#10b981", "#8b5cf6", "#ef4444"][i]}
                className="trust-avatar"
              />
            ))}
          </div>
          <div className="trust-text">
            <div className="trust-stars">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} />
              ))}
            </div>
            <span>Trusted by 10,000+ businesses</span>
          </div>
        </div>
      </div>

      <div className="hero-visual">
        <div className="hero-image-wrapper">
          <Lottie
            animationData={ShoppingAnimation}
            loop
            className="hero-animation"
          />
          <div className="floating-card card-1">
            <FaTruck />
            <span>Fast Delivery</span>
          </div>
          <div className="floating-card card-2">
            <FaShieldAlt />
            <span>100% Secure</span>
          </div>
          <div className="floating-card card-3">
            <FaCheck />
            <span>Order Confirmed!</span>
          </div>
        </div>
      </div>
    </div>

    <div className="hero-scroll-indicator">
      <span>Scroll to explore</span>
      <div className="scroll-arrow" />
    </div>
  </section>
);

// ============ STATS SECTION ============
const StatsSection = () => (
  <section className="stats-section">
    <div className="stats-container">
      {STATS.map((stat, index) => (
        <div key={index} className="stat-item">
          <div className="stat-icon">
            <stat.icon />
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{stat.number}</h3>
            <p className="stat-label">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

// ============ FEATURES SECTION ============
const FeaturesSection = () => (
  <section id="features" className="features-section">
    <div className="section-container">
      <div className="section-header">
        <span className="section-badge">Features</span>
        <h2 className="section-title">
          Everything you need to <span>order smarter</span>
        </h2>
        <p className="section-description">
          Powerful features designed to make your ordering experience seamless,
          fast, and reliable.
        </p>
      </div>

      <div className="features-grid">
        {FEATURES.map((feature, index) => (
          <div key={index} className="feature-card">
            <div
              className="feature-icon"
              style={{ backgroundColor: `${feature.color}15` }}
            >
              <feature.icon style={{ color: feature.color }} />
            </div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
            <a href="#" className="feature-link">
              Learn more <FiChevronRight />
            </a>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ============ HOW IT WORKS SECTION ============
const HowItWorksSection = () => (
  <section id="how-it-works" className="how-it-works-section">
    <div className="section-container">
      <div className="section-header">
        <span className="section-badge">How It Works</span>
        <h2 className="section-title">
          Start ordering in <span>4 simple steps</span>
        </h2>
        <p className="section-description">
          Getting started with ChiamoOrder is quick and easy. Follow these
          simple steps to begin your seamless ordering experience.
        </p>
      </div>

      <div className="steps-container">
        {HOW_IT_WORKS.map((item, index) => (
          <div key={index} className="step-item">
            <div className="step-number">{item.step}</div>
            <div className="step-animation">
              <Lottie animationData={item.animation} loop />
            </div>
            <h3 className="step-title">{item.title}</h3>
            <p className="step-description">{item.description}</p>
            {index < HOW_IT_WORKS.length - 1 && (
              <div className="step-connector" />
            )}
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ============ TESTIMONIALS SECTION ============
const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="testimonials" className="testimonials-section">
      <div className="section-container">
        <div className="section-header">
          <span className="section-badge">Testimonials</span>
          <h2 className="section-title">
            Loved by <span>businesses everywhere</span>
          </h2>
          <p className="section-description">
            See what our customers have to say about their experience with
            ChiamoOrder.
          </p>
        </div>

        <div className="testimonials-grid">
          {TESTIMONIALS.map((testimonial, index) => (
            <div
              key={index}
              className={`testimonial-card ${
                index === activeIndex ? "active" : ""
              }`}
            >
              <div className="testimonial-quote">
                <FaQuoteLeft />
              </div>
              <p className="testimonial-text">{testimonial.text}</p>
              <div className="testimonial-rating">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FaStar key={i} />
                ))}
              </div>
              <div className="testimonial-author">
                <Avatar
                  name={testimonial.avatar}
                  size="50"
                  round
                  color={testimonial.color}
                />
                <div className="author-info">
                  <h4>{testimonial.name}</h4>
                  <span>{testimonial.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============ PARTNERS SECTION ============
const PartnersSection = () => (
  <section className="partners-section">
    <div className="section-container">
      <p className="partners-label">Trusted and Powered By</p>
      <div className="partners-logos">
        {PARTNERS.map((partner, index) => (
          <div key={index} className="partner-logo-wrapper">
            <img src={partner.src} alt={partner.alt} className="partner-logo" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ============ FAQ SECTION ============
const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="faq-section">
      <div className="section-container">
        <div className="section-header">
          <span className="section-badge">FAQ</span>
          <h2 className="section-title">
            Frequently Asked <span>Questions</span>
          </h2>
          <p className="section-description">
            Got questions? We've got answers. If you can't find what you're
            looking for, feel free to contact us.
          </p>
        </div>

        <div className="faq-container">
          {FAQ_DATA.map((faq, index) => (
            <div
              key={index}
              className={`faq-item ${openIndex === index ? "open" : ""}`}
            >
              <button
                className="faq-question"
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
              >
                <span>{faq.question}</span>
                {openIndex === index ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============ CTA SECTION ============
const CTASection = ({ navigate }) => (
  <section className="cta-section">
    <div className="cta-container">
      <div className="cta-content">
        <h2>Ready to transform your ordering experience?</h2>
        <p>
          Join thousands of businesses already using ChiamoOrder to streamline
          their operations.
        </p>
        <div className="cta-buttons">
          <button
            className="btn btn-white btn-lg"
            onClick={() => navigate("/signup")}
          >
            Start Free Trial
            <FaArrowRight />
          </button>
          <button
            className="btn btn-outline-white btn-lg"
            onClick={() => navigate("/contact-us")}
          >
            Contact Sales
          </button>
        </div>
      </div>
      <div className="cta-features">
        <div className="cta-feature">
          <FaCheck /> No credit card required
        </div>
        <div className="cta-feature">
          <FaCheck /> Free 14-day trial
        </div>
        <div className="cta-feature">
          <FaCheck /> Cancel anytime
        </div>
      </div>
    </div>
  </section>
);

// ============ CONTACT SECTION ============
const ContactSection = () => (
  <section id="contact" className="contact-section">
    <div className="section-container">
      <div className="section-header">
        <span className="section-badge">Contact</span>
        <h2 className="section-title">
          Get in <span>touch</span>
        </h2>
        <p className="section-description">
          Have questions or need help? Our team is here to assist you.
        </p>
      </div>

      <div className="contact-grid">
        <div className="contact-card">
          <div className="contact-icon">
            <FaEnvelope />
          </div>
          <h3>Email Us</h3>
          <p>chiamoorder@gmail.com</p>
          <a href="mailto:support@chiamoorder.com">Send Email</a>
        </div>
        <div className="contact-card">
          <div className="contact-icon">
            <FaPhone />
          </div>
          <h3>Call Us</h3>
          <p>+234 7032410362</p>
          <a href="tel:+2347032410362">Make Call</a>
        </div>
        <div className="contact-card">
          <div className="contact-icon">
            <FaWhatsapp />
          </div>
          <h3>WhatsApp</h3>
          <p>Chat with us instantly</p>
          <a href="https://wa.me/2347032410362" target="_blank" rel="noreferrer">
            Start Chat
          </a>
        </div>
        <div className="contact-card">
          <div className="contact-icon">
            <FaMapMarkerAlt />
          </div>
          <h3>Visit Us</h3>
          <p>Portharcourt, Nigeria</p>
          <a href="#" target="_blank" rel="noreferrer">
            Get Directions
          </a>
        </div>
      </div>
    </div>
  </section>
);

// ============ FOOTER COMPONENT ============
const Footer = ({ navigate }) => (
  <footer className="footer">
    <div className="footer-container">
      <div className="footer-main">
        <div className="footer-brand">
          <div className="footer-logo">
            <img
              src="/assets/images/CHIAMO-ORDER-LOGO2.png"
              alt="ChiamoOrder Logo"
              className="logo-image"
            />
            <div className="logo-text">
              Chiamo<span>Order</span>
            </div>
          </div>
          <p className="footer-tagline">
            Your trusted partner for seamless digital ordering. Shop smarter,
            order faster with ChiamoOrder.
          </p>
          <div className="footer-social">
            <a
              href="https://www.facebook.com/share/1BqNPR6azJ/"
              target="_blank"
              rel="noreferrer"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://www.instagram.com/ghadco_ph"
              target="_blank"
              rel="noreferrer"
            >
              <FaInstagram />
            </a>
            <a
              href="https://www.tiktok.com/@ghadco_phc"
              target="_blank"
              rel="noreferrer"
            >
              <FaTiktok />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer">
              <FaTwitter />
            </a>
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noreferrer"
            >
              <FaLinkedinIn />
            </a>
          </div>
        </div>

        <div className="footer-links-grid">
          <div className="footer-links-column">
            <h4>Product</h4>
            <ul>
              <li>
                <a href="#features">Features</a>
              </li>
              <li>
                <a href="#how-it-works">How It Works</a>
              </li>
              <li>
                <button onClick={() => navigate("/product-gallery")}>
                  Product Gallery
                </button>
              </li>
              <li>
                <a href="#">Pricing</a>
              </li>
            </ul>
          </div>
          <div className="footer-links-column">
            <h4>Company</h4>
            <ul>
              <li>
                <button onClick={() => navigate("/about-us")}>About Us</button>
              </li>
              <li>
                <a href="#">Careers</a>
              </li>
              <li>
                <a href="#">Press</a>
              </li>
              <li>
                <button onClick={() => navigate("/contact-us")}>Contact</button>
              </li>
            </ul>
          </div>
          <div className="footer-links-column">
            <h4>Resources</h4>
            <ul>
              <li>
                <a href="#">Help Center</a>
              </li>
              <li>
                <a href="#">Documentation</a>
              </li>
              <li>
                <a href="#">API Reference</a>
              </li>
              <li>
                <a href="#">Community</a>
              </li>
            </ul>
          </div>
          <div className="footer-links-column">
            <h4>Legal</h4>
            <ul>
              <li>
                <button onClick={() => navigate("/privacy-policy")}>
                  Privacy Policy
                </button>
              </li>
              <li>
                <a href="#">Terms of Service</a>
              </li>
              <li>
                <a href="#">Cookie Policy</a>
              </li>
              <li>
                <a href="#">Security</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-copyright">
          <p>
            © {CONFIG.currentYear} {CONFIG.companyName}. All rights reserved.
          </p>
          <span className="footer-version">{CONFIG.version}</span>
        </div>
        <div className="footer-developer">
          <p>
            Developed with ❤️ by{" "}
            <a
              href="https://github.com/costleyosaro"
              target="_blank"
              rel="noreferrer"
            >
              Costley
            </a>
          </p>
        </div>
      </div>
    </div>
  </footer>
);

// ============ QR SCANNER MODAL ============
const QRScannerModal = ({ isOpen, onClose }) => {
  const [scanResult, setScanResult] = useState(null);

  if (!isOpen) return null;

  return (
    <div className="scanner-modal">
      <div className="scanner-content">
        <button className="scanner-close" onClick={onClose}>
          <FiX size={24} />
        </button>
        <h3>Scan QR Code</h3>
        <p>Point your camera at a product QR code to add it to your cart</p>
        <div className="scanner-view">
          <QrReader
            constraints={{ facingMode: "environment" }}
            onResult={(result) => {
              if (result) setScanResult(result?.text);
            }}
            style={{ width: "100%" }}
          />
          <div className="scanner-overlay">
            <div className="scanner-corners" />
          </div>
        </div>
        {scanResult && (
          <div className="scan-result">
            <FaCheck />
            <span>Result: {scanResult}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ============ MAIN COMPONENT ============
export default function PreHomePage() {
  const [scanOpen, setScanOpen] = useState(false);
  const navigate = useNavigate();

  // Smooth scroll behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  return (
    <div className="prehome-wrapper">
      <Navbar
        onScanClick={() => setScanOpen(true)}
        navigate={navigate}
      />

      <main className="main-content">
        <HeroSection
          navigate={navigate}
          onScanClick={() => setScanOpen(true)}
        />
        <StatsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PartnersSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection navigate={navigate} />
        <ContactSection />
      </main>

      <Footer navigate={navigate} />

      <QRScannerModal isOpen={scanOpen} onClose={() => setScanOpen(false)} />
    </div>
  );
}