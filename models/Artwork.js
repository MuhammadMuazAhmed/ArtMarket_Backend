// backend/models/Aertwork.js

import mongoose from "mongoose";

const artworkSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String, required: true },
    category: { type: String },
    price: { type: Number },
    artist: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    medium: { type: String },
    size: { type: String },
    style: { type: String },
    technique: { type: String },
    status: { type: String, enum: ["available", "sold"], default: "available" },
  },
  { timestamps: true }
);

export default mongoose.model("Artwork", artworkSchema);
