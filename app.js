const express = require("express");
const cookieParser = require("cookie-parser")
require("dotenv").config();
const env = require("dotenv")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")

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

    const idag = new Date("2026.12.15"); 
    const dag = idag.getMonth() === 11 ? idag.getDate() : 0;

    let user = null

    const token = req.cookies.jwt;

    if(token) {
        try {
            const decoded = jwt.verify(token, process.env.SECRET_JWT);
            user = await User.findById(decoded.userId);
        } catch (error) {
            user = null
        }
    }
    console.log(req.cookies);

    res.render('index', { luker, dag, user });
});

app.get("/register", (req, res) => {
    res.render("register", {user: null})
})


app.get("/luke/:nr", async (req, res) => {
    const nr = Number(req.params.nr);
    const luke = await Luke.findOne({ nr });
    console.log(luke.toObject());   
    const idag = new Date("2026.12.15"); 
    const dag = idag.getMonth() === 11 ? idag.getDate() : 0;

    if (!luke) {
        return res.status(404).send("Fant ikke luken");
    }

    const token = req.cookies.jwt;

    if (!token) {
        return res.redirect("/register")
    }

    const decoded = jwt.verify(token, process.env.SECRET_JWT);

    const user = await User.findById(decoded.userId);

    if (!user) {
        return res.redirect("/register")
    }

    res.render("kalenderQuiz", { luke, user, dag });

});

app.post("/register", async (req, res) => {
    const email = req.body.email?.trim().toLowerCase();

    const existing = await User.findOne({email});

    if (existing) {
        return res.status(409).render("register", {
            error: "Denne e-posten er allerede registrert."
        });
    }
        
    const username = email.split("@")[0];
    
    const user = new User({
        email,
        username
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

app.post("/luke/:nr/svar", async (req, res) => {

    const nr = Number(req.params.nr);

    const luke = await Luke.findOne({ nr });

    if(!luke) {
        return res.status(404).send("Fant ikke luken")
    }

    const token = req.cookies.jwt;

    if(!token) {
        return res.redirect("/register")
    }

    const decoded = jwt.verify(token, process.env.SECRET_JWT);

    const user = await User.findById(decoded.userId);

    if(!user) {
        return res.redirect("/register")
    }

    const { svar } = req.body;

    await Besvarelse.findOneAndUpdate(
        {
            user: user._id,
            luke: luke._id
        },
        {
            user: user._id,
            luke: luke._id,
            $push: {
                svar: {
                    valgtSvar: svar,
                    riktigSvar: luke.correct_answer
                }
            }
        },
        {
            upsert: true,
            new: true
        }
    );
    res.redirect("/")
})



app.listen(process.env.PORT);