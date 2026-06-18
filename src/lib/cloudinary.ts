import { v2 as cloudinary } from "cloudinary";

// The SDK auto-reads CLOUDINARY_URL if present. Otherwise fall back to the
// individual variables. Set whichever you prefer in .env / Vercel.
if (!process.env.CLOUDINARY_URL && process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
} else {
  cloudinary.config({ secure: true });
}

export const cloudinaryConfigured = () =>
  !!(process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD_NAME);

export { cloudinary };
