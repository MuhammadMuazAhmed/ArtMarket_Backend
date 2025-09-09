import { body, param, query, validationResult } from "express-validator";

// Validation result handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
        value: err.value,
      })),
    });
  }
  next();
};

// ===========================================
// AUTHENTICATION VALIDATION
// ===========================================

export const validateRegistration = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name can only contain letters and spaces"),

  body("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address")
    .isLength({ max: 100 })
    .withMessage("Email is too long"),

  body("password")
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters"),

  body("role")
    .isIn(["buyer", "seller"])
    .withMessage("Role must be either buyer or seller"),

  handleValidationErrors,
];

export const validateLogin = [
  body("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),

  body("password").notEmpty().withMessage("Password is required"),

  handleValidationErrors,
];

// ===========================================
// ARTWORK VALIDATION
// ===========================================

export const validateArtworkCreation = [
  body("title")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Title must be between 1 and 100 characters")
    .escape()
    .withMessage("Title contains invalid characters"),

  body("description")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters")
    .escape()
    .withMessage("Description contains invalid characters"),

  body("price")
    .toFloat()
    .isFloat({ min: 0.01, max: 1000000 })
    .withMessage("Price must be a positive number between 0.01 and 1,000,000"),

  body("medium")
    .trim()
    .customSanitizer((v) =>
      typeof v === "string"
        ? v
            .replace(/\s+/g, " ")
            .trim()
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" ")
        : v
    )
    .isLength({ min: 1, max: 50 })
    .withMessage("Medium must be between 1 and 50 characters")
    .isIn([
      "Canvas",
      "Paper",
      "Wood",
      "Metal",
      "Glass",
      "Fabric",
      "Stone",
      "Ceramic",
      "Digital",
      "Plastic",
    ])
    .withMessage("Invalid medium selected"),

  body("size")
    .trim()
    .customSanitizer((v) =>
      typeof v === "string"
        ? v
            .replace(/\s+/g, " ")
            .trim()
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" ")
        : v
    )
    .isLength({ min: 1, max: 50 })
    .withMessage("Size must be between 1 and 50 characters")
    .isIn(["Small", "Medium", "Large"])
    .withMessage("Invalid size selected"),

  body("style")
    .trim()
    .customSanitizer((v) =>
      typeof v === "string"
        ? v
            .replace(/\s+/g, " ")
            .trim()
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" ")
        : v
    )
    .isLength({ min: 1, max: 50 })
    .withMessage("Style must be between 1 and 50 characters")
    .isIn([
      "Abstract",
      "Figurative",
      "Expressionism",
      "Impressionism",
      "Fine Art",
      "Contemporary",
      "Modern",
      "Classical",
    ])
    .withMessage("Invalid style selected"),

  body("technique")
    .trim()
    .customSanitizer((v) =>
      typeof v === "string"
        ? v
            .replace(/\s+/g, " ")
            .trim()
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" ")
        : v
    )
    .isLength({ min: 1, max: 100 })
    .withMessage("Technique must be between 1 and 100 characters")
    .isIn([
      "Oil Painting",
      "Watercolor",
      "Acrylic",
      "Digital",
      "Charcoal",
      "Ink",
      "Mixed Media",
      "Collage",
      "Spray Paint",
      "Pastel",
    ])
    .withMessage("Invalid technique selected"),

  handleValidationErrors,
];

export const validateArtworkUpdate = [
  param("id").isMongoId().withMessage("Invalid artwork ID"),

  body("title")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Title must be between 1 and 100 characters")
    .escape()
    .withMessage("Title contains invalid characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters")
    .escape()
    .withMessage("Description contains invalid characters"),

  body("price")
    .optional()
    .isFloat({ min: 0.01, max: 1000000 })
    .withMessage("Price must be a positive number between 0.01 and 1,000,000"),

  handleValidationErrors,
];

// ===========================================
// USER PROFILE VALIDATION
// ===========================================

export const validateProfileUpdate = [
  param("userId").isMongoId().withMessage("Invalid user ID"),

  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name can only contain letters and spaces"),

  body("headline")
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Headline must be between 5 and 200 characters")
    .escape()
    .withMessage("Headline contains invalid characters"),

  handleValidationErrors,
];

