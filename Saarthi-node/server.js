require("dotenv").config();

const path = require("path");
const express = require("express");
const session = require("express-session");

const connectDatabase = require("./src/config/db");
const seedPlaces = require("./src/data/seedPlaces");
const authRoutes = require("./src/routes/authRoutes");
const placeRoutes = require("./src/routes/placeRoutes");
const submissionRoutes = require("./src/routes/submissionRoutes");

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "saarthi-dev-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/places", placeRoutes);
app.use("/api/location-submissions", submissionRoutes);
app.use(express.static(path.join(__dirname, "public")));

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

async function startServer() {
  await connectDatabase();
  await seedPlaces();

  app.listen(port, () => {
    console.log(`Saarthi Node server is running at http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start Saarthi Node server:", error);
  process.exit(1);
});
