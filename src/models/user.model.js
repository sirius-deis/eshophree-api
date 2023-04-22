const bcrypt = require("bcrypt");
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
        lowercase: true,
        required: [true, "password field can't be blank, please provide a password"],
    },
    passwordChangedAt: Date,
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
    const user = this;
    const hash = await bcrypt.hash(user.password, 10);
    user.password = hash;
    next();
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
