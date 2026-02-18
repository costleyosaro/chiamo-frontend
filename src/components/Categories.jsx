import { Link } from "react-router-dom";
import Lottie from "lottie-react";
import cartAnimation from "../assets/animations/cart.json";
import { LuCandy } from "react-icons/lu";
import { FaWineGlassAlt, FaPumpSoap, FaSpa } from "react-icons/fa";

export default function Categories() {
  return (
    <section>
      <div className="section-header">
        <h3 className="section-title">Shop by Category</h3>
        <Lottie animationData={cartAnimation} loop className="cart-animation" />
      </div>

      <div className="categories-grid">
        <Link to="/all-products?category=food" className="category-item">
          <div className="category-icon">
            <img
              src="/assets/images/categories/food/FOOD-CATEGORY-PHOTO.png"
              alt="Food"
              className="category-img"
            />
          </div>
          <hr className="category-divider" />
          <div className="category-name">
            <LuCandy className="category-icon-small" /> Food
          </div>
        </Link>

        <Link to="/all-products?category=beverage" className="category-item">
          <div className="category-icon">
            <img
              src="/assets/images/categories/beverages/BEVERAGE-CATEGORY-PHOTO.png"
              alt="Beverage"
              className="category-img"
            />
          </div>
          <hr className="category-divider" />
          <div className="category-name">
            <FaWineGlassAlt className="category-icon-small" /> Beverage
          </div>
        </Link>

        <Link to="/all-products?category=ZIZOU" className="category-item">
          <div className="category-icon">
            <img
              src="/assets/images/categories/zizou/zizou-orange.jpeg"
              alt="Zizou"
              className="category-img"
            />
          </div>
          <hr className="category-divider" />
          <div className="category-name">
            <FaWineGlassAlt className="category-icon-small" /> Zizou
          </div>
        </Link>

        <Link to="/all-products?category=care" className="category-item">
          <div className="category-icon">
            <img
              src="/assets/images/categories/care/CARE-CATEGORY-PHOTO1.png"
              alt="Care"
              className="category-img"
            />
          </div>
          <hr className="category-divider" />
          <div className="category-name">
            <FaPumpSoap className="category-icon-small" /> Care
          </div>
        </Link>

        <Link to="/all-products?category=beauty" className="category-item">
          <div className="category-icon">
            <img
              src="/assets/images/categories/beauty/CLASSY_JELLY_48PCS-100g.png"
              alt="Beauty"
              className="category-img"
            />
          </div>
          <hr className="category-divider" />
          <div className="category-name">
            <FaSpa className="category-icon-small" /> Beauty
          </div>
        </Link>
      </div>
    </section>
  );
}
