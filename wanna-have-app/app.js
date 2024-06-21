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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
