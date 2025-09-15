import express from "express";
import {
  createArtwork,
  getArtworks,
  getArtworkById,
  updateArtwork,
  deleteArtwork,
} from "../controllers/artworkController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import upload, {
  handleUploadError,
  uploadToCloudinary,
} from "../middleware/uploadMiddleware.js";
import {
  validateArtworkCreation,
  validateArtworkUpdate,
  validateArtworkQuery,
  validateMongoId,
} from "../middleware/validation.js";

const router = express.Router();

// Artwork routes with validation
router.post(
  "/create",
  authMiddleware,
  upload.single("image"),
  handleUploadError,
  uploadToCloudinary,
  validateArtworkCreation,
  createArtwork
);
router.get("/", validateArtworkQuery, getArtworks);
router.get("/:id", validateMongoId, getArtworkById);
router.put(
  "/:id",
  authMiddleware,
  upload.single("image"),
  handleUploadError,
  uploadToCloudinary,
  validateArtworkUpdate,
  updateArtwork
);
router.delete("/:id", authMiddleware, validateMongoId, deleteArtwork);

export default router;
