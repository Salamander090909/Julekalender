const mongoose = require("mongoose");

const lukeSchema = mongoose.Schema({
    nr: Number,
    klasse: String,  
    tittel: String,
    blokker: [{
        type: { type: String }, 
        tekst: String,
        url: String,
        spørsmål: String,
        svar: [String]
    }]
});

const luke = mongoose.model("luke", lukeSchema)

module.exports = luke