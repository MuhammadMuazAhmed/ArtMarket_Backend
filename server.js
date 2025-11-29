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
// SECURITY MIDDLEWARES (ORDER MATTERS!)\n// ===========================================

// 1. CORS FIRST - Must be before Helmet to ensure CORS headers are always sent
app.use(cors(corsOptions));

// 2. Helmet for HTTP headers protection
app.use(helmetConfig);

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

// MongoDB connection configuration optimized for serverless
const mongooseOptions = {
  serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds for serverless cold starts
  socketTimeoutMS: 45000, // Socket timeout
  maxPoolSize: 10, // Limit connection pool for serverless
  minPoolSize: 1,
  maxIdleTimeMS: 10000, // Close idle connections after 10 seconds
  retryWrites: true,
  retryReads: true,
  connectTimeoutMS: 30000, // Connection timeout
};

// Initialize MongoDB connection (non-blocking for serverless)
let dbConnectionPromise = null;
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection; // Already connected
  }
  
  if (mongoose.connection.readyState === 2) {
    // Connection is in progress, wait for it
    return dbConnectionPromise;
  }
  
  if (!dbConnectionPromise) {
    console.log("🔄 Attempting MongoDB connection...");
    dbConnectionPromise = mongoose.connect(config.MONGO_URI, mongooseOptions)
      .then(() => {
        console.log("✅ MongoDB connected successfully");
        return mongoose.connection;
      })
      .catch((err) => {
        console.error("❌ MongoDB connection error:", err.message);
        dbConnectionPromise = null; // Reset so it can retry
        throw err;
      });
  }
  
  return dbConnectionPromise;
};

// Middleware to ensure DB connection before handling requests
const ensureDbConnection = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection failed:", error.message);
    res.status(503).json({
      error: "Service temporarily unavailable",
      message: "Database connection failed. Please try again in a moment."
    });
  }
};

// Start connection attempt but don't block serverless function
connectDB().catch(err => console.error("Initial connection attempt failed:", err.message));

// ===========================================
// API ROUTES
// ===========================================

// Health Check Route (before other routes) - no DB check needed
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

// Apply DB connection middleware to all API routes (except health check)
app.use("/api/auth", ensureDbConnection, authRoutes);
app.use("/api/artworks", ensureDbConnection, artworkRoutes);
app.use("/api/users", ensureDbConnection, userRoutes);
app.use("/api/purchases", ensureDbConnection, purchaseRoutes);

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

// Global error handler - ensure CORS headers are always set
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);

  // Ensure CORS headers are set even for errors
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key, Cache-Control, Pragma');
  }

  // Don't leak error details in production
  const isProduction = config.NODE_ENV === "production";

  res.status(error.status || 500).json({
    error: isProduction ? "Internal server error" : error.message,
    ...(isProduction ? {} : { stack: error.stack }),
  });
});

// Export the Express app for Vercel
export default app;
