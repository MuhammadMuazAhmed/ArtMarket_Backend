import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["buyer", "seller"], required: true },

    // Profile fields
    profileImage: { type: String }, // legacy
    profilePic: { type: String }, // used by frontend
    headline: { type: String },

    // Education entries
    education: [
      {
        country: String,
        university: String,
        degree: String,
        major: String,
        graduationYear: String,
      },
    ],

    // Skills entries
    skills: [
      {
        name: String,
        description: String,
        efficiency: { type: Number, min: 0, max: 100 },
      },
    ],

    // Contact information
    contactInfo: {
      email: String,
      linkedin: String,
      portfolio: String,
      whatsapp: String,
      instagram: String,
    },

    // Optional: list of contact links user can add
    contacts: [
      {
        type: {
          type: String,
          enum: [
            "email",
            "linkedin",
            "portfolio",
            "whatsapp",
            "instagram",
            "website",
            "other",
          ],
        },
        value: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
