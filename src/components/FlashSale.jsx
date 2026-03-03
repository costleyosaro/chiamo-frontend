// src/pages/FlashSale.jsx
import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";
import FlashAnimation from "../assets/animations/flash.json";
import ProductCard from "../components/ProductCard";
import { useCart } from "../pages/CartContext";
import { fetchProducts } from "../services/products";


export default function FlashSale() {
  const { addToCart } = useCart();
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const loadFlashSales = async () => {
      try {
        const products = await fetchProducts();
        // ✅ Filter only flash sale products (backend or frontend flag)
        const flashItems = (products || []).filter(
          (p) => p.flash_sale === true || p.flashSale === true
        );
        setFlashSaleProducts(flashItems);
      } catch (err) {
        console.error("❌ Failed to load flash sale products:", err);
      } finally {
        setTimeout(() => setLoading(false), 2000);
      }
    };
    loadFlashSales();
  }, []);

  const handleAdd = async (product, e) => {
    try {
      const identifier = product.slug ?? product.slug_field ?? product.id;
      if (!identifier) {
        console.error("❌ Missing identifier for product:", product);
        setToastMessage("⚠️ Product cannot be added (missing identifier)");
        setTimeout(() => setToastMessage(""), 3000);
        return;
      }

      await addToCart(identifier, 1, product.name);
      animateToCart(e.target.closest(".product-card"));

      setToastMessage(`✅ Added ${product.name || "item"} to cart successfully!`);
      setTimeout(() => setToastMessage(""), 2000);
    } catch (err) {
      console.error("Add to cart failed:", err);
      setToastMessage("❌ Failed to add to cart. Please try again.");
      setTimeout(() => setToastMessage(""), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flash-loading-screen">
        <Lottie animationData={FlashAnimation} loop={true} />
        <p>Fetching the hottest deals for you...</p>
      </div>
    );
  }

  return (
    <section className="flash-sale-section">
      <div className="flash-sale-header">
        <div className="flash-sale-title">
          <h3 className="flash-section-title">🔥 Flash Sale Deals</h3>
        </div>
        <button className="flash-view-all-btn">View All</button>
      </div>

      <div className="flash-products-grid">
        {flashSaleProducts.length > 0 ? (
          flashSaleProducts.map((p) => {
            const price = Number(p.price);
            const oldPrice = p.old_price || Math.round(price * 1.2);
            const discountLabel =
              oldPrice && oldPrice > price
                ? `${Math.round(((oldPrice - price) / oldPrice) * 100)}% OFF`
                : null;

            return (
              <ProductCard
                key={p.id}
                image={
                  p.image_url?.startsWith("http")
                    ? p.image_url
                    : `/assets/images/${p.image_url}`
                }
                name={p.name}
                currentPrice={`₦${price.toLocaleString()}`}
                originalPrice={oldPrice ? `₦${oldPrice.toLocaleString()}` : null}
                discountLabel={discountLabel}
                onAdd={(e) => handleAdd(p, e)}
              />
            );
          })
        ) : (
          <p className="no-products">No flash sale products available right now.</p>
        )}
      </div>

      {toastMessage && <div className="toast-message">{toastMessage}</div>}
    </section>
  );
}

/* ✨ Cart animation identical to before */
function animateToCart(cardEl) {
  const img = cardEl?.querySelector("img");
  if (!img) return;

  const cartIcon =
    document.querySelector('[data-role="cart-icon"]') ||
    document.querySelector('[data-role="top-cart-icon"]');

  if (!cartIcon) return;

  const imgRect = img.getBoundingClientRect();
  const cartRect = cartIcon.getBoundingClientRect();

  const flyingImg = img.cloneNode(true);
  flyingImg.className = "flying-img";
  flyingImg.style.position = "fixed";
  flyingImg.style.left = `${imgRect.left}px`;
  flyingImg.style.top = `${imgRect.top}px`;
  flyingImg.style.width = `${imgRect.width}px`;
  flyingImg.style.height = `${imgRect.height}px`;
  flyingImg.style.transition = "all 0.7s cubic-bezier(0.45, -0.12, 0.55, 1.1)";
  flyingImg.style.zIndex = "9999";
  flyingImg.style.borderRadius = "8px";
  flyingImg.style.pointerEvents = "none";
  document.body.appendChild(flyingImg);

  requestAnimationFrame(() => {
    flyingImg.style.left = `${cartRect.left + cartRect.width / 2 - 15}px`;
    flyingImg.style.top = `${cartRect.top + cartRect.height / 2 - 15}px`;
    flyingImg.style.width = "30px";
    flyingImg.style.height = "30px";
    flyingImg.style.opacity = "0.6";
  });

  flyingImg.addEventListener("transitionend", () => flyingImg.remove());
}
