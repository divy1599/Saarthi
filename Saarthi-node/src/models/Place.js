const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    region: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String, required: true, trim: true },
    bestSeason: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true, trim: true },
    mapsUrl: { type: String, required: true, trim: true }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Place", placeSchema);
