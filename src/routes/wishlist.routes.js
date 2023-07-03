const express = require('express');
const {} = require('../controllers/wishlist.controllers');

const wishlistRouter = express.Router({ mergeParams: true });

wishlistRouter.route('/').patch();

module.exports = wishlistRouter;
