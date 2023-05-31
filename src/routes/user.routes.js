const express = require('express');
const {
  signup,
  login,
  resetPassword,
  forgetPassword,
  updatePassword,
  logout,
  me,
  deleteAccount,
  activate,
  deactivate,
  updateMe,
  reactivate,
  updateUserInfo,
  updateUserPayment,
} = require('../controllers/user.controllers');
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
  signup,
);
userRouter.post('/login', isEmail(), isNthLength('password'), validator, login);
userRouter.get('/activate/:activateToken', activate);
userRouter.post('/reactivate', isEmail(), isNthLength('password'), validator, reactivate);

userRouter.post('/forget-password', isEmail(), validator, forgetPassword);
userRouter.patch(
  '/reset-password/:token',
  isNthLength('newPassword'),
  isNthLength('newPasswordConfirm'),
  validator,
  resetPassword,
);

userRouter.use(auth.isLoggedIn);

userRouter.patch(
  '/update-password',
  isNthLength('password'),
  isNthLength('newPassword'),
  isNthLength('newPasswordConfirm'),
  validator,
  updatePassword,
);

userRouter.patch('/update-me', isNthLength('name'), isNthLength('surname'), validator, updateMe);
userRouter.patch('/update-info', updateUserInfo);
userRouter.patch('/update-payment', updateUserPayment);
userRouter.post('/deactivate', isNthLength('password'), validator, deactivate);
userRouter.get('/logout', logout);
userRouter.get('/me', me);
userRouter.delete('/delete', isNthLength('password'), validator, deleteAccount);

module.exports = userRouter;
