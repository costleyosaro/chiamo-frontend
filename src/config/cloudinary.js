// Your Cloudinary cloud name
const CLOUD_NAME = "djq2ywwry";  // Replace with your actual cloud name

// Base URL for all images
export const CLOUDINARY_BASE = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

// Helper function
export const getImageUrl = (path) => {
  return `${CLOUDINARY_BASE}/chiamoorder/${path}`;
};