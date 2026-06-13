const Place = require("../models/Place");
const seedData = require("./seedData");

async function seedPlaces() {
  const existingCount = await Place.countDocuments();

  if (existingCount > 0) {
    return;
  }

  await Place.insertMany(seedData);
}

module.exports = seedPlaces;
