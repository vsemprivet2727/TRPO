import mongoose from "mongoose"

const userSchems = new mongoose.Schema({
    username: {type: String, reguired: true},
    emain:    {type: String, reguired: true, unique: true},
    password: {type: String, required: true}
});

export default mongoose.model("User", userSchema);