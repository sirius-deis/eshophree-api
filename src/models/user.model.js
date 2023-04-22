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
    password: {
        type: String,
        lowercase: true,
        required: [true, "password field can't be blank, please provide a password"],
    },
});

UserSchema.pre("save", () => {
    const user = this;
    bcrypt.hash(user.password, 10, (error, hash) => {
        user.password = hash;
        next();
    });
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
