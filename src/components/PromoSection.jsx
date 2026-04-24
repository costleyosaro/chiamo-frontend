// src/components/PromoSection.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { FiGift, FiChevronRight, FiShoppingCart } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi";
import { imageUrl } from "../utils/image";
import "./PromoSection.css";

// ── Promo Items Data ──────────────────────
const PROMO_DEALS = [
  {
    id: 1,
    emoji: "🍯",
    tag: "BUY 25 GET 1 FREE",
    title: "Jelly Promo",
    description:
      "Buy any 25 cartons of our premium jelly products and get 1 FREE carton!",
    products: [
      {
        name: "NOVA JELLY 125g*48",
        image:
          "https://ik.imagekit.io/ljwnlcbqyu/beauty/NOVA_JELLY125g-48pcs.png",
        price: 30000,
      },
      {
        name: "CLASSY JELLY 100g*48",
        image:
          "https://ik.imagekit.io/ljwnlcbqyu/beauty/CLASSY_JELLY_48PCS-100g.png",
        price: 30000,
      },
      {
        name: "MAMA'S LOVE JELLY 150g*48",
        image:
          "https://ik.imagekit.io/ljwnlcbqyu/beauty/MAMA_S_LOVE_JELLY_48pcs-150g.png",
        price: 33000,
      },
    ],
    color: "#f5a623",
    bgColor: "rgba(245,166,35,0.08)",
    borderColor: "rgba(245,166,35,0.25)",
    category: "beauty",
  },
  {
    id: 2,
    emoji: "🌿",
    tag: "BUY 25 GET 1 FREE",
    title: "Power Mint Promo",
    description:
      "Stock up on Power Mint! Buy 25 cartons and receive 1 FREE carton automatically.",
    products: [
      {
        name: "POWER MINT",
        image:
          "https://ik.imagekit.io/ljwnlcbqyu/food/POWER-MINT.JPG",
        price: 11700,
      },
    ],
    color: "#10b981",
    bgColor: "rgba(16,185,129,0.08)",
    borderColor: "rgba(16,185,129,0.25)",
    category: "food",
  },
  {
    id: 3,
    emoji: "🥤",
    tag: "500 PACKS = 5% FREE",
    title: "Beverage Bonus",
    description:
      "Order 500 packs of any beverage products and get 5% FREE stock to choose from!",
    products: [],
    color: "#143a6e",
    bgColor: "rgba(20,58,110,0.06)",
    borderColor: "rgba(20,58,110,0.2)",
    category: "beverage",
  },
  {
    id: 4,
    emoji: "🧴",
    tag: "300 UNITS = 3% FREE",
    title: "Care Products Deal",
    description:
      "Purchase 300 units of any care products and get 3% FREE to select from our care range!",
    products: [],
    color: "#8b5cf6",
    bgColor: "rgba(139,92,246,0.06)",
    borderColor: "rgba(139,92,246,0.2)",
    category: "care",
  },
];

// ── Promo Card ─────────────────────────────
const PromoCard = ({ deal }) => {
  const navigate = useNavigate();

  return (
    <div
      className="ps-card"
      style={{
        background: deal.bgColor,
        borderColor: deal.borderColor,
      }}
    >
      {/* Tag */}
      <div
        className="ps-card-tag"
        style={{ background: deal.color }}
      >
        {deal.tag}
      </div>

      {/* Header */}
      <div className="ps-card-header">
        <span className="ps-card-emoji">{deal.emoji}</span>
        <h3
          className="ps-card-title"
          style={{ color: deal.color }}
        >
          {deal.title}
        </h3>
      </div>

      {/* Description */}
      <p className="ps-card-desc">{deal.description}</p>

      {/* Product Previews */}
      {deal.products.length > 0 && (
        <div className="ps-card-products">
          {deal.products.slice(0, 3).map((p, i) => (
            <div key={i} className="ps-card-product-img">
              <img src={p.image} alt={p.name} />
            </div>
          ))}
          {deal.products.length > 3 && (
            <div className="ps-card-product-more">
              +{deal.products.length - 3}
            </div>
          )}
        </div>
      )}

      {/* CTA */}
      <button
        className="ps-card-btn"
        style={{ background: deal.color }}
        onClick={() =>
          navigate(`/all-products?category=${deal.category}`)
        }
      >
        <FiShoppingCart size={13} />
        Shop Now
        <FiChevronRight size={13} />
      </button>

      {/* Expiry */}
      <p className="ps-card-expiry">
        🗓️ Active until June 14, 2025
      </p>
    </div>
  );
};

// ── Main Promo Section ─────────────────────
const PromoSection = () => {
  const navigate = useNavigate();

  return (
    <section className="ps-section">
      {/* Header */}
      <div className="hp-section-header">
        <div className="ps-title-wrap">
          <div className="ps-title-icon">
            <FiGift />
          </div>
          <div>
            <h2 className="hp-section-title">Active Promos</h2>
            <p className="ps-subtitle">
              Add to cart & unlock rewards automatically!
            </p>
          </div>
        </div>
        <HiOutlineSparkles className="ps-sparkle" />
      </div>

      {/* Promo Cards Scroll */}
      <div className="ps-scroll">
        {PROMO_DEALS.map((deal) => (
          <PromoCard key={deal.id} deal={deal} />
        ))}
      </div>
    </section>
  );
};

export default PromoSection;