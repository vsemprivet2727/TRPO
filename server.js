import express from "express";
import mongoose from "mongoose";
import Book from "./models/Book.js";

const app = express();

mongoose.connect("mongodb://localhost:27017/trpo")
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

app.get("/books", async (req, res) => {
  try {
    const { author, genre, language, publisher, minPages, maxPages, title } = req.query;

    const filter = {};

    if (author) filter.author = author;
    if (publisher) filter.publisher = publisher;
    if (language) filter.language = language;
    if (title) filter.title = new RegExp(title, "i");

    if (genre) filter.genre = { $in: [genre] };

    if (minPages || maxPages)
      filter.pages = {
        ...(minPages && { $gte: Number(minPages) }),
        ...(maxPages && { $lte: Number(maxPages) }),
      };

    const books = await Book.find(filter);

    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("Server started on port 3000"));
