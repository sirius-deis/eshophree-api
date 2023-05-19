const express = require('express');
const userController = require('../controllers/user.controllers');
const auth = require('../middlewares/auth.middlewares');

const userRouter = express.Router();

userRouter.post('/signup', userController.signup);
userRouter.post('/login', userController.login);
userRouter.post('/reset-password/:token', userController.resetPassword);

userRouter.use(auth.isLoggedIn);

userRouter.post('/forget-password', userController.forgetPassword);
userRouter.post('/update-password', userController.updatePassword);
userRouter.get('/logout', userController.logout);
userRouter.get('/grab', userController.grabData);
userRouter.delete('/delete', userController.delete);

module.exports = userRouter;
