const mongoose = require("mongoose");

const detailsShema = new mongoose.Schema({
    engine: { type: String, trim: true, default: null },
    horsepower: { type: Number, trim: true, default: null },
    transmission: {
        type: String,
        trim: true,
        default: null,
        enum: {
            values: [
                "IVT-autopower",
                "Powershift",
                "CommandQuad",
                "AutoPower",
                "DirectDrive",
                "SynchroTransmission",
                "ElectroIVT",
                "PowerQuad-AutoQuad",
            ],
            message: "invalid transmission !",
        },
    },
    hydraulicPumps: {
        type: String,
        trim: true,
        default: null,
    },
    frontTires: {
        type: String,
        trim: true,
        default: null,
    },
    rearTires: {
        type: String,
        trim: true,
        default: null,
    },
    hours: { type: Number, trim: true, default: null },
    status: {
        type: String,
        trim: true,
        default: null,
    },
    year: { type: Number, trim: true, default: null },
    scv: {
        type: Number,
        trim: true,
        default: null,
    },
    description: { type: String, trim: true, default: null },
});

const machineSchema = new mongoose.Schema({
    type: {
        type: String,
        required: [true, "what type of a machine !"],
        trim: true,
        enum: {
            values: ["tractor", "harvester"],
            message: "invalid type !",
        },
    },
    make: {
        type: String,
        required: [true, "make field empty !"],
        trim: true,
    },
    model: {
        type: String,
        trim: true,
        required: [true, "model field empty !"],
    },
    price: {
        type: Number,
        trim: true,
        default: null,
    },
    priceEU: {
        type: Number,
        trim: true,
    },
    currency: {
        type: String,
        trim: true,
        default: "BGN",
        enum: {
            values: ["BGN", "EUR"],
            message: "invalid currency !",
        },
    },

    createdAt: {
        type: Date,
        default: Date.now(),
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
    },

    phone: {
        type: String,
        trim: true,
        default: null,
    },
    email: {
        type: String,
        trim: true,
        default: null,
    },
    details: { type: detailsShema, default: {} },

    images: {
        type: [String],
        required: true,
        default: [],
    },
    files: {
        type: [String],
        required: true,
        default: [],
    },
    videos: {
        type: [String],
        required: true,
        default: [],
    },
});

const Machine = mongoose.model("Machine", machineSchema);
module.exports = Machine;
