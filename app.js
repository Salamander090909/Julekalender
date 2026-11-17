const express = require("express");
require("dotenv").config();
const env = require("dotenv")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")

const User = require("./models/User")
const Luke = require("./models/Luke");
const Besvarelse = require("./models/Besvarelse")

const app = express()

app.set("view engine", "ejs")

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(cookieParser());

mongoose.connect(process.env.MONGODB_URI);

app.get("/", async (req, res) => {
    const luker = await Luke.find().sort({ nr: 1 });

    const idag = new Date("2026-12-24"); 
    const dag = idag.getMonth() === 11 ? idag.getDate() : 0;

    res.render('index', { luker, dag });
});

app.get("/register", (req, res) => {
    res.render("register")
})


app.get("/luke/:nr", async (req, res) => {
    const nr = Number(req.params.nr);

    const luke = await Luke.findOne({ nr });
    if (!luke) return res.status(404).send("Fant ikke luken");

    res.render("kalenderQuiz", { luke });
});

js
app.post("/register", async (req, res) => {
    const { email } = req.body;

    const user = new User({
        email
    });

    await user.save();

    const token = jwt.sign(
        { userId: user._id },
        process.env.SECRET_JWT,
        { expiresIn: "30d" }
    );

    res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.redirect("/");
});


app.listen(process.env.PORT)