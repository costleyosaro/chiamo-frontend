// src/utils/imageHelpers.js
export const FALLBACK_IMAGES = {
  food: '/assets/images/food-placeholder.png',
  beverage: '/assets/images/beverage-placeholder.png',
  care: '/assets/images/care-placeholder.png',
  beauty: '/assets/images/beauty-placeholder.png',
  default: '/assets/images/product-placeholder.png'
};

export const getImageWithFallback = (imageUrl, category = 'default') => {
  if (!imageUrl) return FALLBACK_IMAGES[category] || FALLBACK_IMAGES.default;
  
  // If it's already a fallback image, return it
  if (imageUrl.includes('/assets/images/')) return imageUrl;
  
  return imageUrl;
};

export const handleImageError = (e, category = 'default') => {
  e.target.onerror = null; // Prevent infinite loop
  e.target.src = FALLBACK_IMAGES[category] || FALLBACK_IMAGES.default;
};