const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "username is required!"],
        trim: true,
        maxLength: [5, "username is too long, 10 characters max"],
    },
    password: {
        type: String,
        required: [true, "password is required!"],
        minlength: [5, "password must be at least 5 characters long"],
        trim: true,
        select: false,
    },
});

adminSchema.pre("save", async function (next) {
    this.password = await bcrypt.hash(this.password, 12);
    next();
});
adminSchema.methods.correctPassword = async function (incomingPassword, correctPassword) {
    return await bcrypt.compare(incomingPassword, correctPassword);
};

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
