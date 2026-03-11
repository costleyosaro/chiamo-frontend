// src/pages/AboutPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiChevronLeft,
  FiHome,
  FiArrowUp,
  FiArrowRight,
  FiCheck,
  FiUsers,
  FiTruck,
  FiShield,
  FiZap,
  FiTarget,
  FiEye,
  FiHeart,
  FiTrendingUp,
  FiPackage,
  FiClock,
  FiStar,
  FiChevronRight,
  FiChevronDown,
} from "react-icons/fi";
import {
  FaShoppingCart,
  FaRocket,
  FaLightbulb,
  FaQuoteLeft,
} from "react-icons/fa";
import { HiOutlineOfficeBuilding, HiOutlineSparkles } from "react-icons/hi";
import { BiSupport } from "react-icons/bi";
import "./AboutPage.css";

// ============ IMAGE URLS ============
const SLIDER_IMAGES = [
  {
    url: "https://ik.imagekit.io/ljwnlcbqyu/AMAKA_PIC.jpeg",
    alt: "ChiamoOrder Team Member 1",
  },
  {
    url: "https://ik.imagekit.io/ljwnlcbqyu/ELLA_3.jpeg",
    alt: "ChiamoOrder Team Member 2",
  },
];

// ============ CONFIGURATION ============
const COMPANY_INFO = {
  name: "ChiamoOrder",
  founded: "2025",
  tagline: "Digital Ordering. Simplified.",
  description: `At ChiamoOrder, we revolutionize how businesses place and manage their 
    product orders. No more paperwork or long waiting times — our smart digital ordering 
    system connects retailers and distributors in real time, ensuring seamless transactions, 
    faster deliveries, and greater transparency.`,
  mission: `To empower businesses with a seamless, efficient, and transparent digital 
    ordering platform that bridges the gap between demand and delivery.`,
  vision: `To become Africa's leading digital commerce platform, transforming how 
    businesses connect, order, and grow together.`,
  quote: `"We don't just process orders — we build smarter connections between businesses 
    and their customers. With every order placed, ChiamoOrder moves commerce closer to 
    speed, transparency, and trust."`,
};

// ============ STATS DATA ============
const STATS = [
  { number: "10K+", label: "Happy Customers", icon: FiUsers },
  { number: "50K+", label: "Orders Delivered", icon: FiPackage },
  { number: "500+", label: "Partner Stores", icon: HiOutlineOfficeBuilding },
  { number: "99.9%", label: "Uptime", icon: FiTrendingUp },
];

// ============ VALUES DATA ============
const VALUES = [
  {
    icon: FiZap,
    title: "Speed",
    description: "Fast order processing and quick deliveries to keep your business moving.",
    color: "#f5a623",
  },
  {
    icon: FiShield,
    title: "Reliability",
    description: "Consistent, dependable service you can count on every single time.",
    color: "#1b4b8c",
  },
  {
    icon: FiHeart,
    title: "Customer First",
    description: "Your satisfaction is our priority. We listen, adapt, and deliver.",
    color: "#ef4444",
  },
  {
    icon: FaLightbulb,
    title: "Innovation",
    description: "Continuously improving our platform with cutting-edge technology.",
    color: "#10b981",
  },
];

// ============ WHY CHOOSE US DATA ============
const WHY_CHOOSE_US = [
  {
    icon: FiClock,
    title: "Save Time",
    description: "Place orders in seconds, not hours. Our streamlined process eliminates paperwork.",
  },
  {
    icon: FiTruck,
    title: "Fast Delivery",
    description: "Quick and reliable delivery to your doorstep. Track your orders in real-time.",
  },
  {
    icon: BiSupport,
    title: "24/7 Support",
    description: "Our dedicated support team is always ready to help you with any issues.",
  },
  {
    icon: FiShield,
    title: "Secure Payments",
    description: "Multiple secure payment options with encrypted transactions.",
  },
  {
    icon: FiStar,
    title: "Quality Products",
    description: "Only the best products from trusted suppliers and distributors.",
  },
  {
    icon: FiTrendingUp,
    title: "Business Growth",
    description: "Tools and insights to help your business grow and succeed.",
  },
];

