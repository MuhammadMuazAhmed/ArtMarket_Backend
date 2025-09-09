import Artwork from "../models/Artwork.js";

// Create new artwork
export const createArtwork = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      price,
      medium,
      size,
      style,
      technique,
    } = req.body;
    const artist = req.user.id; // From auth middleware

    // Handle image URL or file upload
    let imageUrl = req.body.imageUrl;

    // If a file was uploaded, use its path
    if (req.file) {
      // Create URL for the uploaded file
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    }

    // Validate that we have an image
    if (!imageUrl) {
      return res.status(400).json({ message: "Image is required" });
    }

    const artwork = new Artwork({
      title,
      description,
      imageUrl,
      category,
      price,
      artist,
      medium,
      size,
      style,
      technique,
    });

    await artwork.save();
    res.status(201).json({ message: "Artwork created successfully", artwork });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// Get all artworks
export const getArtworks = async (req, res) => {
  try {
    const filter = {};
    if (req.query.artist) filter.artist = req.query.artist;

    // Escape regex special characters so literal values (e.g., sizes with parentheses) match correctly
    const escapeRegex = (str) =>
      String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Use case-insensitive regex for string fields
    ["medium", "size", "style", "technique"].forEach((field) => {
      if (req.query[field]) {
        const val = escapeRegex(req.query[field]);
        filter[field] = { $regex: `^${val}$`, $options: "i" };
      }
    });
    if (req.query.price)
      filter.price = { $gte: 0, $lte: Number(req.query.price) };

    const artworks = await Artwork.find(filter).populate(
      "artist",
      "name email"
    );
    res.status(200).json(artworks);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// Get artwork by ID
export const getArtworkById = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id).populate(
      "artist",
      "name email"
    );
    if (!artwork) {
      return res.status(404).json({ message: "Artwork not found" });
    }
    res.status(200).json(artwork);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// Update artwork
export const updateArtwork = async (req, res) => {
  try {
    const { title, description, category, price } = req.body;
    const artwork = await Artwork.findById(req.params.id);

    if (!artwork) {
      return res.status(404).json({ message: "Artwork not found" });
    }

    // Check if user is the artist
    if (artwork.artist.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Handle image URL or file upload
    let imageUrl = req.body.imageUrl;

    // If a file was uploaded, use its path
    if (req.file) {
      // Create URL for the uploaded file
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    }

    // Use existing image if no new image is provided
    if (!imageUrl) {
      imageUrl = artwork.imageUrl;
    }

    const updatedArtwork = await Artwork.findByIdAndUpdate(
      req.params.id,
      { title, description, imageUrl, category, price },
      { new: true }
    );

    res.status(200).json({
      message: "Artwork updated successfully",
      artwork: updatedArtwork,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// Delete artwork
export const deleteArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);

    if (!artwork) {
      return res.status(404).json({ message: "Artwork not found" });
    }

    // Check if user is the artist
    if (artwork.artist.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Artwork.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Artwork deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};
