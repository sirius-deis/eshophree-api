const express = require('express');
const userController = require('../controllers/user.controllers');
const auth = require('../middlewares/auth.middlewares');
const validator = require('../middlewares/validation.middlwares');
const { isEmail, isNthLength } = require('../utils/validator');

const userRouter = express.Router();

userRouter.post(
    '/signup',
    isEmail(),
    isNthLength('name', 3, 30),
    isNthLength('surname', 3, 30),
    isNthLength('password'),
    isNthLength('passwordConfirm'),
    validator,
    userController.signup
);
userRouter.post(
    '/login',
    isEmail(),
    isNthLength('password'),
    validator,
    userController.login
);
userRouter.post(
    '/reset-password/:token',
    isNthLength('newPassword'),
    isNthLength('newPasswordConfirm'),
    validator,
    userController.resetPassword
);

userRouter.use(auth.isLoggedIn);

userRouter.post(
    '/forget-password',
    isEmail(),
    validator,
    userController.forgetPassword
);
userRouter.post(
    '/update-password',
    isNthLength('password'),
    isNthLength('newPassword'),
    isNthLength('newPasswordConfirm'),
    validator,
    userController.updatePassword
);
userRouter.get('/logout', userController.logout);
userRouter.get('/grab', userController.grabData);
userRouter.delete('/delete', userController.delete);

module.exports = userRouter;
