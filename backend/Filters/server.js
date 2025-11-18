import express from "express";
import mongoose from "mongoose";
import Book from "./models/Book.js";
import cors from 'cors';



const app = express();

app.use(cors()); // разрешает все источники

mongoose.connect("mongodb://localhost:27017/trpo")
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

app.get("/api/books", async (req, res) => {
    try {
    const { author, publisher, year, inStock } = req.query;
    const filter = {};

    if (author) filter.author = new RegExp(author, "i");
    if (publisher) filter.publisher = new RegExp(publisher, "i");

    if (year) {
      const start = new Date(`${year}-01-01`);
      const end   = new Date(`${year}-12-31`);
      filter.publishDate = { $gte: start, $lte: end };
    }

    if (inStock === "true") filter.inStock = true;

    const books = await Book.find(filter);
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("Server started on port 3000"));
