const mongoose = require("mongoose");

const locationSubmissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    submittedBy: { type: String, required: true, trim: true },
    placeName: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    region: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String, required: true, trim: true },
    bestSeason: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true, trim: true },
    mapsUrl: { type: String, required: true, trim: true },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    status: {
      type: String,
      trim: true,
      default: "approved",
      enum: ["approved", "pending", "rejected"]
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("LocationSubmission", locationSubmissionSchema);
