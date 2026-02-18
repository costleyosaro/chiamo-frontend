export default function ProductCard({
  image,
  name,
  currentPrice,
  originalPrice,
  discountLabel,
  onAdd,
}) {
  return (
    <div className="product-card">
      {/* Image */}
      <div className="product-image">
        <img src={image} alt={name} className="product-img" loading="lazy" />
      </div>

      {/* Info */}
      <div className="product-info">
        <div className="product-name">{name}</div>

        <div className="price-row">
          <span className="current-price">{currentPrice}</span>
          {originalPrice && (
            <span className="original-price">{originalPrice}</span>
          )}
        </div>
      </div>

      {/* Add to Cart + Discount Badge */}
      <div className="product-footer">
        {discountLabel && (
          <span className="discount-badge">{discountLabel}</span>
        )}
        <button
          className="flash-add-to-cart-btn"
          onClick={onAdd}
          aria-label={`Add ${name} to cart`}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
