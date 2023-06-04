const express = require('express');

const { subscribe, unsubscribe, send } = require('../controllers/subscription.controllers');
const { isEmail } = require('../utils/validator');
const validator = require('../middlewares/validation.middlwares');
const { isLoggedIn, restrictTo } = require('../middlewares/auth.middlewares');

const subscriptionRouter = express.Router();

subscriptionRouter.route('/').post(isEmail(), validator, subscribe);

subscriptionRouter.post('/send', isLoggedIn, restrictTo('admin'), send);

subscriptionRouter.route('/:token').delete(unsubscribe);

module.exports = subscriptionRouter;
