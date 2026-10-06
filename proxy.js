const express = require("express");
const fetch = require("node-fetch");
const app = express();
const PORT = 3001;
const API_KEY = "YOUR_API_NINJA_KEY";

app.get("/api/cars", async (req, res) => {
  const { make, model } = req.query;
  const url = `https://api.api-ninjas.com/v1/cars?make=${make}&model=${model}`;
  const response = await fetch(url, { headers: { "X-Api-Key": API_KEY } });
  const data = await response.json();
  res.json(data);
});

app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
