const express = require("express");
require("dotenv").config();
const env = require("dotenv")
const mongoose = require("mongoose")

const User = require("./models/User")
const Luke = require("./models/Luke");

const app = express()

app.set("view engine", "ejs")

app.use(express.urlencoded({extended: true}))
app.use(express.static("public"))

mongoose.connect(process.env.MONGODB_URI);

app.get("/", async (req, res) => {
    const luker = await Luke.find().sort({nr : 1});
    res.render("index", {luker});
});

app.get("/register", (req, res) => {
    res.render("register")
})

app.get("/kalender-quiz", (req, res) => {
    res.render("kalenderQuiz")
})

app.post("/register", async (req, res) => {
    const {
        email
    } = req.body;

    const user = new User({
        email
    })

    await user.save();
    res.redirect("/")
})


app.listen(process.env.PORT)