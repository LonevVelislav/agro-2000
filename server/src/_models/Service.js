const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
    {
        createdAt: {
            type: Date,
            default: new Date(),
        },
        km: Number,
        type: {
            type: String,
            required: [true, "service needs a type"],
            enum: {
                values: [
                    "MOT",
                    "tax",
                    "roadtax",
                    "insurance",
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
                ],
                message: "invalid service!",
            },
            trim: true,
        },
        parts: [{ type: String }],

        info: String,
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

serviceSchema.pre("save", function (next) {
    if (this.km && this.km < 0) {
        this.km = Math.abs(this.km);
    }

    next();
});

const Service = mongoose.model("Service", serviceSchema);

module.exports = Service;
