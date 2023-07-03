const express = require('express');
const {
  getWishlist,
  addToWishlist,
  deleteFromWishlist,
  clearWishlist,
} = require('../controllers/wishlist.controllers');
const { isLoggedIn } = require('../middlewares/auth.middlewares');
const { findProduct } = require('../middlewares/product.middlewares');

const wishlistRouter = express.Router({ mergeParams: true });

wishlistRouter.use(isLoggedIn);
wishlistRouter.use(findProduct);

wishlistRouter.route('/').get(getWishlist).delete(clearWishlist);

wishlistRouter.patch('/add', addToWishlist);

wishlistRouter.patch('/delete', deleteFromWishlist);

module.exports = wishlistRouter;
