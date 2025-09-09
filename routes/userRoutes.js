import express from "express";
import {
  getUserProfile,
  updateUserEducation,
  updateUserSkills,
  updateUserContact,
  updateUserProfile,
} from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  validateUserId,
  validateEducationUpdate,
  validateSkillsUpdate,
  validateContactUpdate,
  validateProfileUpdate,
} from "../middleware/validation.js";
import uploadProfilePic from "../middleware/profileUploadMiddleware.js";

const router = express.Router();

// User routes with validation
router.get("/:userId", authMiddleware, validateUserId, getUserProfile);
router.put(
  "/:userId/education",
  authMiddleware,
  validateEducationUpdate,
  updateUserEducation
);
router.put(
  "/:userId/skills",
  authMiddleware,
  validateSkillsUpdate,
  updateUserSkills
);
router.put(
  "/:userId/contact",
  authMiddleware,
  validateContactUpdate,
  updateUserContact
);
router.put(
  "/:userId/profile",
  authMiddleware,
  uploadProfilePic.single("profilePic"),
  validateProfileUpdate,
  updateUserProfile
);

export default router;
