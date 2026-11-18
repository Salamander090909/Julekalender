const mongoose = require("mongoose");

const lukeSchema = new mongoose.Schema({
    nr: Number,
    klasse: String,
    tittel: String,
    type: [String],
    question: String,
    options: [String],
    video_url: String,
    correct_answer: String
});

const Luke = mongoose.model("luke", lukeSchema);

module.exports = Luke;