const router = require("express").Router();

router.get("/", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "agro-2000 api",
    });
});

router.get("/404", (req, res) => {
    res.status(404).json({
        status: "fail",
        message: "invalid path!",
    });
});

module.exports = router;