// ============ TEAM DATA WITH IMAGES (5 MEMBERS) ============
const TEAM = [
  {
    name: "Chiamo",
    role: "CEO & Founder",
    image: "https://ik.imagekit.io/ljwnlcbqyu/CHIAMO_PIC.jpeg",
    initial: "CH",
  },
  {
    name: "Mr. Aseeyl",
    role: "Operations Manager",
    image: "https://ik.imagekit.io/ljwnlcbqyu/MR_aseeyl.jpeg",
    initial: "AS",
  },
  {
    name: "Mr. Ali",
    role: "Tech Lead",
    image: "https://ik.imagekit.io/ljwnlcbqyu/MR%20ALI.jpeg",
    initial: "AL",
  },
  {
    name: "Costley Osaro",
    role: "Software Developer",
    image: "https://ik.imagekit.io/ljwnlcbqyu/HR%20PIC.jpeg",
    initial: "CO",
  },
  {
    name: "Cynthia",
    role: "Customer Care",
    image: "https://ik.imagekit.io/ljwnlcbqyu/CUSTOMER_CARE1.jpg.jpeg?updatedAt=1773224385365",
    initial: "CY",
  },
];

// ============ MILESTONES DATA ============
const MILESTONES = [
  { year: "2025", title: "Company Founded", description: "ChiamoOrder was born with a vision to transform digital ordering." },
  { year: "2026", title: "Platform Launch", description: "Launched our digital ordering platform to the public." },
  { year: "2026", title: "1000+ Users", description: "Reached our first milestone of 1000 active users." },
  { year: "2026", title: "Expansion", description: "Expanding operations across Nigeria and beyond." },
];

// ============ IMAGE SLIDER COMPONENT ============
const ImageSlider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, images.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <div className="ap-slider">
      <div className="ap-slider-container">
        {images.map((image, index) => (
          <div
            key={index}
            className={`ap-slider-slide ${index === currentIndex ? "active" : ""}`}
          >
            <img src={image.url} alt={image.alt} />
          </div>
        ))}

        <button
          className="ap-slider-arrow ap-slider-arrow-left"
          onClick={goToPrevious}
          aria-label="Previous image"
        >
          <FiChevronLeft />
        </button>
        <button
          className="ap-slider-arrow ap-slider-arrow-right"
          onClick={goToNext}
          aria-label="Next image"
        >
          <FiChevronRight />
        </button>

        <div className="ap-slider-dots">
          {images.map((_, index) => (
            <button
              key={index}
              className={`ap-slider-dot ${index === currentIndex ? "active" : ""}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <div className="ap-slider-progress">
          <div
            className="ap-slider-progress-bar"
            style={{
              animation: isAutoPlaying ? "slideProgress 4s linear infinite" : "none",
            }}
            key={currentIndex}
          />
        </div>
      </div>

      <div className="ap-image-overlay">
        <FaShoppingCart />
      </div>

      <div className="ap-image-decoration"></div>
    </div>
  );
};

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
      className={`ap-back-to-top ${isVisible ? "visible" : ""}`}
      onClick={scrollToTop}
      aria-label="Back to top"
    >
      <FiArrowUp />
    </button>
  );
};

// ============ STAT CARD COMPONENT ============
const StatCard = ({ stat }) => {
  const IconComponent = stat.icon;
  return (
    <div className="ap-stat-card">
      <div className="ap-stat-icon">
        <IconComponent />
      </div>
      <h3 className="ap-stat-number">{stat.number}</h3>
      <p className="ap-stat-label">{stat.label}</p>
    </div>
  );
};

// ============ VALUE CARD COMPONENT ============
const ValueCard = ({ value }) => {
  const IconComponent = value.icon;
  return (
    <div className="ap-value-card">
      <div
        className="ap-value-icon"
        style={{ backgroundColor: `${value.color}15`, color: value.color }}
      >
        <IconComponent />
      </div>
      <h3 className="ap-value-title">{value.title}</h3>
      <p className="ap-value-description">{value.description}</p>
    </div>
  );
};

// ============ FEATURE CARD COMPONENT ============
const FeatureCard = ({ feature }) => {
  const IconComponent = feature.icon;
  return (
    <div className="ap-feature-card">
      <div className="ap-feature-icon">
        <IconComponent />
      </div>
      <h4 className="ap-feature-title">{feature.title}</h4>
      <p className="ap-feature-description">{feature.description}</p>
    </div>
  );
};

// ============ TEAM MEMBER COMPONENT (IMPROVED) ============
const TeamMember = ({ member }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div className="ap-team-member">
      <div className="ap-member-avatar">
        {member.image && !imageError ? (
          <>
            {!imageLoaded && (
              <div className="ap-member-avatar-placeholder">
                <span className="ap-member-initial">{member.initial}</span>
              </div>
            )}
            <img
              src={member.image}
              alt={member.name}
              className={`ap-member-image ${imageLoaded ? "loaded" : ""}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </>
        ) : (
          <span className="ap-member-initial">{member.initial}</span>
        )}
        <div className="ap-member-avatar-ring"></div>
      </div>
      <h4 className="ap-member-name">{member.name}</h4>
      <p className="ap-member-role">{member.role}</p>
    </div>
  );
};

