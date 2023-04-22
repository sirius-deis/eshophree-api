const jwt = require("jsonwebtoken");

const AppError = require("../utils/appError");
const User = require("../models/user.model");

const catchAsync = require("../utils/catchAsync");

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const { name, surname, email, password, passwordConfirm } = req.body;
    if (password !== passwordConfirm) {
        throw new AppError("Passwords are different", 400);
    }
    await User.create({
        name,
        surname,
        email,
        password,
    });
    res.status(201).json({ message: "Account was successfully created" });
});

exports.login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    if (!email && !password) {
        throw new AppError("Email and password are required", 400);
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.checkPassword(password, user.password))) {
        throw new AppError("Incorrect email or password", 400);
    }
    res.cookie("token", signToken(user._id), {
        expires: new Date(Date.now() + parseInt(process.env.JWT_EXPIRES_IN) * 24 * 60 * 60 * 1000),
    });
    return res.status(200).json({ message: "You was sign in successfully", data: user });
});

exports.logout = (req, res) => {
    res.clearCookie("token");
    res.status(202).end();
};

exports.delete = catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        throw new AppError("Unknown user id", 404);
    }
    await User.deleteOne({ _id: req.params.id });
    res.status(204).end();
});
