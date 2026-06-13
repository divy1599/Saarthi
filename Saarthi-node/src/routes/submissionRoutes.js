const express = require("express");

const requireAuth = require("../middleware/requireAuth");
const LocationSubmission = require("../models/LocationSubmission");

const router = express.Router();

function fallbackImageUrl(placeName, state, category) {
  const seed = encodeURIComponent(`${placeName}-${state}-${category}`);
  return `https://picsum.photos/seed/${seed}/900/600`;
}

router.get("/", async (req, res) => {
  try {
    const location = (req.query.location || "").trim().toLowerCase();
    const category = (req.query.category || "").trim().toLowerCase();

    let submissions = await LocationSubmission.find({ status: "approved" })
      .sort({ createdAt: -1 })
      .lean();

    if (category) {
      submissions = submissions.filter((item) => item.category === category);
    }

    if (location) {
      submissions = submissions.filter((item) =>
        [item.placeName, item.city, item.state, item.region].some((value) =>
          (value || "").toLowerCase().includes(location)
        )
      );
    }

    return res.json(submissions);
  } catch (error) {
    return res.status(500).json({ error: "Could not load submissions right now." });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const placeName = (req.body.placeName || "").trim();
    const city = (req.body.city || "").trim();
    const state = (req.body.state || "").trim();
    const region = (req.body.region || "").trim();
    const category = (req.body.category || "").trim().toLowerCase();
    const description = (req.body.description || "").trim();
    const bestSeason = (req.body.bestSeason || "").trim();
    const imageUrl = (req.body.imageUrl || "").trim();
    const mapsUrl = (req.body.mapsUrl || "").trim();
    const latitude = typeof req.body.latitude === "number" ? req.body.latitude : null;
    const longitude = typeof req.body.longitude === "number" ? req.body.longitude : null;

    if (!placeName || !city || !state || !region || !category || !description || !bestSeason) {
      return res.status(400).json({
        error: "Place name, city, state, region, category, best season, and description are required."
      });
    }

    const created = await LocationSubmission.create({
      userId: req.session.userId,
      submittedBy: req.session.userName,
      placeName,
      city,
      state,
      region,
      category,
      description,
      bestSeason,
      imageUrl: imageUrl || fallbackImageUrl(placeName, state, category),
      mapsUrl: mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(`${placeName} ${city}`)}`,
      latitude,
      longitude,
      status: "approved"
    });

    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: "Could not save location details right now." });
  }
});

module.exports = router;
