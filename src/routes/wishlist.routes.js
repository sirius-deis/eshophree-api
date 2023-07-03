const express = require('express');
const { addToWishlist } = require('../controllers/wishlist.controllers');
const { isLoggedIn } = require('../middlewares/auth.middlewares');

const wishlistRouter = express.Router({ mergeParams: true });

wishlistRouter.use(isLoggedIn);

wishlistRouter.route('/').patch(addToWishlist);

module.exports = wishlistRouter;
