const authMiddleware = (req, res, next) => {
  const password = req.header("Authorization");
  const correctPassword = "topsecret"; // Tutaj ustawiam hasło

  if (password !== correctPassword) {
    return res.status(403).json({ error: "Forbidden: Incorrect password" });
  }

  next();
};

module.exports = authMiddleware;
