const express = require("express");

const Place = require("../models/Place");
const LocationSubmission = require("../models/LocationSubmission");

const router = express.Router();

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildLocationQuery(location) {
  if (!location) {
    return {};
  }

  const regex = new RegExp(escapeRegex(location), "i");
  return {
    $or: [
      { name: regex },
      { location: regex },
      { state: regex },
      { region: regex }
    ]
  };
}

function mapSubmissionToPlace(submission) {
  return {
    id: submission._id,
    name: submission.placeName,
    location: submission.city,
    state: submission.state,
    region: submission.region,
    category: submission.category,
    description: submission.description,
    bestSeason: submission.bestSeason,
    imageUrl: submission.imageUrl,
    mapsUrl: submission.mapsUrl
  };
}

router.get("/", async (req, res) => {
  try {
    const location = (req.query.location || "").trim();
    const category = (req.query.category || "").trim().toLowerCase();

    const filter = buildLocationQuery(location);
    if (category) {
      filter.category = category;
    }

    const [places, approvedSubmissions] = await Promise.all([
      Place.find(filter).lean(),
      LocationSubmission.find({
        ...buildLocationQuery(location ? "" : ""),
        status: "approved",
        ...(category ? { category } : {})
      }).lean()
    ]);

    const submissionPlaces = approvedSubmissions
      .map(mapSubmissionToPlace)
      .filter((place) => {
        if (!location) {
          return true;
        }

        const value = location.toLowerCase();
        return [place.name, place.location, place.state, place.region].some((item) =>
          (item || "").toLowerCase().includes(value)
        );
      });

    const combined = [...places, ...submissionPlaces].sort((left, right) => {
      const stateCompare = (left.state || "").localeCompare(right.state || "", undefined, { sensitivity: "base" });
      if (stateCompare !== 0) {
        return stateCompare;
      }

      return (left.name || "").localeCompare(right.name || "", undefined, { sensitivity: "base" });
    });

    return res.json(combined);
  } catch (error) {
    return res.status(500).json({ error: "Could not load places right now." });
  }
});

module.exports = router;
