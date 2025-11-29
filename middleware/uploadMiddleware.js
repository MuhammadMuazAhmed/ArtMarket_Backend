import multer from "multer";
import config from "../config/env.js";
import cloudinary from "../config/cloudinay.js";
import streamifier from "streamifier";

// Only allow image files
const fileFilter = (req, file, cb) => {
  if (!config.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    return cb(
      new Error(
        `Only ${config.ALLOWED_FILE_TYPES.join(", ")} files are allowed!`
      ),
      false
    );
  }
  cb(null, true);
};

const upload = multer({
  fileFilter,
  limits: {
    fileSize: config.MAX_FILE_SIZE,
    files: 1,
    fieldSize: 1024 * 1024,
  },
});

// Middleware to upload file to Cloudinary
export const uploadToCloudinary = async (req, res, next) => {
  if (!req.file) return next();
  try {
    const streamUpload = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "artworks",
            resource_type: "image",
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
      .json({ error: "Cloudinary upload failed", message: error.message });
    };
  };

export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File too large",
        message: `File size must be less than ${
          config.MAX_FILE_SIZE / (1024 * 1024)
        }MB`,
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        error: "Too many files",
        message: "Only one file is allowed per request",
      });
    }
    if (error.code === "LIMIT_FIELD_SIZE") {
      return res.status(400).json({
        error: "Field too large",
        message: "Field size must be less than 1MB",
      });
    }
    return res.status(400).json({
      error: "Upload error",
      message: error.message,
    });
  }
  if (error.message.includes("Only")) {
    return res.status(400).json({
      error: "Invalid file type",
      message: error.message,
    });
  }
  next(error);
};

export default upload;
