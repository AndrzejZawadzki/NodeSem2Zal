const users = [
  { id: 1, username: "Edyta", password: "password1" },
  { id: 2, username: "John", password: "password2" },
  { id: 3, username: "Max", password: "password3" },
];

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");
  //   const correctPassword = "topsecret"; // Tutaj ustawiam hasło

  if (!authHeader) {
    return res
      .status(401)
      .json({ error: "Unathorized: No credentials provided" });
  }

  const [username, password] = authHeader.split(":");
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(403).json({ error: "Forbidden: Incorrect credentials" });
  }

  req.user = user;
  next();
};

module.exports = authMiddleware;
