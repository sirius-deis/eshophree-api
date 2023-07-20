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
  updatePhoto,
} = require('../controllers/user.controllers');
const { isLoggedIn } = require('../middlewares/auth.middlewares');
const validator = require('../middlewares/validation.middlwares');
const { isEmail, isNthLength } = require('../utils/validator');
const { uploadPhoto } = require('../api/uploadFile');

const userRouter = express.Router();

userRouter.post(
  '/signup',
  isEmail(),
  isNthLength({ field: 'name', isOptional: true, min: 3, max: 30 }),
  isNthLength({ field: 'surname', isOptional: true, min: 3, max: 30 }),
  isNthLength({ field: 'password' }),
  isNthLength({ field: 'passwordConfirm' }),
  validator,
  signup,
);
userRouter.post('/login', isEmail(), isNthLength({ field: 'password' }), validator, login);
userRouter.get('/activate/:activateToken', activate);
userRouter.post(
  '/reactivate',
  isEmail(),
  isNthLength({ field: 'password' }),
  validator,
  reactivate,
);

userRouter.post('/forget-password', isEmail(), validator, forgetPassword);
userRouter.patch(
  '/reset-password/:token',
  isNthLength({ field: 'newPassword' }),
  isNthLength({ field: 'newPasswordConfirm' }),
  validator,
  resetPassword,
);

userRouter.use(isLoggedIn);

userRouter.patch(
  '/update-password',
  isNthLength({ field: 'password' }),
  isNthLength({ field: 'newPassword' }),
  isNthLength({ field: 'newPasswordConfirm' }),
  validator,
  updatePassword,
);

userRouter.patch(
  '/update-me',
  isNthLength({ field: 'name' }),
  isNthLength({ field: 'surname' }),
  validator,
  updateMe,
);
userRouter.patch('/update-info', updateUserInfo);
userRouter.patch('/update-payment', updateUserPayment);
userRouter.post('/deactivate', isNthLength({ field: 'password' }), validator, deactivate);
userRouter.get('/logout', logout);
userRouter.get('/me', me);
userRouter.patch('/photo', uploadPhoto('picture'), updatePhoto);
userRouter.delete('/delete', isNthLength({ field: 'password' }), validator, deleteAccount);

module.exports = userRouter;
