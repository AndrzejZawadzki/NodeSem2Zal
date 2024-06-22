const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const adsRoutes = require("./routes/ads");
const app = express();
const fs = require("fs");
const path = require("path");
const debugMode = process.argv.includes("debug");

const port = process.env.PORT || 4700;

// Middleware to log requests if in debug mode
if (debugMode) {
  const logFilePath = path.join(__dirname, "requests.log");
  app.use((req, res, next) => {
    const logEntry = `${new Date().toISOString()} - ${req.method} - ${
      req.originalUrl
    }\n`;
    console.log(logEntry);

    fs.appendFile(logFilePath, logEntry, (err) => {
      if (err) {
        console.error("Failed to log request:", err);
      }
    });
    next();
  });
}

dotenv.config();

app.use(bodyParser.json());
app.use("/api", adsRoutes);

// Middleware to handle 404 errors by returning a static image
app.use((req, res) => {
  const imagePath = path.join(__dirname, "public", "404.jpg");
  res.status(404).sendFile(imagePath);
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("Error", err);
  res.status(500).json({ error: "An internal server error occurred" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
