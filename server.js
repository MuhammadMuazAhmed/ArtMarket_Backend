// backend/server.js

import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

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

mongoose
  .connect(config.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ===========================================
// API ROUTES
// ===========================================

app.use("/api/auth", authRoutes);
app.use("/api/artworks", artworkRoutes);
app.use("/api/users", userRoutes);
app.use("/api/purchases", purchaseRoutes);

// ===========================================
// ERROR HANDLING MIDDLEWARE
// ===========================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: "The requested endpoint does not exist",
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);
  res.status(error.status || 500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : error.message,
    ...(process.env.NODE_ENV === "production" ? {} : { stack: error.stack }),
  });
});

// ===========================================
// HEALTH CHECK ROUTE
// ===========================================
app.get("/api/health", async (req, res) => {
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      });
    }
    res.status(200).json({
      status: "ok",
      message: "Server is running",
      mongo:
        mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message:
        process.env.NODE_ENV === "production" ? "Server error" : error.message,
    });
  }
});

// Handle MongoDB connection for serverless environment
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      });
    }
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

// Connect to MongoDB before handling requests
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

export default app;
