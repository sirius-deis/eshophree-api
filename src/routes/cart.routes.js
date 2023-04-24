const express = require("express");
const cartController = require("../controllers/cart.controller");
const isLoggedIn = require("../middleware/isLoggedIn");

const cartRouter = express.Router();

cartRouter.post("/", isLoggedIn, cartController.addToCart);
cartRouter.delete("/:productId", isLoggedIn, cartController.removeFromCart);

cartRouter.delete("/clear", isLoggedIn, cartController.clearCart);

module.exports = cartRouter;
