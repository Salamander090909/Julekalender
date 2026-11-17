const mongoose = require("mongoose");

const besvarelseSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    luke: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Luke",
        required: true
    },

    svar: [{
        blokkIndex: Number,
        valgtSvar: String
    }]

}, { timestamps: true });

besvarelseSchema.index({ user: 1, luke: 1 }, { unique: true });

const Besvarelse = mongoose.model("Besvarelse", besvarelseSchema);

module.exports = Besvarelse;