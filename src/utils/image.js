// src/utils/image.js

const IMAGEKIT_URL = 'https://ik.imagekit.io/ljwnlcbqyu/';

export const PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">' +
      '<rect width="100%" height="100%" fill="#f0f0f0"/>' +
      '<text x="50%" y="50%" text-anchor="middle" dy=".3em" ' +
      'fill="#999" font-family="sans-serif" font-size="14">No Image</text>' +
    '</svg>'
  );

export const imageUrl = (path, w = 400, h = 400) => {
  if (!path) return PLACEHOLDER;

  const val = String(path).trim();

  // Already a full URL — return as-is
  if (/^https?:\/\//i.test(val)) return val;

  // Strip ALL prefix variations to get just "folder/filename"
  // Input examples:
  //   "assets/images/categories/beverages/Bev12.png"  → "beverages/Bev12.png"
  //   "/assets/images/categories/food/x.png"           → "food/x.png"
  //   "assets/images/placeholder.png"                   → "placeholder.png"
  //   "beverages/Bev12.png"                             → "beverages/Bev12.png"
  const cleaned = val
    .replace(/^\/?assets\/images\/categories\//i, '')
    .replace(/^\/?assets\/images\//i, '')
    .replace(/^\/?assets\//i, '')
    .replace(/^\//, '');

    console.log('[imageUrl]', path, '→', finalUrl);

  return `${IMAGEKIT_URL}${cleaned}?tr=w-${w},h-${h},fo-auto,q-80`;
};