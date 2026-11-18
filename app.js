const express = require("express");
const cookieParser = require("cookie-parser")
require("dotenv").config();
const env = require("dotenv")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")

const User = require("./models/User")
const Luke = require("./models/Luke");
const Besvarelse = require("./models/Besvarelse");

const app = express()

app.set("view engine", "ejs")

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(cookieParser());

mongoose.connect(process.env.MONGODB_URI);

app.get("/", async (req, res) => {
    const luker = await Luke.find().sort({ nr: 1 });
    console.log("Antall luker:", luker.length);
    console.log("Luker:", luker);
    
    const idag = new Date("2026.12.11"); 
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

async function requireAdmin(req, res, next) {
    try {
        const token = req.cookies.jwt;
        if (!token) return res.redirect("/");

        const decoded = jwt.verify(token, process.env.SECRET_JWT);
        const user = await User.findById(decoded.userId);

        if (!user || user.role !== "admin") return res.redirect("/");

        req.user = user;
        next();
    } catch (error) {
        res.redirect("/");
    }
}

app.get("/admin", requireAdmin, async (req, res) => {
    const luker = await Luke.find().sort({ nr: 1 }).populate("vinner");
    const besvarelser = await Besvarelse.find().populate("user").sort({ createdAt: 1 });

    const alle = luker.map(luke => ({
        luke,
        svar: besvarelser.filter(b => b.user && b.luke.equals(luke._id))
    })).filter(g => g.svar.length > 0);

    const valgt = Number(req.query.luke);
    const grupper = valgt ? alle.filter(g => g.luke.nr === valgt) : alle;

    res.render("admin/admin", {
        user: req.user,
        grupper,
        alleLuker: alle.map(g => g.luke),
        valgt
    });
});

app.post("/admin/besvarelser/:id/toggle", requireAdmin, async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.redirect("/admin"); 
    }

    const besvarelse = await Besvarelse.findById(req.params.id);

    if (besvarelse) {
        besvarelse.riktig = !besvarelse.riktig;
        await besvarelse.save();
    }

    res.redirect(req.get("Referer") || "/admin");
});

app.post("/admin/luke/:nr/trekk", requireAdmin, async (req, res) => {
    const luke = await Luke.findOne({ nr: Number(req.params.nr) });

    if (!luke) return res.redirect("/admin");   // denne beholder du

    const riktige = await Besvarelse.find({ luke: luke._id, riktig: true });

    if (riktige.length === 0) return res.redirect("/admin");   // denne beholder du

    const tilfeldig = riktige[Math.floor(Math.random() * riktige.length)];

    luke.vinner = tilfeldig.user;
    await luke.save();

    res.redirect(req.get("Referer") || "/admin");   // byttet ut
});


app.get("/luke/:nr", async (req, res) => {
    const nr = Number(req.params.nr);
    const luke = await Luke.findOne({ nr });
    const idag = new Date("2026.12.11"); 
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

    const besvarelse = await Besvarelse.findOne({user: user._id, luke: luke._id});
    const svar = besvarelse ? besvarelse.svar[0].valgtSvar : null;

    res.render("kalenderQuiz", { luke, user, dag, svar });

});


app.post("/register", async (req, res) => {
    const email = req.body.email?.trim().toLowerCase();

    let user = await User.findOne({ email });

    if (!user) {
        user = new User({
            email,
            username: email.split("@")[0]
        });
        await user.save();
    }

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

    const eksisterende = await Besvarelse.findOne({ user: user._id, luke: luke._id });

    if (!eksisterende) {
        await Besvarelse.create({
            user: user._id,
            luke: luke._id,
            svar: [{ valgtSvar: svar }]
        });
    }

    res.redirect(`/luke/${luke.nr}`);
})



app.listen(process.env.PORT);