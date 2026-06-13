function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Login is required to submit a location." });
  }

  return next();
}

module.exports = requireAuth;
