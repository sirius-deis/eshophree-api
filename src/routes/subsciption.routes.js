const express = require('express');

const subscriptionController = require('../controllers/subscription.controllers');
const { isEmail } = require('../utils/validator');
const validator = require('../middlewares/validation.middlwares');

const subscriptionRouter = express.Router();

subscriptionRouter.route('/').post(isEmail, validator, subscriptionController);

subscriptionRouter.route('/:token').post(subscriptionRouter);

module.exports = subscriptionRouter;
