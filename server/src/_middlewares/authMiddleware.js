const jwt = require("jsonwebtoken");
const Admin = require("../_models/Admin");
const Car = require("../_models/Car");

const { promisify } = require("util");
const { extractErrorMsg } = require("../utils/errorHandler");

exports.protect = async (req, res, next) => {
    let token;

    try {
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            throw new Error("Your not logged in! Please log in to get access");
        }
        const decoded = await promisify(jwt.verify)(token, process.env.SECRET);
        const currentAdmin = await Admin.findById(decoded.id);

        if (!currentAdmin) {
            throw new Error("Unauthorized!");
        }

        req.admin = currentAdmin;
        console.log(req.admin);

        next();
    } catch (err) {
        res.status(401).json({
            status: "fail",
            message: extractErrorMsg(err),
        });
    }
};

exports.carProtect = async (req, res, next) => {
    let token;

    try {
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token) {
            throw new Error("Unauthorized!");
        }
        const decoded = await promisify(jwt.verify)(token, process.env.SECRET);
        const currentCar = await Car.findById(decoded.id);
        const currentAdmin = await Admin.findById(decoded.id);

        if (!currentCar && !currentAdmin) {
            throw new Error("The user belonging to the token does no longer exists!");
        }
        if (currentAdmin) {
            req.admin = currentAdmin;
        }
        if (currentCar) {
            req.car = currentCar;
        }

        next();
    } catch (err) {
        res.status(401).json({
            status: "fail",
            message: extractErrorMsg(err),
        });
    }
};
