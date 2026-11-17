const mongoose = require("mongoose");

const besvarelseSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    },

    luke: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "luke",
        require: true
    },

    svar: [{
        blokkIndex: Number,
        valgtSvar: String
    }]
})

const Besvarelse = mongoose.model("besvarelse", besvarelseSchema);

module.exports = Besvarelse;