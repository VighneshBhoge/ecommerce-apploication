import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dummy_cloud",
  api_key: process.env.CLOUDINARY_API_KEY || "dummy_key",
  api_secret: process.env.CLOUDINARY_API_SECRET || "dummy_secret",
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "ecommerce/products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

export const upload = multer({ storage });
