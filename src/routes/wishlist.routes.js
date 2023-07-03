const express = require('express');
const {
  addToWishlist,
  deleteFromWishlist,
  clearWishlist,
} = require('../controllers/wishlist.controllers');
const { isLoggedIn } = require('../middlewares/auth.middlewares');
const { findProduct } = require('../middlewares/product.middlewares');

const wishlistRouter = express.Router({ mergeParams: true });

wishlistRouter.use(isLoggedIn);
wishlistRouter.use(findProduct);

wishlistRouter.route('/').delete(clearWishlist);

wishlistRouter.patch('/add', addToWishlist);

wishlistRouter.patch('/delete', deleteFromWishlist);

module.exports = wishlistRouter;
