const express = require("express");
const Quote = require("../models/Quote");
const Favorite = require("../models/Favorite");

const router = express.Router();

// ✅ Get random quote
router.get("/random", async (req, res) => {
  try {
    const count = await Quote.countDocuments();
    if (count === 0) {
      return res.status(404).json({ message: "No quotes found in DB" });
    }

    const randomIndex = Math.floor(Math.random() * count);
    const randomQuote = await Quote.findOne().skip(randomIndex);

    res.json(randomQuote);
  } catch (err) {
    res.status(500).json({ message: "Error fetching random quote", error: err.message });
  }
});
// ✅ Save to favorites (without duplicating in Quotes)
router.post("/favorite", async (req, res) => {
  try {
    const { text, author } = req.body;

    if (!text || !author) {
      return res.status(400).json({ message: "Quote text and author required" });
    }

    // Prevent duplicates in favorites
    const exists = await Favorite.findOne({ text, author });
    if (exists) {
      return res.status(400).json({ message: "Already in favorites!" });
    }

    const favorite = new Favorite({ text, author });
    await favorite.save();

    res.status(201).json({ message: "✅ Added to favorites!", favorite });
  } catch (err) {
    res.status(500).json({ message: "Error saving favorite", error: err.message });
  }
});

// ✅ Get all favorites

router.get("/favorites", async (req, res) => {
  try {
    const favorites = await Favorite.find();
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ message: "Error fetching favorites", error: err.message });
  }
});

// ✅ Get all favorites



// ✅ Delete favorite (only from favorites, not quotes)

router.delete("/favorites/:id", async (req, res) => {
  try {
    const deletedFav = await Favorite.findByIdAndDelete(req.params.id);
    if (!deletedFav) return res.status(404).json({ message: "Favorite not found" });
    res.json({ message: "🗑 Favorite removed!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
