// backend/server.js

import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

// Import security configurations
import {
  helmetConfig,
  corsOptions,
  sanitizeData,
  securityHeaders,
  requestSizeLimit,
  apiRateLimit,
  authRateLimit,
  uploadRateLimit,
} from "./config/security.js";

// Import cors for CORS handling
import cors from "cors";

// Import environment configuration
import config from "./config/env.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import artworkRoutes from "./routes/artworkRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";

// Get current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize app
const app = express();

// Trust proxy - required for rate limiting behind reverse proxies like Vercel
app.set("trust proxy", 1);

// ===========================================
// SECURITY MIDDLEWARES (ORDER MATTERS!)
// ===========================================

// 1. Helmet for HTTP headers protection
app.use(helmetConfig);

// 2. CORS with restricted origins
app.use(cors(corsOptions));

// 3. Security headers
app.use(securityHeaders);

// 4. Request size limiting
app.use(express.json(requestSizeLimit));
app.use(express.urlencoded(requestSizeLimit));

// 5. Data sanitization (XSS protection)
app.use(sanitizeData);

// 6. Rate limiting
app.use("/api/auth", authRateLimit); // Stricter rate limiting for auth endpoints
app.use("/api/artworks/create", uploadRateLimit); // Rate limiting for uploads
app.use("/api", apiRateLimit); // General API rate limiting

// ===========================================
// STATIC FILES (with security)
// ===========================================

// Serve static files from uploads directory with security headers
app.use(
  "/uploads",
  (req, res, next) => {
    // Set security headers for uploaded files
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    // Allow images to be consumed by the frontend (dev and prod) across origins
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "uploads"))
);

// ===========================================
// DATABASE CONNECTION
// ===========================================

// Initialize MongoDB connection
try {
  await mongoose.connect(config.MONGO_URI);
  console.log("✅ MongoDB connected successfully");
} catch (err) {
  console.error("❌ MongoDB connection error:", err);
  // Don't exit the process on connection error in production
  if (process.env.NODE_ENV !== "production") {
    process.exit(1);
  }
}

// ===========================================
// API ROUTES
// ===========================================

// Health Check Route (before other routes)
app.get("/api/health", (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";

  res.status(200).json({
    status: "ok",
    message: "Server is running",
    database: {
      status: dbStatus,
      host: mongoose.connection.host,
    },
    environment: process.env.NODE_ENV || "development",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/artworks", artworkRoutes);
app.use("/api/users", userRoutes);
app.use("/api/purchases", purchaseRoutes);

// Root route handler
app.get("/", (req, res) => {
  res.json({
    message: "Art Market API Server",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth/*",
      artworks: "/api/artworks/*",
      users: "/api/users/*",
      purchases: "/api/purchases/*",
    },
  });
});

// ===========================================
// ERROR HANDLING MIDDLEWARE
// ===========================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    message:
      "The requested endpoint does not exist. Available endpoints: /api/health, /api/auth/*, /api/artworks/*, /api/users/*, /api/purchases/*",
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);

  // Don't leak error details in production
  const isProduction = config.NODE_ENV === "production";

  res.status(error.status || 500).json({
    error: isProduction ? "Internal server error" : error.message,
    ...(isProduction ? {} : { stack: error.stack }),
  });
});

// Export the Express app for Vercel
export default app;
