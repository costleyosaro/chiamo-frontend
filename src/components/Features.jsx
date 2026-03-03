import Lottie from "lottie-react";
import SmartListAnimation from "../assets/animations/smart-list.json";
import SubscriptionsAnimation from "../assets/animations/subscriptions.json";
import { useNavigate } from "react-router-dom";

export default function Features() {
  const navigate = useNavigate();

  return (
    <section className="features-grid">
      <div className="feature-card" onClick={() => navigate("/cart-page")}>
        <Lottie animationData={SmartListAnimation} loop autoplay />
        <div className="feature-title">Smart Lists</div>
        <div className="feature-subtitle">Reorder favorites</div>
      </div>

      <div className="feature-card" onClick={() => navigate("/all-products")}>
        <Lottie animationData={SubscriptionsAnimation} loop autoplay />
        <div className="feature-title">Subscriptions</div>
        <div className="feature-subtitle">Never run out</div>
      </div>
    </section>
  );
}
