const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const adsRoutes = require("./routes/ads");
const app = express();
const fs = require("fs");
const path = require("path");

require("dotenv").config();

const debugMode = process.argv.includes("debug");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 4700;

// Connect to MongoDB
mongoose
  .connect(process.env.CONNECTION_STRING, {})
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

// Create client instance MongoDB

const connectionString = process.env.CONNECTION_STRING;

const client = new MongoClient(connectionString, {
  serverApi: ServerApiVersion.v1,
});
async function main() {
  await client.connect();

  const database = client.db(process.env.DATABASE_NAME);
  const adsCollection = database.collection("ads");
  const ads = await adsCollection.find().toArray();

  // action = mongo name
  // create = insert
  // read = find
  // update = update
  // delete = delete

  console.table(ads);
}

main()
  .then(console.log)
  .catch(console.error)
  .finally(() => client.close());

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
