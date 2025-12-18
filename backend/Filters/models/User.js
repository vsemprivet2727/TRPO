import mongoose from "mongoose";

const borrowedBookSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
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
