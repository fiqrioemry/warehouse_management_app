// server/src/config/cloudinary.ts
require("dotenv").config();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  secure: true,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
});

module.exports = cloudinary;
