import Purchase from "../models/Purchase.js";
import Artwork from "../models/Artwork.js";
import User from "../models/User.js";

// Create a new purchase
export const createPurchase = async (req, res) => {
  try {
    const { artworkId, buyerName, buyerEmail } = req.body;

    // Get the artwork details
    const artwork = await Artwork.findById(artworkId).populate("artist");
    if (!artwork) {
      return res.status(404).json({ message: "Artwork not found" });
    }

    // Check if artwork is already sold
    if (artwork.status === "sold") {
      return res.status(400).json({ message: "This artwork is already sold" });
    }

    // Create purchase record without requiring user authentication
    const purchase = new Purchase({
      buyer: null, // No authenticated user
      seller: artwork.artist._id,
      artwork: artworkId,
      amount: artwork.price,
      status: "completed", // For demo purposes, we'll mark as completed immediately
      transactionId: `TXN_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      buyerName: buyerName || "Anonymous Buyer",
      buyerEmail: buyerEmail || "anonymous@example.com",
    });

    await purchase.save();

    // Update artwork status to sold
    artwork.status = "sold";
    await artwork.save();

    // Populate the purchase with seller and artwork details
    const populatedPurchase = await Purchase.findById(purchase._id)
      .populate("seller", "name email")
      .populate("artwork", "title imageUrl");

    res.status(201).json({
      message: "Purchase completed successfully",
      purchase: populatedPurchase,
    });
  } catch (error) {
    console.error("Purchase creation error:", error);
    res
      .status(500)
      .json({ message: "Error creating purchase", error: error.message });
  }
};

// Get purchase history for a user
export const getPurchaseHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.query; // "bought" or "sold"

    let query = {};
    if (type === "bought") {
      query.buyer = userId;
    } else if (type === "sold") {
      query.seller = userId;
    } else {
      // Get both bought and sold items
      query = {
        $or: [{ buyer: userId }, { seller: userId }],
      };
    }

    const purchases = await Purchase.find(query)
      .populate("buyer", "name email")
      .populate("seller", "name email")
      .populate("artwork", "title imageUrl price")
      .sort({ createdAt: -1 });

    res.json(purchases);
  } catch (error) {
    console.error("Get purchase history error:", error);
    res.status(500).json({
      message: "Error fetching purchase history",
      error: error.message,
    });
  }
};

// Get a specific purchase by ID
export const getPurchaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const purchase = await Purchase.findById(id)
      .populate("buyer", "name email")
      .populate("seller", "name email")
      .populate("artwork", "title imageUrl price description");

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    // Check if user is authorized to view this purchase
    if (
      purchase.buyer._id.toString() !== userId &&
      purchase.seller._id.toString() !== userId
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this purchase" });
    }

    res.json(purchase);
  } catch (error) {
    console.error("Get purchase by ID error:", error);
    res
      .status(500)
      .json({ message: "Error fetching purchase", error: error.message });
  }
};
