const express = require("express");
const cartController = require("../controllers/cart.controller");
const isLoggedIn = require("../middleware/isLoggedIn");

const cartRouter = express.Router({ mergeParams: true });

cartRouter.route("/").post(isLoggedIn, cartController.addToCart).delete(isLoggedIn, cartController.removeFromCart);

cartRouter.delete("/clear", isLoggedIn, cartController.clearCart);

module.exports = cartRouter;
