const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const AppError = require('../utils/appError');
const User = require('../models/user.models');
const Cart = require('../models/cart.models');
const ResetToken = require('../models/resetToken.models');
const ActivateToken = require('../models/activateToken.models');
const sendEmail = require('../api/email');

const catchAsync = require('../utils/catchAsync');

const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;

const signToken = id => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};

const arePasswordsTheSame = (next, password1, password2) => {
    if (password1 !== password2) {
        next(
            new AppError(
                'Passwords are not the same. Please provide correct passwords',
                400
            )
        );
    }
    return true;
};

const deleteResetTokenIfExist = async userId => {
    const token = await Token.findOne({ userId });
    if (token) {
        await token.deleteOne();
    }
};

const createToken = () => {
    const resetToken = crypto.randomBytes(32).toString('hex');
    return resetToken;
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

const buildLink = (req, route, token) => {
    const link = `${req.protocol}://${req.get('host')}${req.baseUrl}/${route}/${
        token ? token : ''
    }`;

    return link;
};

exports.signup = catchAsync(async (req, res, next) => {
    const { name, surname, email, password, passwordConfirm } = req.body;

    if (!arePasswordsTheSame(next, password, passwordConfirm)) {
        return;
    }

    const user = await User.create({
        name,
        surname,
        email,
        password,
    });
    await Cart.create({ userId: user._id, products: [] });
    const activateToken = createToken();
    await ActivateToken.create({ userId: user._id, token: activateToken });

    const link = buildLink(req, 'activate', activateToken);
    sendEmail('Activate token', email, 'verification', {
        link,
    });

    res.status(201).json({ message: 'Account was successfully created' });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.checkPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }
    user.password = undefined;

    const cart = await Cart.findOne({ userId: user._id });

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

//TODO:
exports.activate = catchAsync(async (req, res, next) => {});

exports.updatePassword = catchAsync(async (req, res, next) => {
    const user = req.user;
    const { password, newPassword, newPasswordConfirm } = req.body;

    if (!(await user.checkPassword(password, user.password))) {
        return next(new AppError('Incorrect password', 401));
    }

    if (!arePasswordsTheSame(next, newPassword, newPasswordConfirm)) {
        return;
    }

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

    const user = await User.findOne({ email });
    if (!user) {
        return next(new AppError('There is no user with such email', 404));
    }

    await deleteResetTokenIfExist(user._id);
    const token = await createToken();
    await ResetToken.create({ userId: user._id, token });
    const encodedToken = buildLink(req, 'reset-password', token);
    await sendEmail('Reset token', user.email, 'reset', {
        link: encodedToken,
        homeLink: buildLink(req, '/'),
    });
    res.status(200).json({
        message: 'Your reset token was sent on your email',
    });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    const { token } = req.params;
    const { newPassword, newPasswordConfirm } = req.body;

    const dbToken = await ResetToken.findOne({ token });

    if (!dbToken) {
        return next(new AppError('Token is invalid or has expired', 400));
    }
    if (!arePasswordsTheSame(next, newPassword, newPasswordConfirm)) {
        return;
    }

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

exports.logout = (req, res) => {
    res.clearCookie('token');
    res.status(202).json({ message: 'Successfully' });
};

exports.deleteAccount = catchAsync(async (req, res) => {
    const user = req.user;

    await user.deleteOne();
    await Cart.deleteOne({ userId: user._id });
    res.clearCookie('token');
    res.status(204).end();
});

exports.me = catchAsync(async (req, res) => {
    const user = req.user;
    const cart = await Cart.findOne({ userId: user._id }).populate(
        'products.productId'
    );

    user.password = undefined;

    return res.status(200).json({
        message: 'You was sign in successfully',
        data: { user, cart },
    });
});
