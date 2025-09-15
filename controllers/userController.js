import User from "../models/User.js"; // User model to interact with MongoDB

// Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find the user by userId in the database
    const user = await User.findById(userId);

    // If user is not found, return a 404 error
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If the user is found, return the user profile data
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update User Education
export const updateUserEducation = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { education } = req.body;
    if (!Array.isArray(education)) {
      return res.status(400).json({ message: "Education must be an array" });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { education },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update User Skills
export const updateUserSkills = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { skills } = req.body;
    if (!Array.isArray(skills)) {
      return res.status(400).json({ message: "Skills must be an array" });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { skills },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update User Contact
export const updateUserContact = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { contactInfo, contacts } = req.body;

    const updateOps = {};
    if (contactInfo && typeof contactInfo === "object") {
      const setObj = {};
      Object.keys(contactInfo).forEach((key) => {
        if (contactInfo[key] !== undefined) {
          setObj[`contactInfo.${key}`] = contactInfo[key];
        }
      });
      if (Object.keys(setObj).length) updateOps.$set = setObj;
    }

    if (Array.isArray(contacts)) {
      updateOps.$set = { ...(updateOps.$set || {}), contacts };
    }

    if (!updateOps.$set) {
      return res.status(400).json({ message: "No contact payload provided" });
    }

    const user = await User.findByIdAndUpdate(userId, updateOps, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update Profile (profilePic/headline/name)
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    const update = {};
    const allowed = ["profilePic", "headline", "name"]; // JSON payload fields
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }

    // If a profile picture was uploaded to Cloudinary, use its URL
    if (req.file && req.file.cloudinaryUrl) {
      update.profilePic = req.file.cloudinaryUrl;
    }

    const user = await User.findByIdAndUpdate(userId, update, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
