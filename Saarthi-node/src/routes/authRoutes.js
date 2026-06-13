const bcrypt = require("bcryptjs");
const express = require("express");

const User = require("../models/User");

const router = express.Router();

function buildSessionResponse(user) {
  return {
    authenticated: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  };
}

router.get("/session", (req, res) => {
  if (!req.session?.userId) {
    return res.json({ authenticated: false });
  }

  return res.json({
    authenticated: true,
    user: {
      id: req.session.userId,
      name: req.session.userName,
      email: req.session.userEmail
    }
  });
});

router.post("/register", async (req, res) => {
  try {
    const name = (req.body.name || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const password = (req.body.password || "").trim();

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    if (!email.includes("@")) {
      return res.status(400).json({ error: "Enter a valid email address." });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });

    req.session.userId = String(user._id);
    req.session.userName = user.name;
    req.session.userEmail = user.email;

    return res.json(buildSessionResponse(user));
  } catch (error) {
    return res.status(500).json({ error: "Could not register right now." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const password = (req.body.password || "").trim();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Incorrect email or password." });
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      return res.status(401).json({ error: "Incorrect email or password." });
    }

    req.session.userId = String(user._id);
    req.session.userName = user.name;
    req.session.userEmail = user.email;

    return res.json(buildSessionResponse(user));
  } catch (error) {
    return res.status(500).json({ error: "Could not login right now." });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ authenticated: false });
  });
});

module.exports = router;
