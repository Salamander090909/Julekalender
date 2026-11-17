const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    email: String,
    username: String,
    role: {
        type: String,
        enum: ["admin", "bruker"],
        default: "bruker",
        required: true
    }
});

const user = mongoose.model("user", userSchema)

module.exports = user