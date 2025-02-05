const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "email is required !"],
        trim: true,
        lowercase: true,
        unique: true,
        validate: {
            validator: function (value) {
                return validator.isEmail(value);
            },
            message: "email not valid !",
        },
    },
    password: {
        type: String,
        required: [true, "password is required !"],
        minlength: [8, "password must be above 7 characters long !"],
        trim: true,
        select: false,
    },
    timeEdited: {
        type: Date,
        default: Date.now(),
    },
    role: {
        type: String,
        trim: true,
        default: "user",
    },
});

//virtuals
userSchema.virtual("confirmPassword").set(function (value) {
    if (this.password !== value) {
        throw new Error("passwords must match !");
    }
});

//pre save methods
userSchema.pre("save", async function (next) {
    this.password = await bcrypt.hash(this.password, 12);

    next();
});

//methods
userSchema.methods.correctPassword = async function (incomingPassword, correctPassword) {
    return await bcrypt.compare(incomingPassword, correctPassword);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
