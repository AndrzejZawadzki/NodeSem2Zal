const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const Ad = require("../models/ad");
const authMiddleware = require("../middelware/auth");

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
  )}\nPrice: ${ad.price}\nCreated At: ${ad.createdAt}\nUserId: ${ad.userId}`;
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
  const { title, description, author, category, tags, price, userId } =
    req.body;
  const ad = new Ad(title, description, author, category, tags, price, userId);
  const ads = readAdsFromFile();
  ads.push(ad);
  writeAdsToFile(ads);
  res.status(201).json(ad);
  console.log(req.body);
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
        `<h1>${ad.title}</h1><p>${ad.description}</p><p><strong>Author:</strong> ${ad.author}</p><p><strong>Category:</strong> ${ad.category}</p><p><strong>Tags:</strong> ${ad.tags}</p><p><strong>Price:</strong> ${ad.price}</p><p><strong>Created At:</strong> ${ad.createdAt}</p><p><strong>UserId:</strong> ${ad.userId}</p>`
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
            }</p><p><strong>Created At:</strong> ${
              ad.createdAt
            }</p><p><strong>UserId:</strong> ${ad.userId}</p>`
        )
        .join("<hr>");
      res.send(html);
    },
    "application/json": () => res.json(ads),
  });
});

// Delete an ad by ID
router.delete("/ads/:id", authMiddleware, (req, res) => {
  let ads = readAdsFromFile();
  const adIndex = ads.findIndex((ad) => ad.id === parseInt(req.params.id));
  if (adIndex === -1) {
    return res.status(404).send("Ad not found");
  }

  const ad = ads[adIndex];

  if (ad.userId !== req.user.id) {
    return res
      .status(403)
      .json({ error: "Forbidden: You can only delete your own ads" });
  }

  ads.splice(adIndex, 1);
  writeAdsToFile(ads);
  res.status(200).send(`Ad with ID ${req.params.id} deleted successfully`);
});

// Update an ad by ID
router.put("/ads/:id", authMiddleware, (req, res) => {
  let ads = readAdsFromFile();
  const adIndex = ads.findIndex((ad) => ad.id === parseInt(req.params.id));
  if (adIndex === -1) {
    return res.status(404).send("Ad not found");
  }

  const ad = ads[adIndex];
  if (ad.userId !== req.user.id) {
    return res
      .status(403)
      .json({ error: "Forbidden: You can only update your own ads" });
  }

  const { title, description, author, category, tags, price, userId } =
    req.body;
  ad.title = title || ad.title;
  ad.description = description || ad.description;
  ad.author = author || ad.author;
  ad.category = category || ad.category;
  ad.tags = tags || ad.tags;
  ad.price = price || ad.price;
  ad.updatedAt = new Date();
  ad.userId = userId || ad.userId;

  ads[adIndex] = ad;
  writeAdsToFile(ads);
  res.status(200).json(ad);
});

// Search ads
router.get("/search", (req, res) => {
  const { title, author, description, category, minPrice, maxPrice } =
    req.query;
  let ads = readAdsFromFile();

  if (title) {
    ads = ads.filter((ad) =>
      ad.title.toLowerCase().includes(title.toLowerCase())
    );
  }
  if (author) {
    ads = ads.filter((ad) =>
      ad.author.toLowerCase().includes(author.toLowerCase())
    );
  }
  if (description) {
    ads = ads.filter((ad) =>
      ad.description.toLowerCase().includes(description.toLowerCase())
    );
  }
  if (category) {
    ads = ads.filter(
      (ad) => ad.category.toLowerCase() === category.toLowerCase()
    );
  }
  if (minPrice) {
    ads = ads.filter((ad) => ad.price >= parseFloat(minPrice));
  }
  if (maxPrice) {
    ads = ads.filter((ad) => ad.price <= parseFloat(maxPrice));
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
            }</p><p><strong>Created At:</strong> ${
              ad.createdAt
            }</p><p><strong>UserId:</strong> ${ad.userId}</p>`
        )
        .join("<hr>");
      res.send(html);
    },
    "application/json": () => res.json(ads),
  });
});

module.exports = router;
