export default function OrderCard() {
  return (
    <div className="order-card">
      <div className="order-header">
        <div>
          <div className="order-id">ORD-2024-001</div>
          <div className="order-date">Dec 20, 2024</div>
        </div>
        <div className="order-status">📦 In Transit</div>
      </div>

      <div className="order-details">
        <div>
          <div style={{ fontSize: 12, color: "#666" }}>5 items</div>
          <div className="order-amount">₦8,500</div>
        </div>
        <div className="delivery-info">
          <div style={{ fontSize: 12, color: "#666" }}>Estimated Delivery</div>
          <div className="delivery-date">Dec 22, 2024</div>
        </div>
      </div>

      <div className="progress-section">
        <h4>Order Progress</h4>
        <div className="progress-step">
          <div className="progress-dot completed"></div>
          <span>Order Confirmed</span>
        </div>
        <div className="progress-step">
          <div className="progress-dot completed"></div>
          <span>Processing</span>
        </div>
        <div className="progress-step">
          <div className="progress-dot completed"></div>
          <span>In Transit</span>
        </div>
        <div className="progress-step">
          <div className="progress-dot pending"></div>
          <span>Out for Delivery</span>
        </div>
        <div className="progress-step">
          <div className="progress-dot pending"></div>
          <span>Delivered</span>
        </div>
      </div>

      <button className="track-btn">Track Order</button>
    </div>
  );
}
