import app from "../server.js";

// Connect to MongoDB at the start
let isConnected = false;

// Serverless function handler
export default async function handler(req, res) {
  try {
    // Forward the request to Express app
    return app(req, res);
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message:
        process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
}
