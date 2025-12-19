import mongoose from "mongoose";

const borrowedBookSchema = new mongoose.Schema({
  _id: false,
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  borrowedDate: {
    type: Date,
    default: Date.now
  },
  returnDate: {
    type: Date,
    required: true
  }
});

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  borrowedBooks: [borrowedBookSchema]
});

const User = mongoose.model("User", userSchema);

export default User;
