const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const AppError = require('../utils/appError');
const User = require('../models/user.model');
const Cart = require('../models/cart.model');
const Token = require('../models/token.model');
const sendEmail = require('../utils/email');

const catchAsync = require('../utils/catchAsync');
const utils = require('../utils/utils');

const { JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_SALT, PORT, NODE_ENV } = process.env;

const signToken = id => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};

const checkFieldsLength = (next, ...fields) => {
    const isOk = fields.every(field => field.length >= 5);
    if (!isOk) {
        return next(
            new AppError('All fields must be at least 5 characters long', 400)
        );
    }
};

const comparePassword = (next, password1, password2) => {
    if (password1 !== password2) {
        return next(
            new AppError(
                'Passwords are not the same. Please provide correct passwords',
                400
            )
        );
    }
};

const deleteResetTokenIfExist = async userId => {
    const token = await Token.findOne({ userId });
    if (token) {
        await token.deleteOne();
    }
};

const createResetToken = async () => {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hash = await bcrypt.hash(resetToken, +BCRYPT_SALT);
    return hash;
};

const sendResponseWithNewToken = (res, statusCode, data, userId) => {
    const token = signToken(userId);
    res.cookie('token', token, {
        expires: new Date(
            Date.now() +
                parseInt(process.env.JWT_EXPIRES_IN) * 24 * 60 * 60 * 1000
        ),
    });
    res.status(statusCode).json(data);
};

exports.signup = catchAsync(async (req, res, next) => {
    const { name, surname, email, password, passwordConfirm } = req.body;

    utils.checkFieldsPresence(
        next,
        name,
        surname,
        email,
        password,
        passwordConfirm
    );
    checkFieldsLength(next, name, surname, email, password, passwordConfirm);
    comparePassword(next, password, passwordConfirm);

    const user = await User.create({
        name,
        surname,
        email,
        password,
    });
    await Cart.create({ userId: user._id, products: [] });
    res.status(201).json({ message: 'Account was successfully created' });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    utils.checkFieldsPresence(next, email, password);
    checkFieldsLength(next, email, password);

    const user = await User.findOne({ email }).select('+password -__v');
    if (!user || !(await user.checkPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 400));
    }
    user.password = undefined;

    const cart = await Cart.findOne({ userId: user._id }).select('-__v');

    sendResponseWithNewToken(
        res,
        200,
        {
            message: 'You was sign in successfully',
            data: { user, cart },
        },
        user._id
    );
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    const user = req.user;
    const { password, newPassword, newPasswordConfirm } = req.body;

    utils.checkFieldsPresence(next, password, newPassword, newPasswordConfirm);
    checkFieldsLength(next, password, newPassword, newPasswordConfirm);

    if (!(await user.checkPassword(password, user.password))) {
        throw new AppError('Incorrect password', 401);
    }

    comparePassword(next, newPassword, newPasswordConfirm);

    user.password = newPassword;
    await user.save();

    sendResponseWithNewToken(
        res,
        200,
        { message: 'Password was updated successfully' },
        user._id
    );
});

exports.forgetPassword = catchAsync(async (req, res, next) => {
    const { email } = req.body;
    utils.checkFieldsPresence(next, email);
    checkFieldsLength(next, email);

    const user = await User.findOne({ email });
    if (!user) {
        return next(new AppError('There is no user with such email', 404));
    }

    await deleteResetTokenIfExist(user._id);
    const hash = await createResetToken();
    const token = encodeURI(hash);
    await Token.create({ userId: user._id, token });
    const encodedToken = `${req.protocol}://${req.hostname}:${
        NODE_ENV === 'development' ? PORT : ''
    }${req.baseUrl}/reset-password/${token}`;
    await sendEmail('Reset token', user.email, encodedToken);
    res.status(200).json({
        message: 'Your reset token was sent on your email',
    });
});

exports.resetPassword = catchAsync(async (req, res) => {
    const { token } = req.params;
    const { newPassword, newPasswordConfirm } = req.body;

    const dbToken = await Token.findOne({ token });

    if (!dbToken) {
        return next(new AppError('Token is invalid or has expired', 400));
    }
    comparePassword(next, newPassword, newPasswordConfirm);

    const user = await User.findById(dbToken.userId).select('+password');

    if (await user.checkPassword(newPassword, user.password)) {
        return next(
            new AppError(
                "New password can't be the same as the previous one",
                400
            )
        );
    }
    user.password = newPassword;

    await user.save();
    await dbToken.deleteOne();

    res.status(200).json({ message: 'Password was changed successfully' });
});

exports.logout = catchAsync((req, res) => {
    res.clearCookie('token');
    res.status(202).json({ message: 'Successfully' });
});

exports.delete = catchAsync(async (req, res) => {
    const user = req.user;

    await user.deleteOne();
    await Cart.deleteOne({ userId: user._id });
    res.clearCookie('token');
    res.status(204).end();
});

exports.grabData = catchAsync(async (req, res) => {
    const user = req.user;
    const cart = await Cart.findOne({ userId: user._id }).populate(
        'products.productId'
    );

    return res.status(200).json({
        message: 'You was sign in successfully',
        data: { user, cart },
    });
});
