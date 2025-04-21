const cloudinary = require('cloudinary').v2;
const multer = require("multer")
const { CloudinaryStorage } = require('multer-storage-cloudinary');
// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  module.exports = cloudinary

