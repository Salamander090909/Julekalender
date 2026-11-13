const express = require("express");
require("dotenv").config();
const env = require("dotenv")


const app = express()

app.set("view engine", "ejs")

app.use(express.urlencoded({extended: true}))
app.use(express.static("public"))

app.get("/", (req, res) => {
    res.render("index")
})

app.get("/register", (req, res) => {
    res.render("register")
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