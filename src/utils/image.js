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

  let val = String(path).trim();

  const mediaMatch = val.match(/\/media\/(https?%3A.+)/i);
  if (mediaMatch) {
    val = decodeURIComponent(mediaMatch[1]);
  }

  val = val.replace(/^(https?):\/([^/])/, '$1://$2');

  if (/^https?:\/\//i.test(val)) return val;

  const cleaned = val
    .replace(/^\/?assets\/images\/categories\//i, '')
    .replace(/^\/?assets\/images\//i, '')
    .replace(/^\/?assets\//i, '')
    .replace(/^\//, '');

  return `${IMAGEKIT_URL}${cleaned}?tr=w-${w},h-${h},fo-auto,q-80`;
};

