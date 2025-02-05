const mongoose = require("mongoose");

const intervalsSchema = new mongoose.Schema({
    oil: {
        type: Number,
        default: null,
    },
    brakes: {
        type: Number,
        default: null,
    },
    cambelts: {
        type: Number,
        default: null,
    },
    suspension: {
        type: Number,
        default: null,
    },
    engine: {
        type: Number,
        default: null,
    },
    battery: {
        type: Number,
        default: null,
    },
    tyres: {
        type: Number,
        default: null,
    },
    clutches: {
        type: Number,
        default: null,
    },
    gearbox: {
        type: Number,
        default: null,
    },
    MOT: {
        type: Number,
        default: null,
    },
    tax: {
        type: Number,
        default: null,
    },
    roadtax: {
        type: Number,
        default: null,
    },
    insurance: {
        type: Number,
        default: null,
    },
});

const Intervals = mongoose.model("Intervals", intervalsSchema);
module.exports = Intervals;
