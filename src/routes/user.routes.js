const express = require('express');
const userController = require('../controllers/user.controller');
const auth = require('../middlewares/auth.middlewares');

const userRouter = express.Router();

userRouter.post('/signup', userController.signup);
userRouter.post('/login', userController.login);
userRouter.post('/forget-password', userController.forgetPassword);
userRouter.post(
    '/update-password',
    auth.isLoggedIn,
    userController.updatePassword
);
userRouter.post('/reset-password/:token', userController.resetPassword);

userRouter.get('/logout', auth.isLoggedIn, userController.logout);
userRouter.get('/grab', auth.isLoggedIn, userController.grabData);

userRouter.route('/delete').delete(auth.isLoggedIn, userController.delete);

module.exports = userRouter;
