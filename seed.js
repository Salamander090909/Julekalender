require("dotenv").config();
const mongoose = require("mongoose");
const Luke = require("./models/Luke");
const luker = require("./luker.json");

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI);

    const antall = await Luke.countDocuments();
    if (antall > 0) {
        console.log("Det finnes allerede", antall, "luker. Avbryter.");
    } else {
        await Luke.insertMany(luker);
        console.log("Importerte", luker.length, "luker");
    }

    await mongoose.disconnect();
}

seed();