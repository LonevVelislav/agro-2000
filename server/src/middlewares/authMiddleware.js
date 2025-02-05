const jwt = require("jsonwebtoken");
const User = require("../_models/User");
const Machine = require("../_models/Machine");
const { promisify } = require("util");
const { extractErrorMsg } = require("../utils/extractErrorMsg");

exports.protect = async (req, res, next) => {
    let token;
    try {
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token) {
            throw new Error("login to get access !");
        }
        const decoded = await promisify(jwt.verify)(token, process.env.SECRET);
        const currentUser = await User.findById(decoded.id);

        if (!currentUser) {
            throw new Error("user does not exist !");
        }

        req.user = currentUser;

        next();
    } catch (err) {
        res.status(401).json({
            status: "fail",
            message: extractErrorMsg(err),
        });
    }
};

exports.restrict = (...roles) => {
    return async (req, res, next) => {
        try {
            if (!roles.includes(req.user.role)) {
                throw new Error("no permission for this action !");
            }
            next();
        } catch (err) {
            res.status(403).json({
                status: "fail",
                message: extractErrorMsg(err),
            });
        }
    };
};

exports.restrictToOnwer = async (req, res, next) => {
    try {
        const machine = await Machine.findById(req.params.id);
        if (!machine) {
            throw new Error("machine does not exist !");
        }
        const isOwner = req.user._id.toString() === machine.owner._id.toString();
        if (isOwner === true || req.user.role === "admin") {
            next();
        } else {
            throw new Error("your not the owner of this item !");
        }
    } catch (err) {
        res.status(403).json({
            status: "fail",
            message: extractErrorMsg(err),
        });
    }
};
