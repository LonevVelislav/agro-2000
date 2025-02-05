const router = require("express").Router();

const Admin = require("../_models/Admin");
const { extractErrorMsg } = require("../utils/errorHandler");
const { createAndSendToken } = require("../utils/userToken");

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            throw new Error("please provide username and password");
        }
        const admin = await Admin.findOne({ username }).select("+password");
        if (!admin || !(await admin.correctPassword(password, admin.password))) {
            throw new Error("incorrect username or password");
        }
        createAndSendToken(admin, 200, res);
    } catch (err) {
        res.status(401).json({
            status: "fail",
            message: extractErrorMsg(err),
        });
    }
});

module.exports = router;
