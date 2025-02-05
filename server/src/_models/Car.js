const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const carSchema = new mongoose.Schema(
    {
        createdAt: {
            type: Date,
            default: new Date(),
        },
        number: {
            type: String,
            required: [true, "registration number not specified!"],
            minLength: [8, "registration number must be of 8 symbols!"],
            maxLength: [8, "registration number must be of 8 symbols!"],
            unique: true,
            trim: true,
            validate: {
                validator: function (value) {
                    const regex = /^[A-Za-z]{2}\d{4}[A-Za-z]{2}$/;
                    return regex.test(value);
                },
                message: "Ivalid registration!",
            },
        },
        pin: {
            type: String,
            required: [true, "pin number not specified!"],
            minLength: [4, "pin must be 4 numbers!"],
            maxLength: [4, "pin must be 4 numbers!"],
            trim: true,
            validate: {
                validator: function (value) {
                    return isNaN(Number(value)) === false && Number(value) % 1 === 0;
                },
                message: "Ivalid pin!",
            },
            select: false,
        },

        model: {
            type: String,
            trim: true,
        },
        engine: {
            type: String,
            trim: true,
        },
        km: {
            type: Number,
        },
        intervals: {
            type: mongoose.Schema.ObjectId,
            ref: "Intervals",
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);
carSchema.pre("save", async function (next) {
    if (this.isNew) {
        this.number = this.number.toUpperCase();
        this.pin = await bcrypt.hash(this.pin, 10);
    }
    next();
});

carSchema.pre(/^find/, async function (next) {
    if (this.op === "findOneAndUpdate") {
        const carId = this._conditions._id;

        const carServices = await mongoose.model("Service").find({ car: carId }).sort("-km");
        if (carServices.length > 0) {
            if (this._update.km && this._update.km < carServices[0].km) {
                this._update.km = await mongoose.model("Car").find({ _id: carId }).km;
            }
        }

        if (this._update.km && this._update.km < 0) {
            this._update.km = Math.abs(this._update.km);
        }
    }
    next();
});

carSchema.methods.correctPin = async function (incomingPin, correctPin) {
    return await bcrypt.compare(incomingPin, correctPin);
};

const Car = mongoose.model("Car", carSchema);

module.exports = Car;
