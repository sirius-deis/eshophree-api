const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "name field can't be blank, please provide your real name"],
    },
    surname: {
        type: String,
        required: [true, "surname field can't be blank, please provide your real name"],
    },
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: [true, "email field can't be blank, please provide an email address"],
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    password: {
        type: String,
        required: [true, "password field can't be blank, please provide a password"],
        minlength: 8,
        select: false,
    },
    passwordChangedAt: {
        type: Date,
        select: false,
    },
});

UserSchema.pre("save", async function (next) {
    if (this.isModified("password") || this.isNew) {
        return next();
    }
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

UserSchema.methods.checkPassword = async (assumedPassword, userPassword) => {
    return await bcrypt.compare(assumedPassword, userPassword);
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
