const express = require('express');
const { body, param } = require('express-validator');
const cartController = require('../controllers/cart.controllers');
const auth = require('../middlewares/auth.middlewares');
const validator = require('../middlewares/validation.middlwares');

const cartRouter = express.Router();

cartRouter.use(auth.isLoggedIn);

cartRouter.post(
    '/:productId',
    param('productId').isMongoId(),
    body('quantity').isInt({ gt: 1 }),
    validator,
    cartController.addToCart
);
cartRouter.delete('/clear', cartController.clearCart);
cartRouter.delete(
    '/:productId',
    param('productId').isMongoId(),
    validator,
    cartController.removeFromCart
);

module.exports = cartRouter;
