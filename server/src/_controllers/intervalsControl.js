const router = require("express").Router();
const Intervals = require("../_models/Intervals");
const Car = require("../_models/Car");
const { extractErrorMsg } = require("../utils/errorHandler");
const { protect, carProtect } = require("../_middlewares/authMiddleware");

router.patch("/:id", carProtect, async (req, res) => {
    try {
        await Intervals.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        const car = await Car.findOne({ intervals: req.params.id }).populate("intervals");

        res.status(201).json({
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

module.exports = router;
