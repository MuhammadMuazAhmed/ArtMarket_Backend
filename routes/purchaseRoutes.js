import express from "express";
import {
  createPurchase,
  getPurchaseHistory,
  getPurchaseById,
} from "../controllers/purchaseController.js";
import { authMiddleware as protect } from "../middleware/authMiddleware.js";
import { 
  validatePurchaseCreation,
  validateMongoId 
} from "../middleware/validation.js";

const router = express.Router();

// Create a new purchase (no authentication required)
router.post("/", validatePurchaseCreation, createPurchase);

// These routes require authentication
router.use(protect);

// Get purchase history for the authenticated user
router.get("/history", getPurchaseHistory);

// Get a specific purchase by ID
router.get("/:id", validateMongoId, getPurchaseById);

export default router;
