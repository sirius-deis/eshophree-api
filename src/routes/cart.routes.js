const express = require('express');
const cartController = require('../controllers/cart.controllers');
const auth = require('../middlewares/auth.middlewares');

const cartRouter = express.Router();

cartRouter.use(auth.isLoggedIn);

cartRouter.post('/:productId', cartController.addToCart);
cartRouter.delete('/clear', cartController.clearCart);
cartRouter.delete('/:productId', cartController.removeFromCart);

module.exports = cartRouter;
