const express = require('express');
const { body } = require('express-validator');
const {
    getCart,
    addToCart,
    clearCart,
    decreaseProductsInCart,
} = require('../controllers/cart.controllers');
const { isLoggedIn } = require('../middlewares/auth.middlewares');
const validator = require('../middlewares/validation.middlwares');
const { isMongoId } = require('../utils/validator');

const cartRouter = express.Router({ mergeParams: true });

cartRouter.use(isLoggedIn);

cartRouter.delete('/clear', clearCart);

cartRouter
    .route('/')
    .patch(
        isMongoId('productId'),
        body('quantity').isInt({ gt: 1 }),
        validator,
        addToCart
    )
    .delete(
        isMongoId('productId'),
        body('quantityToDelete').isInt({ gt: 0 }),
        validator,
        decreaseProductsInCart
    );

cartRouter.route('/:cartId').get(isMongoId('cartId'), validator, getCart);

module.exports = cartRouter;