export const validateEducationUpdate = [
  param("userId").isMongoId().withMessage("Invalid user ID"),

  body("education")
    .isArray({ min: 0, max: 10 })
    .withMessage("Education must be an array with maximum 10 entries"),

  body("education.*.country")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Country must be between 2 and 50 characters")
    .escape()
    .withMessage("Country contains invalid characters"),

  body("education.*.university")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("University must be between 2 and 100 characters")
    .escape()
    .withMessage("University contains invalid characters"),

  body("education.*.degree")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Degree must be between 2 and 100 characters")
    .escape()
    .withMessage("Degree contains invalid characters"),

  body("education.*.major")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Major must be between 2 and 100 characters")
    .escape()
    .withMessage("Major contains invalid characters"),

  body("education.*.graduationYear")
    .isInt({ min: 1950, max: new Date().getFullYear() + 10 })
    .withMessage("Graduation year must be between 1950 and future 10 years"),

  handleValidationErrors,
];

export const validateSkillsUpdate = [
  param("userId").isMongoId().withMessage("Invalid user ID"),

  body("skills")
    .isArray({ min: 0, max: 20 })
    .withMessage("Skills must be an array with maximum 20 entries"),

  body("skills.*.name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Skill name must be between 2 and 50 characters")
    .escape()
    .withMessage("Skill name contains invalid characters"),

  body("skills.*.description")
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Skill description must be between 5 and 200 characters")
    .escape()
    .withMessage("Skill description contains invalid characters"),

  body("skills.*.efficiency")
    .isInt({ min: 0, max: 100 })
    .withMessage("Efficiency must be between 0 and 100"),

  handleValidationErrors,
];

export const validateContactUpdate = [
  param("userId").isMongoId().withMessage("Invalid user ID"),

  // Align with frontend/body payload key: contactInfo
  body("contactInfo").isObject().withMessage("Contact info must be an object"),

  body("contactInfo.whatsapp")
    .optional()
    .trim()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage("Invalid WhatsApp/phone number format"),

  body("contactInfo.address")
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Address must be between 5 and 200 characters")
    .escape()
    .withMessage("Address contains invalid characters"),

  body("contactInfo.city")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("City must be between 2 and 50 characters")
    .escape()
    .withMessage("City contains invalid characters"),

  body("contactInfo.country")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Country must be between 2 and 50 characters")
    .escape()
    .withMessage("Country contains invalid characters"),

  body("contactInfo.email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address"),

  body("contactInfo.linkedin")
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("LinkedIn URL must be reasonable length"),

  body("contactInfo.portfolio")
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Portfolio URL must be reasonable length"),

  body("contactInfo.instagram")
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("Instagram handle/URL must be reasonable length"),

  handleValidationErrors,
];

// ===========================================
// PURCHASE VALIDATION
// ===========================================

export const validatePurchaseCreation = [
  body("artworkId").isMongoId().withMessage("Invalid artwork ID"),

  body("buyerName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Buyer name must be between 2 and 50 characters")
    .escape()
    .withMessage("Buyer name contains invalid characters"),

  body("buyerEmail")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid buyer email address"),

  handleValidationErrors,
];

// ===========================================
// QUERY PARAMETER VALIDATION
// ===========================================

export const validateArtworkQuery = [
  query("style")
    .optional()
    .trim()
    .isIn([
      "Abstract",
      "Figurative",
      "Expressionism",
      "Impressionism",
      "Fine Art",
      "Contemporary",
      "Modern",
      "Classical",
    ])
    .withMessage("Invalid style filter"),

  query("medium")
    .optional()
    .trim()
    .isIn([
      "Canvas",
      "Paper",
      "Wood",
      "Metal",
      "Glass",
      "Fabric",
      "Stone",
      "Ceramic",
      "Digital",
      "Plastic",
    ])
    .withMessage("Invalid medium filter"),

  query("size")
    .optional()
    .trim()
    .isIn(["Small", "Medium", "Large"])
    .withMessage("Invalid size filter"),

  query("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price filter must be a positive number"),

  query("search")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Search term must be between 1 and 100 characters")
    .escape()
    .withMessage("Search term contains invalid characters"),

  handleValidationErrors,
];

// ===========================================
// ID PARAMETER VALIDATION
// ===========================================

export const validateMongoId = [
  param("id").isMongoId().withMessage("Invalid ID format"),

  handleValidationErrors,
];

export const validateUserId = [
  param("userId").isMongoId().withMessage("Invalid user ID format"),

  handleValidationErrors,
];

export const validateArtworkId = [
  param("artworkId").isMongoId().withMessage("Invalid artwork ID format"),

  handleValidationErrors,
];
