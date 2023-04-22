const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const Cart = require("../models/cart.model");

exports.addToCart = catchAsync(async (req, res) => {
    const { productId } = req.params;
    const id = req.user.id;
    const { quantity } = req.body;
    const cart = await Cart.findOne({ userId: id });
    if (!cart) {
        throw new AppError("You are not logged in", 404);
    }
    const index = cart.products?.findIndex((product) => product.productId.equals(productId));
    if (index === undefined || index === -1) {
        cart.products.push({
            productId,
            quantity: quantity ?? 1,
        });
    } else {
        cart.products[index].quantity += quantity ?? 1;
    }

    await cart.save();

    res.status(201).json({ message: "Product was successfully added to cart" });
});

exports.removeFromCart = catchAsync(async (req, res) => {
    const { productId } = req.params;
    const id = req.user.id;
    const cart = await Cart.findOne({ userId: id });
    if (!cart) {
        throw new AppError("You are not logged in", 404);
    }
    const index = cart.products?.findIndex((product) => product.productId.equals(productId));
    if (index === undefined || index === -1) {
        throw new AppError("There is no such product in your cart", 404);
    } else {
        const quantity = cart.products[index].quantity;
        if (quantity === 1) {
            cart.products.splice(index, 1);
        } else {
            cart.products[index].quantity -= 1;
        }
    }
    await cart.save();
    res.status(204).json({ message: "Product was successfully deleted from cart" });
});

exports.clearCart = catchAsync(async (req, res) => {
    //TODO:
    const id = req.user.id;
    const cart = await Cart.findOne({ userId: id });
    if (!cart) {
        throw new AppError("You are not logged in", 404);
    }
    cart.products = [];

    await cart.save();

    res.status(204).json({ message: "Cart was cleared successfully" });
});
