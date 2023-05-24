const express = require('express');
const { body } = require('express-validator');
const {
    addToCart,
    clearCart,
    removeFromCart,
} = require('../controllers/cart.controllers');
const auth = require('../middlewares/auth.middlewares');
const validator = require('../middlewares/validation.middlwares');
const { isMongoId } = require('../utils/validator');

const cartRouter = express.Router();

cartRouter.use(auth.isLoggedIn);

cartRouter.post(
    '/:productId',
    isMongoId('productId'),
    body('quantity').isInt({ gt: 1 }),
    validator,
    addToCart
);
cartRouter.delete('/clear', clearCart);
cartRouter.delete(
    '/:productId',
    isMongoId('productId'),
    validator,
    removeFromCart
);

module.exports = cartRouter;
