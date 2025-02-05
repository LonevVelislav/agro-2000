const router = require("express").Router();

router.get("/", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "For all cars try 'http://localhost:5010/car-service/cars'",
    });
});

router.get("/404", (req, res) => {
    res.status(404).json({
        status: "fail",
        message: "path is invalid!",
    });
});

module.exports = router;
