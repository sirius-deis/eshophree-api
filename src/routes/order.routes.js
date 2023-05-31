const express = require('express');
// eslint-disable-next-line object-curly-newline
const { getOrder, addOrder, updateOrderComment, discardOrder } = require('../controllers/order.controllers');

const { isLoggedIn } = require('../middlewares/auth.middlewares');
const { isMongoId, isNthLength } = require('../utils/validator');
const validator = require('../middlewares/validation.middlwares');

const orderRouter = express.Router();

orderRouter.use(isLoggedIn);

orderRouter.route('/').post(addOrder);

orderRouter
  .route('/:orderId')
  .get(isMongoId('orderId'), validator, getOrder)
  .patch(isMongoId('orderId'), isNthLength('comment', 5, 256), validator, updateOrderComment)
  .delete(isMongoId('orderId'), validator, discardOrder);

module.exports = orderRouter;
