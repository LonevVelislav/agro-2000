const router = require("express").Router();
const Car = require("../_models/Car");
const Intervals = require("../_models/Intervals");

const { extractErrorMsg } = require("../utils/errorHandler");
const { protect, carProtect } = require("../_middlewares/authMiddleware");
const { filterObjectFields } = require("../utils/filterObjectFields");
const { createAndSendToken } = require("../utils/userToken");

class CarFeatures {
    constructor(query, queryString) {
        (this.query = query), (this.queryString = queryString);
    }

    filter() {
        const queryCopy = { ...this.queryString };
        const fields = ["page", "sort", "limit", "fields"];

        fields.forEach((el) => {
            delete queryCopy[el];
        });

        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    filterFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(",").join(" ");
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select("-__v");
        }
        return this;
    }

    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 10;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);
        return this;
    }

    searchByNumber() {
        if (this.queryString.number) {
            const carNumber = this.queryString.number;
            const regex = new RegExp(carNumber, "i");
            this.query = this.query.find({ number: regex });
        }
        return this;
    }
}

router.get("/", async (req, res) => {
    try {
        const features = new CarFeatures(Car.find().sort("-km"), req.query)
            .filter()
            .filterFields()
            .paginate()
            .searchByNumber();

        const cars = await features.query;

        res.status(200).json({
            status: "success",
            results: cars.length,
            data: {
                cars,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: extractErrorMsg(err),
        });
    }
});

router.get("/:id", protect, async (req, res) => {
    try {
        const car = await Car.findById(req.params.id).populate("intervals");

        res.status(200).json({
            status: "success",
            data: {
                car,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: extractErrorMsg(err),
        });
    }
});

router.post("/register", async (req, res) => {
    try {
        const intervals = await Intervals.create({});
        const newCar = await Car.create({ ...req.body, intervals });

        createAndSendToken(newCar, 200, res);
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: extractErrorMsg(err),
        });
    }
});

router.post("/login", async (req, res) => {
    const { number, pin } = req.body;
    let string = "";

    for (let i = 0; i < number.length; i++) {
        if (/[a-z]/g.test(number[i])) {
            string += number[i].toUpperCase();
        } else {
            string += number[i];
        }
    }
    try {
        if (!number || !pin) {
            throw new Error("Provide registration number and pin!");
        }
        const car = await Car.findOne({ number: string }).select("+pin").populate("intervals");
        if (!car || !(await car.correctPin(pin, car.pin))) {
            throw new Error("Incorrect pin!");
        }
        createAndSendToken(car, 200, res);
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: extractErrorMsg(err),
        });
    }
});

router.patch("/:id", carProtect, async (req, res) => {
    try {
        const filteredObject = filterObjectFields(req.body, "number", "pin");
        const updatedCar = await Car.findByIdAndUpdate(
            req.params.id,
            {
                ...filteredObject,
            },
            {
                new: true,
                runValidators: true,
            }
        ).populate("intervals");

        res.status(201).json({
            status: "success",
            data: {
                updatedCar,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: extractErrorMsg(err),
        });
    }
});

module.exports = router;
