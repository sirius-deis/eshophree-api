const express = require('express');
// eslint-disable-next-line object-curly-newline
const {
  getCart,
  addToCart,
  clearCart,
  decreaseProductsInCart,
} = require('../controllers/cart.controllers');
const { isLoggedIn } = require('../middlewares/auth.middlewares');
const validator = require('../middlewares/validation.middlwares');
const { isMongoId, isGreaterThan } = require('../utils/validator');
const { findProduct } = require('../middlewares/product.middlewares');

const cartRouter = express.Router({ mergeParams: true });

cartRouter.use(isLoggedIn);

cartRouter.delete('/clear', clearCart);

cartRouter
  .route('/')
  .patch(
    isMongoId({ field: 'productId' }),
    isGreaterThan({ field: 'quantity', gt: 0, isOptional: true }),
    validator,
    findProduct,
    addToCart,
  )
  .delete(
    isMongoId({ field: 'productId' }),
    isGreaterThan({ field: 'quantityToDelete', gt: 0, isOptional: true }),
    validator,
    decreaseProductsInCart,
  );

cartRouter.route('/:cartId').get(isMongoId({ field: 'cartId' }), validator, getCart);

module.exports = cartRouter;
