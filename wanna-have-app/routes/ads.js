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

// Helper function to format a list of ads to plain text
const formatAdsToText = (ads) => {
  return ads.map(formatAdToText).join("\n\n");
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
        `<h1>${ad.title}</h1><p>${ad.description}</p><p><strong>Author:</strong> ${ad.author}</p><p><strong>Category:</strong> ${ad.category}</p><p><strong>Tags:</strong> ${ad.tags}</p><p><strong>Price:</strong> ${ad.price}</p><p><strong>Created At:</strong> ${ad.createdAt}</p>`
      ),
    "application/json": () => res.json(ad),
  });
});

// Get all ads
router.get("/ads", (req, res) => {
  const ads = readAdsFromFile();
  if (!ads) {
    return res.status(404).send("Ads not found");
  }
  res.format({
    "text/plain": () => res.send(formatAdsToText(ads)),
    "text/html": () => {
      const html = ads
        .map(
          (ad) =>
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
        )
        .join("<hr>");
      res.send(html);
    },
    "application/json": () => res.json(ads),
  });
});

// Delete an ad by ID
router.delete("/ads/:id", (req, res) => {
  let ads = readAdsFromFile();
  const adIndex = ads.findIndex((ad) => ad.id === parseInt(req.params.id));
  if (adIndex === -1) {
    return res.status(404).send("Ad not found");
  }

  ads.splice(adIndex, 1);
  writeAdsToFile(ads);
  res.status(200).send(`Ad with ID ${req.params.id} deleted successfully`);
});

// Update an ad by ID
router.put("/ads/:id", (req, res) => {
  let ads = readAdsFromFile();
  const adIndex = ads.findIndex((ad) => ad.id === parseInt(req.params.id));
  if (adIndex === -1) {
    return res.status(404).send("Ad not found");
  }

  const { title, description, author, category, tags, price } = req.body;
  const ad = ads[adIndex];
  ad.title = title || ad.title;
  ad.description = description || ad.description;
  ad.author = author || ad.author;
  ad.category = category || ad.category;
  ad.tags = tags || ad.tags;
  ad.price = price || ad.price;
  ad.updatedAt = new Date();

  ads[adIndex] = ad;
  writeAdsToFile(ads);
  res.status(200).json(ad);
});

module.exports = router;
