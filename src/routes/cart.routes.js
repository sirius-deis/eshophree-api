const express = require('express');
const cartController = require('../controllers/cart.controller');
const auth = require('../middlewares/auth.middlewares');

const cartRouter = express.Router();

cartRouter.post('/:productId', auth.isLoggedIn, cartController.addToCart);
cartRouter.delete(
    '/:productId',
    auth.isLoggedIn,
    cartController.removeFromCart
);

cartRouter.delete('/clear', auth.isLoggedIn, cartController.clearCart);

module.exports = cartRouter;
