// src/components/PromoSection.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FiGift,
  FiChevronRight,
  FiShoppingCart,
  FiCalendar,
} from "react-icons/fi";
import {
  FaSpa,
  FaWineGlassAlt,
  FaPumpSoap,
} from "react-icons/fa";
import { LuCandy } from "react-icons/lu";
import { HiOutlineSparkles } from "react-icons/hi";
import "./PromoSection.css";

// ── Promo Deals Data ──────────────────────
const PROMO_DEALS = [
  {
    id: 1,
    Icon: FaSpa,
    tag: "BUY 25 GET 1 FREE",
    title: "Jelly Promo",
    description:
      "Buy any 25 cartons of our premium jelly products and get 1 FREE carton of that same jelly!",
    products: [
      {
        name: "NOVA JELLY 125g*48",
        image:
          "https://ik.imagekit.io/ljwnlcbqyu/beauty/NOVA_JELLY125g-48pcs.png",
      },
      {
        name: "CLASSY JELLY 100g*48",
        image:
          "https://ik.imagekit.io/ljwnlcbqyu/beauty/CLASSY_JELLY_48PCS-100g.png",
      },
      {
        name: "MAMA'S LOVE JELLY 150g*48",
        image:
          "https://ik.imagekit.io/ljwnlcbqyu/beauty/MAMA_S_LOVE_JELLY_48pcs-150g.png",
      },
    ],
    btnColor: "#7c3aed",
    btnHover: "#6d28d9",
    bgColor: "rgba(124, 58, 237, 0.06)",
    borderColor: "rgba(124, 58, 237, 0.2)",
    iconBg: "rgba(124, 58, 237, 0.12)",
    iconColor: "#7c3aed",
    titleColor: "#6d28d9",
    category: "beauty",
  },
  {
    id: 2,
    Icon: LuCandy,
    tag: "BUY 25 GET 1 FREE",
    title: "Power Mint Promo",
    description:
      "Stock up on Power Mint! Buy 25 cartons and receive 1 FREE carton added automatically.",
    products: [
      {
        name: "POWER MINT",
        image:
          "https://ik.imagekit.io/ljwnlcbqyu/food/Food23-sweet.png?updatedAt=1771851133865",
      },
    ],
    btnColor: "#d4a017",
    btnHover: "#b8880f",
    btnTextColor: "#000000",
    bgColor: "rgba(212, 160, 23, 0.07)",
    borderColor: "rgba(212, 160, 23, 0.25)",
    iconBg: "rgba(212, 160, 23, 0.15)",
    iconColor: "#d4a017",
    titleColor: "#9a7010",
    category: "food",
  },
  {
    id: 3,
    Icon: FaWineGlassAlt,
    tag: "500 PACKS = 5% FREE",
    title: "Beverage Bonus",
    description:
      "Order 500 packs of any beverage products and get 5% FREE stock to choose from our range!",
    products: [],
    btnColor: "#dc2626",
    btnHover: "#b91c1c",
    bgColor: "rgba(220, 38, 38, 0.05)",
    borderColor: "rgba(220, 38, 38, 0.2)",
    iconBg: "rgba(220, 38, 38, 0.1)",
    iconColor: "#dc2626",
    titleColor: "#b91c1c",
    category: "beverage",
  },
  {
    id: 4,
    Icon: FaPumpSoap,
    tag: "300 UNITS = 3% FREE",
    title: "Care Products Deal",
    description:
      "Purchase 300 units of any care products and get 3% FREE to select from our care range!",
    products: [],
    btnColor: "#047857",
    btnHover: "#065f46",
    bgColor: "rgba(4, 120, 87, 0.05)",
    borderColor: "rgba(4, 120, 87, 0.2)",
    iconBg: "rgba(4, 120, 87, 0.1)",
    iconColor: "#047857",
    titleColor: "#065f46",
    category: "care",
  },
];

// ── Promo Card ─────────────────────────────
const PromoCard = ({ deal }) => {
  const navigate = useNavigate();
  const IconComp = deal.Icon;

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
        style={{ background: deal.btnColor }}
      >
        {deal.tag}
      </div>

      {/* Header — icon + title */}
      <div className="ps-card-header">
        <div
          className="ps-card-icon"
          style={{
            background: deal.iconBg,
            color: deal.iconColor,
          }}
        >
          <IconComp />
        </div>
        <h3
          className="ps-card-title"
          style={{ color: deal.titleColor }}
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
        style={{
          background: deal.btnColor,
          color: deal.btnTextColor || "#ffffff",
        }}
        onClick={() =>
          navigate(`/all-products?category=${deal.category}`)
        }
      >
        <FiShoppingCart size={14} />
        Shop Now
        <FiChevronRight size={14} />
      </button>

      {/* Expiry */}
      <div className="ps-card-expiry">
        <FiCalendar className="ps-card-expiry-icon" />
        <span>
          Active until <strong>July 14, 2025</strong>
        </span>
      </div>
    </div>
  );
};

// ── Main Section ───────────────────────────
const PromoSection = () => {
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