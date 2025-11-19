import mongoose from "mongoose";

const borrowedBookSchema = new mongoose.Schema({
  bookId: String,
  returnDate: Date
});

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  borrowedBooks: [borrowedBookSchema]
});

const User = mongoose.model("User", userSchema);

export default User;
