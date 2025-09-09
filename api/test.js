import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection with retry logic
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB Connected");
    return conn;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return null;
  }
};

// Simple test route
app.get("/api/test", async (req, res) => {
  try {
    // Ensure DB is connected
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    res.json({
      message: "API is working",
      mongoStatus: mongoose.connection.readyState,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// Root route
app.get("/", async (req, res) => {
  try {
    res.json({ message: "Welcome to Art Market API" });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(500)
    .json({ error: "Internal Server Error", message: err.message });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
  });

export default app;
