import express from "express";
import { register, login } from "../controllers/authController.js";
import {
  validateRegistration,
  validateLogin,
} from "../middleware/validation.js";

const router = express.Router();

// Auth routes with validation
router.post("/register", validateRegistration, register);
router.post("/login", validateLogin, login);

export default router;
