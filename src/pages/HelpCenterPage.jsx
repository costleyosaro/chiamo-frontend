// src/pages/HelpCenterPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiChevronLeft, FiSearch, FiChevronRight, FiChevronDown,
  FiShoppingCart, FiTruck, FiCreditCard, FiUser, FiSettings, FiMessageCircle
} from "react-icons/fi";
import "./HelpCenterPage.css";

const HELP_CATEGORIES = [
  {
    id: "orders",
    icon: FiShoppingCart,
    title: "Orders & Cart",
    description: "Help with placing, tracking, and managing orders",
    articles: [
      { title: "How to place an order", content: "To place an order, browse our products, add items to your cart, and proceed to checkout. You can pay using various methods including cards, bank transfer, or cash on delivery." },
      { title: "How to track my order", content: "Go to 'My Orders' in your account. Click on any order to see real-time tracking information including current status and estimated delivery time." },
      { title: "How to cancel an order", content: "Orders can be cancelled before they are shipped. Go to 'My Orders', select the order, and click 'Cancel Order'. If already shipped, please contact support." },
      { title: "How to modify my order", content: "Orders can only be modified before processing begins. Contact our support team immediately if you need to make changes." }
    ]
  },
  {
    id: "delivery",
    icon: FiTruck,
    title: "Delivery",
    description: "Shipping, delivery times, and tracking",
    articles: [
      { title: "Delivery times and zones", content: "We deliver within Port Harcourt in 2-4 hours. Other areas in Rivers State take 1-2 business days. Nationwide delivery takes 3-5 business days." },
      { title: "Delivery fees", content: "Delivery is free for orders above ₦10,000 within Port Harcourt. Standard delivery fee is ₦1,500 for orders below this amount." },
      { title: "What if I'm not available for delivery", content: "Our delivery agent will call you. If unreachable, we'll attempt redelivery the next day. After 3 failed attempts, the order will be returned." }
    ]
  },
  {
    id: "payments",
    icon: FiCreditCard,
    title: "Payments",
    description: "Payment methods, refunds, and billing",
    articles: [
      { title: "Accepted payment methods", content: "We accept debit/credit cards (Visa, Mastercard), bank transfers, USSD payments, and cash on delivery." },
      { title: "How to request a refund", content: "Refunds can be requested within 24 hours of delivery for damaged or incorrect items. Go to your order and click 'Request Refund' or contact support." },
      { title: "Payment security", content: "All payments are processed through secure, PCI-DSS compliant payment gateways. We never store your full card details." }
    ]
  },
  {
    id: "account",
    icon: FiUser,
    title: "Account",
    description: "Account settings, profile, and security",
    articles: [
      { title: "How to create an account", content: "Click 'Sign Up', enter your email or phone number, create a password, and verify your account through the link sent to you." },
      { title: "How to reset my password", content: "Click 'Forgot Password' on the login page, enter your email, and follow the reset link sent to your inbox." },
      { title: "How to update my profile", content: "Go to Settings > Profile. You can update your name, phone number, delivery address, and other details." }
    ]
  }
];

export default function HelpCenterPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedArticle, setExpandedArticle] = useState(null);

  const filteredCategories = HELP_CATEGORIES.filter(cat =>
    cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.articles.some(art => art.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="help-center-page">
      <header className="help-header">
        <button className="help-back-btn" onClick={() => navigate(-1)}>
          <FiChevronLeft />
        </button>
        <h1>Help Center</h1>
      </header>

      <div className="help-search-section">
        <h2>How can we help you?</h2>
        <div className="help-search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {!selectedCategory ? (
        <div className="help-categories">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="help-category-card"
              onClick={() => setSelectedCategory(category)}
            >
              <div className="category-icon">
                <category.icon />
              </div>
              <div className="category-info">
                <h3>{category.title}</h3>
                <p>{category.description}</p>
              </div>
              <FiChevronRight className="category-arrow" />
            </div>
          ))}
        </div>
      ) : (
        <div className="help-articles">
          <button 
            className="back-to-categories"
            onClick={() => {
              setSelectedCategory(null);
              setExpandedArticle(null);
            }}
          >
            <FiChevronLeft /> Back to categories
          </button>
          
          <h3>{selectedCategory.title}</h3>
          
          <div className="articles-list">
            {selectedCategory.articles.map((article, index) => (
              <div 
                key={index} 
                className={`article-item ${expandedArticle === index ? 'expanded' : ''}`}
              >
                <button
                  className="article-header"
                  onClick={() => setExpandedArticle(expandedArticle === index ? null : index)}
                >
                  <span>{article.title}</span>
                  <FiChevronDown className={`article-arrow ${expandedArticle === index ? 'rotated' : ''}`} />
                </button>
                {expandedArticle === index && (
                  <div className="article-content">
                    <p>{article.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="help-contact-cta">
        <FiMessageCircle />
        <div>
          <h4>Still need help?</h4>
          <p>Contact our support team</p>
        </div>
        <button onClick={() => navigate("/contact-us")}>
          Contact Us
        </button>
      </div>
    </div>
  );
}