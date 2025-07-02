import { config } from "dotenv";
import cloudinary from "cloudinary";

config(); // ✅ Load .env

cloudinary.v2.config({
  secure: true,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
});

export default cloudinary;
