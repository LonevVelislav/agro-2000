const router = require("express").Router();
const Call = require("../_models/Call");

const { extractErrorMsg } = require("../utils/errorHandler");
const { protect, carProtect } = require("../_middlewares/authMiddleware");

router.get("/", protect, async (req, res) => {
    try {
        const calls = await Call.find().populate("car", ["number", "model"]);
        res.status(200).json({
            status: "success",
            data: {
                calls,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: extractErrorMsg(err),
        });
    }
});

router.patch("/:id", protect, async (req, res) => {
    try {
        const date = new Date();
        const time = `${
            date.getHours().length === 1 ? `${0}${date.getHours()}` : date.getHours()
        }:${date.getMinutes().length === 1 ? `${0}${date.getMinutes()}` : date.getMinutes()}`;
        const updatedCall = await Call.findByIdAndUpdate(
            req.params.id,
            { time, ...req.body },
            {
                new: true,
                runValidators: true,
            }
        );

        res.status(201).json({
            status: "success",
            data: {
                ...updatedCall,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: extractErrorMsg(err),
        });
    }
});

router.post("/:carId", carProtect, async (req, res) => {
    try {
        const call = await Call.create({
            ...req.body,
            car: req.params.carId,
        });
        res.status(200).json({
            status: "success",
            data: {
                call,
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
