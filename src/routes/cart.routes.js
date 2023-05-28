const express = require('express');
const { body } = require('express-validator');
const {
    addToCart,
    clearCart,
    decreaseProductsInCart,
} = require('../controllers/cart.controllers');
const { isLoggedIn } = require('../middlewares/auth.middlewares');
const validator = require('../middlewares/validation.middlwares');
const { isMongoId } = require('../utils/validator');

const cartRouter = express.Router();

cartRouter.use(isLoggedIn);

cartRouter.delete('/clear', clearCart);

cartRouter
    .route('/:productId')
    .patch(
        isMongoId('productId'),
        body('quantity').isInt({ gt: 1 }),
        validator,
        addToCart
    )
    .delete(isMongoId('productId'), validator, decreaseProductsInCart);

cartRouter.delete('/clear', clearCart);

module.exports = cartRouter;
