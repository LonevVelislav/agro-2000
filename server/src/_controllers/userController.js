const router = require("express").Router();
const User = require("../_models/User");

const { extractErrorMsg } = require("../utils/extractErrorMsg");
const { createAndSendToken } = require("../utils/jwtToken");

//register user
router.post("/register", async (req, res) => {
    console.log(req.body);
    try {
        const newUser = await User.create({
            email: req.body.email,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword,
        });
        console.log(newUser);
        createAndSendToken(newUser, 200, res);
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: extractErrorMsg(err),
        });
    }
});

//login user
router.post("/login", async (req, res) => {
    console.log(req.body);
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new Error("proveide email or password !");
        }

        const user = await User.findOne({ email }).select("+password");
        if (!user || !(await user.correctPassword(password, user.password))) {
            throw new Error("incorrect email or password !");
        }

        createAndSendToken(user, 200, res);
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: extractErrorMsg(err),
        });
    }
});

module.exports = router;
