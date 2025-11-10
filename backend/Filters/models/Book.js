import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  publishDate: Date,
  publisher: String,
  genre: [String],
  pages: Number,
  isbn: String,
  language: String,
});

export default mongoose.model("Book", bookSchema);
