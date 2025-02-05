const mongoose = require("mongoose");

const callSchema = new mongoose.Schema(
    {
        time: {
            type: String,
        },
        service: {
            type: String,
            enum: {
                values: [
                    "brakes",
                    "clutches",
                    "engine",
                    "exhaust",
                    "suspension",
                    "tyres",
                    "diagnostics",
                    "battery",
                    "gearbox",
                    "cambelts",
                    "oil",
                    "cooling",
                    "repairs",
                    "chassie",
                    "steering",
                    "MOT",
                ],
                message: "invalid service!",
            },
            required: [true, "define a service!"],
            trim: true,
        },
        status: {
            type: String,
            default: "pending",
            enum: {
                values: ["pending", "active", "finished"],
                message: "invalid status",
            },
            trim: true,
        },
        car: {
            type: mongoose.Schema.ObjectId,
            ref: "Car",
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

const Call = mongoose.model("Call", callSchema);

module.exports = Call;
