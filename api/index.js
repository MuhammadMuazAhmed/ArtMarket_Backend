import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import {
  helmetConfig,
  corsOptions,
  sanitizeData,
  securityHeaders,
  requestSizeLimit,
} from "../config/security.js";
import authRoutes from "../routes/authRoutes.js";
import artworkRoutes from "../routes/artworkRoutes.js";
import userRoutes from "../routes/userRoutes.js";
import purchaseRoutes from "../routes/purchaseRoutes.js";
import config from "../config/env.js";

const app = express();

// Middleware
app.use(helmetConfig);
app.use(cors(corsOptions));
app.use(securityHeaders);
app.use(express.json(requestSizeLimit));
app.use(express.urlencoded(requestSizeLimit));
app.use(sanitizeData);

// Database connection
mongoose
  .connect(config.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/artworks", artworkRoutes);
app.use("/api/users", userRoutes);
app.use("/api/purchases", purchaseRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Root route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to Art Market API" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: "The requested endpoint does not exist",
    path: req.path,
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error("Error:", error);
  res.status(error.status || 500).json({
    error:
      config.NODE_ENV === "production"
        ? "Internal server error"
        : error.message,
  });
});

export default app;
