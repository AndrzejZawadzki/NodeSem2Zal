const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const adsRoutes = require("./routes/ads");
// const Ad = require("./models/ad");

dotenv.config();
const app = express();
const port = process.env.PORT || 4700;

app.use(bodyParser.json());
app.use("/api", adsRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
