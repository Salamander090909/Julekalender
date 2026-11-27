const express = require("express");
const cookieParser = require("cookie-parser")
require("dotenv").config();
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")

//importerer alle modellene 
const User = require("./models/User")
const Luke = require("./models/Luke");
const Besvarelse = require("./models/Besvarelse");

const app = express()

// setter view engine til ejs
app.set("view engine", "ejs")

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(cookieParser());

mongoose.connect(process.env.MONGODB_URI); //for å connecte til mongo databasen med uri string fra .env

app.get("/", async (req, res) => {
    const luker = await Luke.find().sort({ nr: 1 });
    
    //henter ut datoen fra serveren, og sjekker om måneden er desember
    const idag = new Date("2026.12.3"); 
    const dag = idag.getMonth() === 11 ? idag.getDate() : 0;

    let user = null

    const token = req.cookies.jwt; //henter ut cookien fra requesten

    //vis brukeren har en token vil den verifisere at denne stemmer med secret keyen
    if(token) {
        try {
            const decoded = jwt.verify(token, process.env.SECRET_JWT);
            user = await User.findById(decoded.userId);
        } catch (error) {
            user = null
        }
    }

    res.render('index', { luker, dag, user });
});

app.get("/register", (req, res) => {
    const fraLuke = req.query.fra === "luke"; //sjekker om brukeren kommer fra en redirect fra en luke

    res.render("register", {fraLuke, user: null})
})

async function requireAdmin(req, res, next) {
    try {
        const token = req.cookies.jwt;
        if (!token) return res.redirect("/"); //vis brukeren ikke har en token vil den redirectes til forsiden

        const decoded = jwt.verify(token, process.env.SECRET_JWT);
        const user = await User.findById(decoded.userId); //verifiserer og finner user.id

        if (!user || user.role !== "admin") return res.redirect("/"); //vis brukeren ikke har en user eller rollen admin blir den sendt til forsiden

        req.user = user;
        next();
    } catch (error) {
        res.redirect("/");
    }
}

app.get("/admin", requireAdmin, async (req, res) => { //den kjører requireAdmin funksjonen før resten starter
    const luker = await Luke.find().sort({ nr: 1 }).populate("vinner"); //finner vinneren til alle lukene og sorter lukene etter nr 1
    const besvarelser = await Besvarelse.find().populate("user").sort({ createdAt: 1 });
    const users = await User.find();

    const alle = luker.map(luke => ({ //lager et nytt objekt for hver luke som inneholder "luke" og "svar"
        luke,
        svar: besvarelser.filter(b => b.user && b.luke.equals(luke._id)) //henter ut alle besvarelsene som passer til denne luken
    })).filter(g => g.svar.length > 0); //fjerner de som ikke har noen svar

    const valgt = Number(req.query.luke);
    const søk = (req.query.søk || "").trim().toLowerCase();

    let grupper = valgt ? alle.filter(g => g.luke.nr === valgt) : alle; //dette filterer for å vise luken som admin velger i "valgt"

    if (søk) { //den sjekker om det admin skriver inn i "søk" er noe som noen besvarelser inneholder, også viser den de.
        grupper = grupper
            .map(g => ({
                luke: g.luke,
                svar: g.svar.filter(b =>
                    b.svar.some(s =>
                        (s.valgtSvar || "").toLowerCase().includes(søk)
                    )
                )
            }))
            .filter(g => g.svar.length > 0);
    }
    

    const stats = { //sjekker hvor mange som har svart og hvor mange bruekre som er registrert
        svarTotalt: await Besvarelse.countDocuments(),
        antallBrukere: users.length
    };

    res.render("admin/admin", {
        user: req.user,
        grupper,
        alleLuker: alle.map(g => g.luke),
        valgt,
        søk: req.query.søk || "",
        users,
        stats
    });
});

app.post("/admin/besvarelser/:id/toggle", requireAdmin, async (req, res) => { //toggle er for å endre om svaret er riktig eller feil
    if (!mongoose.isValidObjectId(req.params.id)) { //sjekker om iden til objekte er valid
        return res.redirect("/admin"); 
    }

    const besvarelse = await Besvarelse.findById(req.params.id); //finner besvarelsen by ID

    if (besvarelse) {
        besvarelse.riktig = !besvarelse.riktig; //den switcher mellom før den lagrer
        await besvarelse.save();
    }

    res.redirect(req.get("Referer") || "/admin");
});

app.post("/admin/luke/:nr/trekk", requireAdmin, async (req, res) => {
    const luke = await Luke.findOne({ nr: Number(req.params.nr) });

    if (!luke) return res.redirect("/admin");

    const riktige = await Besvarelse.find({ luke: luke._id, riktig: true }); //henter ut alle svarene som er merkert riktig

    if (riktige.length === 0) return res.redirect("/admin"); 

    const tilfeldig = riktige[Math.floor(Math.random() * riktige.length)]; //trekker en tilfedig vinner ut ifra de som svarte riktig med math.random

    luke.vinner = tilfeldig.user;
    await luke.save();

    res.redirect(req.get("Referer") || "/admin"); //sendertilbake til samme side den var på
});


app.get("/luke/:nr", async (req, res) => {
    const nr = Number(req.params.nr);
    const luke = await Luke.findOne({ nr }).populate("vinner");
    const idag = new Date("2026.12.3"); 
    const dag = idag.getMonth() === 11 ? idag.getDate() : 0;

    if (!luke) {
        return res.status(404).send("Fant ikke luken"); 
    }
  
    if (luke.nr > dag) {
        return res.status(403).send("Denne luken kan ikke åpnes ennå");
    }

    const vinner = luke.vinner

    const token = req.cookies.jwt;

    if (!token) {
        return res.redirect("/register?fra=luke")
    }

    const decoded = jwt.verify(token, process.env.SECRET_JWT);

    const user = await User.findById(decoded.userId);

    if (!user) {
        return res.redirect("/register?fra=luke")
    }

    const besvarelse = await Besvarelse.findOne({user: user._id, luke: luke._id});
    const svar = besvarelse ? besvarelse.svar[0].valgtSvar : null;

    res.render("kalenderQuiz", { luke, user, dag, svar, vinner });

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


    if(user.role === "admin") {
        return res.redirect("/admin")
    } else {
        res.redirect("/");
    }
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
        let riktig = false;
        if (luke.type.includes("multiple_choice")) {
            riktig = svar === luke.correct_answer;
        }

        await Besvarelse.create({
            user: user._id,
            luke: luke._id,
            svar: [{ valgtSvar: svar }],
            riktig
        });
    }


    res.redirect(`/luke/${luke.nr}`);
})



app.listen(process.env.PORT);