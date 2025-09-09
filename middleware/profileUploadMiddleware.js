import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure destination directory exists
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const destDir = path.join(__dirname, "../uploads/profilepics/");
ensureDir(destDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, destDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `profile-${timestamp}-${randomSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"), false);
  }
  cb(null, true);
};

const uploadProfilePic = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

export default uploadProfilePic;
