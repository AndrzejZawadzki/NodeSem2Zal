const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const Ad = require("../models/ad");

const adsFilePath = path.join(__dirname, "../data/ads.json");

// Helper function to read ads from file
const readAdsFromFile = () => {
  const data = fs.readFileSync(adsFilePath);
  return JSON.parse(data);
};

// Helper function to write ads to file
const writeAdsToFile = (ads) => {
  fs.writeFileSync(adsFilePath, JSON.stringify(ads, null, 2));
};

// Helper function to format an ad to plain text
const formatAdToText = (ad) => {
  return `ID: ${ad.id}\nTitle: ${ad.title}\nDescription: ${
    ad.description
  }\nAuthor: ${ad.author}\nCategory: ${ad.category}\nTags: ${ad.tags.join(
    ", "
  )}\nPrice: ${ad.price}\nCreated At: ${ad.createdAt}`;
};

// Heartbeat endpoint
router.get("/heartbeat", (req, res) => {
  res.send(new Date().toISOString());
});

// Add a new ad
router.post("/ads", (req, res) => {
  const { title, description, author, category, tags, price } = req.body;
  const ad = new Ad(title, description, author, category, tags, price);
  const ads = readAdsFromFile();
  ads.push(ad);
  writeAdsToFile(ads);
  res.status(201).json(ad);
});

// Get a single ad by ID
router.get("/ads/:id", (req, res) => {
  const ads = readAdsFromFile();
  const ad = ads.find((ad) => ad.id === parseInt(req.params.id));
  if (!ad) {
    return res.status(404).send("Ad not found");
  }

  res.format({
    "text/plain": () => res.send(formatAdToText(ad)),
    "text/html": () =>
      res.send(
        `<h1>${ad.title}</h1><p>${
          ad.description
        }</p><p><strong>Author:</strong> ${
          ad.author
        }</p><p><strong>Category:</strong> ${
          ad.category
        }</p><p><strong>Tags:</strong> ${ad.tags.join(
          ", "
        )}</p><p><strong>Price:</strong> ${
          ad.price
        }</p><p><strong>Created At:</strong> ${ad.createdAt}</p>`
      ),
    "application/json": () => res.json(ad),
  });
});

module.exports = router;