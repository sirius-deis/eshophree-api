const express = require('express');
const userController = require('../controllers/user.controller');
const isLoggedIn = require('../middleware/isLoggedIn');

const userRouter = express.Router();

userRouter.post('/signup', userController.signup);
userRouter.post('/login', userController.login);
userRouter.post('/update-password', isLoggedIn, userController.updatePassword);
userRouter.get('/logout', isLoggedIn, userController.logout);
userRouter.get('/grab', isLoggedIn, userController.grabData);

userRouter.route('/delete').delete(isLoggedIn, userController.delete);

module.exports = userRouter;
