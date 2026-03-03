import { FiShoppingCart } from "react-icons/fi";
import { Link } from "react-router-dom";

export default function PromoBanner() {
  return (
    <section className="promo-banner">
      <div className="promo-content">
        <h2>50% Off First Order!</h2>
        <p>Get amazing deals on your favorite products</p>

        <Link to="/all-products">
          <button className="shop-now-btn">
            <FiShoppingCart size={20} className="btn-icon" />
            Shop Now
          </button>
        </Link>
      </div>
    </section>
  );
}