// ============ COLLAPSIBLE QUOTE COMPONENT ============
const CollapsibleQuote = ({ quote }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={`ap-quote-collapsible ${isExpanded ? "expanded" : "collapsed"}`}>
      <button 
        className="ap-quote-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? "Collapse quote" : "Expand quote"}
      >
        <div className="ap-quote-toggle-content">
          <FaQuoteLeft className="ap-quote-icon-small" />
          <span className="ap-quote-toggle-text">
            {isExpanded ? "Our Philosophy" : "Read Our Philosophy"}
          </span>
        </div>
        <div className={`ap-quote-toggle-arrow ${isExpanded ? "rotated" : ""}`}>
          <FiChevronDown />
        </div>
      </button>
      
      <div className="ap-quote-content-wrapper">
        <div className="ap-quote-content">
          <FaQuoteLeft className="ap-quote-icon" />
          <blockquote className="ap-quote-text">
            {quote}
          </blockquote>
          <div className="ap-quote-author">
            <span className="ap-author-name">— ChiamoOrder Team</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ MAIN COMPONENT ============
export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="ap-page">
      {/* ===== HEADER ===== */}
      <header className="ap-header">
        <div className="ap-header-container">
          <div className="ap-header-left">
            <button className="ap-back-btn" onClick={() => navigate(-1)}>
              <FiChevronLeft />
              <span>Back</span>
            </button>
            <div className="ap-breadcrumb">
              <FiHome />
              <span>/</span>
              <span className="ap-breadcrumb-current">About Us</span>
            </div>
          </div>

          <div className="ap-header-right">
            <button className="ap-home-btn" onClick={() => navigate("/")}>
              <FiHome />
              <span>Home</span>
            </button>
          </div>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="ap-hero">
        <div className="ap-hero-background">
          <div className="ap-hero-pattern"></div>
        </div>

        <div className="ap-hero-content">
          <div className="ap-hero-badge">
            <HiOutlineSparkles />
            <span>Established {COMPANY_INFO.founded}</span>
          </div>

          <h1 className="ap-hero-title">
            About <span>{COMPANY_INFO.name}</span>
          </h1>

          <p className="ap-hero-description">
            Transforming the way businesses order and deliver products through 
            innovative digital solutions.
          </p>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="ap-stats-section">
        <div className="ap-stats-container">
          {STATS.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </div>
      </section>

      {/* ===== ABOUT SECTION WITH IMAGE SLIDER ===== */}
      <section className="ap-about-section">
        <div className="ap-about-container">
          <div className="ap-about-image">
            <ImageSlider images={SLIDER_IMAGES} />
          </div>

          <div className="ap-about-content">
            <div className="ap-section-label">Who We Are</div>
            <h2 className="ap-section-title">
              {COMPANY_INFO.tagline}
            </h2>
            <p className="ap-about-text">{COMPANY_INFO.description}</p>
            <p className="ap-about-text">
              We believe in empowering our clients with simplicity, speed, and
              reliability. From beverage distribution to retail management,
              ChiamoOrder bridges the gap between demand and delivery — helping
              businesses grow efficiently.
            </p>

            <div className="ap-about-highlights">
              <div className="ap-highlight">
                <FiCheck className="ap-highlight-icon" />
                <span>Real-time order tracking</span>
              </div>
              <div className="ap-highlight">
                <FiCheck className="ap-highlight-icon" />
                <span>Seamless transactions</span>
              </div>
              <div className="ap-highlight">
                <FiCheck className="ap-highlight-icon" />
                <span>Fast deliveries</span>
              </div>
              <div className="ap-highlight">
                <FiCheck className="ap-highlight-icon" />
                <span>Complete transparency</span>
              </div>
            </div>

            <button className="ap-learn-more-btn" onClick={() => navigate("/contact-us")}>
              Get In Touch
              <FiArrowRight />
            </button>
          </div>
        </div>
      </section>

      {/* ===== MISSION & VISION ===== */}
      <section className="ap-mv-section">
        <div className="ap-mv-container">
          <div className="ap-mv-card mission">
            <div className="ap-mv-icon">
              <FiTarget />
            </div>
            <h3>Our Mission</h3>
            <p>{COMPANY_INFO.mission}</p>
          </div>

          <div className="ap-mv-card vision">
            <div className="ap-mv-icon">
              <FiEye />
            </div>
            <h3>Our Vision</h3>
            <p>{COMPANY_INFO.vision}</p>
          </div>
        </div>
      </section>

      {/* ===== VALUES SECTION ===== */}
      <section className="ap-values-section">
        <div className="ap-values-container">
          <div className="ap-section-header centered">
            <div className="ap-section-label">What Drives Us</div>
            <h2 className="ap-section-title">Our Core Values</h2>
            <p className="ap-section-subtitle">
              The principles that guide everything we do at ChiamoOrder.
            </p>
          </div>

          <div className="ap-values-grid">
            {VALUES.map((value, index) => (
              <ValueCard key={index} value={value} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="ap-why-section">
        <div className="ap-why-container">
          <div className="ap-section-header centered">
            <div className="ap-section-label">Why ChiamoOrder</div>
            <h2 className="ap-section-title">Why Choose Us?</h2>
            <p className="ap-section-subtitle">
              Discover what makes ChiamoOrder the preferred choice for businesses.
            </p>
          </div>

          <div className="ap-features-grid">
            {WHY_CHOOSE_US.map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== COLLAPSIBLE QUOTE SECTION ===== */}
      <section className="ap-quote-section">
        <div className="ap-quote-container">
          <CollapsibleQuote quote={COMPANY_INFO.quote} />
        </div>
      </section>

      {/* ===== TIMELINE SECTION ===== */}
      <section className="ap-timeline-section">
        <div className="ap-timeline-container">
          <div className="ap-section-header centered">
            <div className="ap-section-label">Our Journey</div>
            <h2 className="ap-section-title">Key Milestones</h2>
          </div>

          <div className="ap-timeline">
            {MILESTONES.map((milestone, index) => (
              <div key={index} className="ap-timeline-item">
                <div className="ap-timeline-marker">
                  <div className="ap-timeline-dot"></div>
                  {index < MILESTONES.length - 1 && <div className="ap-timeline-line"></div>}
                </div>
                <div className="ap-timeline-content">
                  <span className="ap-timeline-year">{milestone.year}</span>
                  <h4 className="ap-timeline-title">{milestone.title}</h4>
                  <p className="ap-timeline-description">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TEAM SECTION ===== */}
      <section className="ap-team-section">
        <div className="ap-team-container">
          <div className="ap-section-header centered">
            <div className="ap-section-label">The People Behind</div>
            <h2 className="ap-section-title">Meet Our Team</h2>
            <p className="ap-section-subtitle">
              Dedicated professionals committed to your success.
            </p>
          </div>

          <div className="ap-team-grid">
            {TEAM.map((member, index) => (
              <TeamMember key={index} member={member} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="ap-cta-section">
        <div className="ap-cta-container">
          <div className="ap-cta-content">
            <h2>Ready to Transform Your Business?</h2>
            <p>
              Join thousands of businesses already using ChiamoOrder to streamline 
              their ordering process.
            </p>
          </div>
          <div className="ap-cta-buttons">
            <button className="ap-cta-btn primary" onClick={() => navigate("/signup")}>
              <FaRocket />
              Get Started Free
            </button>
            <button className="ap-cta-btn secondary" onClick={() => navigate("/contact-us")}>
              Contact Us
              <FiArrowRight />
            </button>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="ap-footer">
        <div className="ap-footer-container">
          <div className="ap-footer-left">
            <p>© {new Date().getFullYear()} {COMPANY_INFO.name}. All rights reserved.</p>
          </div>
          <div className="ap-footer-right">
            <button onClick={() => navigate("/")}>Home</button>
            <button onClick={() => navigate("/privacy-policy")}>Privacy Policy</button>
            <button onClick={() => navigate("/contact-us")}>Contact Us</button>
          </div>
        </div>
      </footer>

      {/* Back to Top */}
      <BackToTop />
    </div>
  );
}