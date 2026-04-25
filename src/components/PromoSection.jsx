// src/components/PromoSection.jsx
import React, { useState, useEffect, useRef } from "react";
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

const IK = "https://ik.imagekit.io/ljwnlcbqyu";

// ── Promo Deals Data ──────────────────────
const PROMO_DEALS = [
  {
    id: 1,
    Icon: FaSpa,
    tag: "BUY 25 GET 1 FREE",
    title: "Jelly Promo",
    description:
      "Buy any 25 cartons of our premium jelly and get 1 FREE carton of the same jelly!",
    images: [
      `${IK}/beauty/NOVA_JELLY125g-48pcs.png`,
      `${IK}/beauty/CLASSY_JELLY_48PCS-100g.png`,
      `${IK}/beauty/MAMA_S_LOVE_JELLY_48pcs-150g.png`,
      `${IK}/beauty/NOVA_JELLY_450g-12PCS.png`,
    ],
    btnColor: "#7c3aed",
    btnHover: "#6d28d9",
    bgColor: "rgba(124, 58, 237, 0.06)",
    borderColor: "rgba(124, 58, 237, 0.2)",
    iconBg: "rgba(124, 58, 237, 0.12)",
    iconColor: "#7c3aed",
    titleColor: "#6d28d9",
    // Redirect to beauty filtered by jelly search
    shopUrl: "/all-products?category=beauty&search=jelly",
    promoMode: "jelly",
  },
  {
    id: 2,
    Icon: LuCandy,
    tag: "BUY 25 GET 1 FREE",
    title: "Power Mint Promo",
    description:
      "Buy 25 cartons of Power Mint and receive 1 FREE carton added automatically!",
    images: [
      `${IK}/food/Food23-sweet.png?updatedAt=1771851133865`,
      `${IK}/food/Food23-sweet.png?updatedAt=1771851133865`,
      `${IK}/food/Food23-sweet.png?updatedAt=1771851133865`,
      `${IK}/food/Food23-sweet.png?updatedAt=1771851133865`,
    ],
    btnColor: "#d4a017",
    btnHover: "#b8880f",
    btnTextColor: "#000000",
    bgColor: "rgba(212, 160, 23, 0.07)",
    borderColor: "rgba(212, 160, 23, 0.25)",
    iconBg: "rgba(212, 160, 23, 0.15)",
    iconColor: "#d4a017",
    titleColor: "#9a7010",
    shopUrl: "/all-products?category=food&search=power+mint",
    promoMode: "powermint",
  },
  {
    id: 3,
    Icon: FaWineGlassAlt,
    tag: "500 PACKS = 5% FREE",
    title: "Beverage Bonus",
    description:
      "Order 500 packs of any beverage and get 5% FREE stock to choose from!",
    images: [
      `${IK}/beverages/Bev4.png`,
      `${IK}/beverages/Bev8.png`,
      `${IK}/beverages/Bev1.png`,
      `${IK}/beverages/Bev15.png`,
    ],
    btnColor: "#8b0000",
    btnHover: "#6b0000",
    bgColor: "rgba(139, 0, 0, 0.05)",
    borderColor: "rgba(139, 0, 0, 0.2)",
    iconBg: "rgba(139, 0, 0, 0.1)",
    iconColor: "#8b0000",
    titleColor: "#6b0000",
    shopUrl: "/all-products?category=beverage&promo=beverage_500",
    promoMode: "beverage",
  },
  {
    id: 4,
    Icon: FaPumpSoap,
    tag: "300 UNITS = 3% FREE",
    title: "Care Products Deal",
    description:
      "Purchase 300 units of any care products and get 3% FREE to select from our care range!",
    images: [
      `${IK}/care/care10.png`,
      `${IK}/care/TOO_CLEAN_CLASSIC_180g.png`,
      `${IK}/care/MAMA_JOY_140g.png`,
      `${IK}/care/MAMA_JOY_ORANGE_85g.png`,
    ],
    btnColor: "#064e3b",
    btnHover: "#022c22",
    bgColor: "rgba(6, 78, 59, 0.05)",
    borderColor: "rgba(6, 78, 59, 0.2)",
    iconBg: "rgba(6, 78, 59, 0.1)",
    iconColor: "#064e3b",
    titleColor: "#065f46",
    shopUrl: "/all-products?category=care&promo=care_300",
    promoMode: "care",
  },
];

// ── Auto Sliding Images ───────────────────
const SlidingImages = ({ images, color }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState("right");
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setDirection("right");
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 1800);
    return () => clearInterval(intervalRef.current);
  }, [images.length]);

  return (
    <div className="ps-images-row">
      {images.map((src, i) => (
        <div
          key={i}
          className={`ps-img-item ${
            i === currentIndex ? "ps-img-active" : ""
          } ${
            i === (currentIndex - 1 + images.length) % images.length
              ? "ps-img-prev"
              : ""
          }`}
        >
          <img src={src} alt={`promo-product-${i}`} />
        </div>
      ))}
    </div>
  );
};

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

      {/* ✅ Sliding Images — no border, no white bg */}
      <SlidingImages
        images={deal.images}
        color={deal.btnColor}
      />

      {/* CTA */}
      <button
        className="ps-card-btn"
        style={{
          background: deal.btnColor,
          color: deal.btnTextColor || "#ffffff",
        }}
        onClick={() => navigate(deal.shopUrl)}
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