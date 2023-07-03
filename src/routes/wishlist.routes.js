const express = require('express');
const { addToWishlist, deleteFromWishlist } = require('../controllers/wishlist.controllers');
const { isLoggedIn } = require('../middlewares/auth.middlewares');
const { findProduct } = require('../middlewares/product.middlewares');

const wishlistRouter = express.Router({ mergeParams: true });

wishlistRouter.use(isLoggedIn);
wishlistRouter.use(findProduct);

wishlistRouter.route('/').patch(addToWishlist).delete(deleteFromWishlist);

module.exports = wishlistRouter;
