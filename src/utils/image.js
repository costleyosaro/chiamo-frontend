// src/utils/image.js
const IMAGEKIT_URL = 'https://ik.imagekit.io/ljwnlcbqyu/';

// ✅ Safe fallback that NEVER 404s (inline SVG)
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

  // Strip leading "/" and/or "assets/"
  const cleaned = val
    .replace(/^\/?assets\//i, '') // /assets/images/... → images/...
    .replace(/^\//, '');          // remove any remaining leading /

  return `${IMAGEKIT_URL}${cleaned}?tr=w-${w},h-${h},fo-auto,q-80`;
};