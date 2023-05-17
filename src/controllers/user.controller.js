const jwt = require('jsonwebtoken');

const AppError = require('../utils/appError');
const User = require('../models/user.model');
const Cart = require('../models/cart.model');

const catchAsync = require('../utils/catchAsync');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const checkFieldsPresence = (...fields) => {
    const isOk = fields.every(field => field);
    if (!isOk) {
        throw new AppError('Please provide all fields with correct data', 400);
    }
};

const checkFieldsLength = (...fields) => {
    const isOk = fields.every(field => field.length >= 5);
    if (!isOk) {
        throw new AppError(
            'All fields must be at least 5 characters long',
            400
        );
    }
};

const checkPassword = (password1, password2) => {
    if (password1 !== password2) {
        throw new AppError(
            'Passwords are not the same. Please provide correct passwords',
            400
        );
    }
};

exports.signup = catchAsync(async (req, res) => {
    const { name, surname, email, password, passwordConfirm } = req.body;

    checkFieldsPresence(name, surname, email, password, passwordConfirm);
    checkFieldsLength(name, surname, email, password, passwordConfirm);
    checkPassword(password, passwordConfirm);

    const user = await User.create({
        name,
        surname,
        email,
        password,
    });
    await Cart.create({ userId: user._id, products: [] });
    res.status(201).json({ message: 'Account was successfully created' });
});

exports.login = catchAsync(async (req, res) => {
    const { email, password } = req.body;

    checkFieldsPresence(email, password);
    checkFieldsLength(email, password);

    const user = await User.findOne({ email }).select('+password -__v');
    if (!user || !(await user.checkPassword(password, user.password))) {
        throw new AppError('Incorrect email or password', 400);
    }
    user.password = undefined;
    res.cookie('token', signToken(user._id), {
        expires: new Date(
            Date.now() +
                parseInt(process.env.JWT_EXPIRES_IN) * 24 * 60 * 60 * 1000
        ),
    });
    const cart = await Cart.findOne({ userId: user._id }).select('-__v');
    return res.status(200).json({
        message: 'You was sign in successfully',
        data: { user, cart },
    });
});

exports.updatePassword = catchAsync(async (req, res) => {
    const { id } = req.user;
    const { password, newPassword, newPasswordConfirm } = req.body;

    checkFieldsPresence(password, newPassword, newPasswordConfirm);
    checkFieldsLength(password, newPassword, newPasswordConfirm);

    const user = await User.findById(id).select('+password -__v');
    if (!user) {
        throw new AppError('User with such id was not found', 404);
    }
    if (!(await user.checkPassword(password, user.password))) {
        throw new AppError('Incorrect password', 401);
    }
    checkPassword(newPassword, newPasswordConfirm);

    user.password = newPassword;
    await user.save();

    return res
        .status(200)
        .json({ message: 'Password was updated successfully' });
});

exports.forgetPassword = catchAsync(async (req, res) => {
    const { email } = req.body;
    checkFieldsPresence(email);
    checkFieldsLength(email);

    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError('There is no user with such email', 404);
    }

    res.status(200).json({
        message: 'Your reset token was sent on your email',
    });
});

exports.logout = catchAsync((req, res) => {
    const { id } = req.user;
    if (!id) {
        throw new AppError(
            'You must be logged in to perform this operation',
            404
        );
    }
    res.clearCookie('token');
    res.status(202).json({ message: 'Successfully' });
});

exports.delete = catchAsync(async (req, res) => {
    const { id } = req.user;
    if (!id) {
        throw new AppError('Unknown user id', 404);
    }
    await User.deleteOne({ _id: id });
    await Cart.deleteOne({ userId: id });
    res.clearCookie('token');
    res.status(204).end();
});

exports.grabData = catchAsync(async (req, res) => {
    const { id } = req.user;
    const user = await User.findById({ _id: id });
    if (!user) {
        throw new AppError('Unknown user id', 404);
    }
    const cart = await Cart.findOne({ userId: user._id }).populate(
        'products.productId'
    );

    return res.status(200).json({
        message: 'You was sign in successfully',
        data: { user, cart },
    });
});
