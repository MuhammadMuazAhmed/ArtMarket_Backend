import multer from "multer";
import cloudinary from "../config/cloudinay.js";
import streamifier from "streamifier";

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"), false);
  }
  cb(null, true);
};

// Configure multer to use memory storage
const uploadProfilePic = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

// Middleware to upload profile picture to Cloudinary
export const uploadProfileToCloudinary = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const streamUpload = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "profiles",
            resource_type: "image",
            transformation: [
              { width: 400, height: 400, crop: "fill" },
              { quality: "auto" },
              { fetch_format: "auto" },
            ],
          },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
      });
    };

    const result = await streamUpload(req.file.buffer);
    req.file.cloudinaryUrl = result.secure_url;
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Profile picture upload failed", message: error.message });
  }
};

export default uploadProfilePic;
