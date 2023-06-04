const express = require('express');
// eslint-disable-next-line object-curly-newline
const { getOrder, addOrder, updateOrderComment, discardOrder } = require('../controllers/order.controllers');

const { getUser } = require('../middlewares/auth.middlewares');
const { isMongoId, isNthLength } = require('../utils/validator');
const validator = require('../middlewares/validation.middlwares');

const orderRouter = express.Router();

orderRouter.use(getUser);

orderRouter.route('/').post(validator, addOrder);

orderRouter
  .route('/:orderId')
  .get(isMongoId({ field: 'orderId' }), validator, getOrder)
  .patch(
    isMongoId({ field: 'orderId' }),
    isNthLength({ field: 'comment', min: 4, max: 256 }),
    validator,
    updateOrderComment,
  )
  .delete(isMongoId({ field: 'orderId' }), validator, discardOrder);

module.exports = orderRouter;
