const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const Cart = require('../models/cart.models');

exports.getCart = catchAsync(async (req, res, next) => {
    const { cartId } = req.params;
    const user = req.user;

    const cart = await Cart.findById(cartId).populate('products.productId');
    if (!cart) {
        return next(new AppError('There is no cart with such id', 404));
    }

    if (!user._id.equals(cart.userId)) {
        return next(new AppError("It's not your cart", 401));
    }

    res.status(200).json({ message: 'Cart was found', data: { cart } });
});

exports.addToCart = catchAsync(async (req, res) => {
    const { productId } = req.params;
    const user = req.user;
    const { quantity } = req.body;
    let cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
        cart = await Cart.create({ userId: user._id });
    }
    const index = cart.products?.findIndex(product =>
        product.productId.equals(productId)
    );
    if (index === undefined || index === -1) {
        cart.products.push({
            productId,
            quantity: quantity ?? 1,
        });
    } else {
        cart.products[index].quantity += quantity ?? 1;
    }

    await cart.save();

    res.status(201).json({ message: 'Product was successfully added to cart' });
});

exports.decreaseProductsInCart = catchAsync(async (req, res, next) => {
    const { productId } = req.params;
    const { quantityToDelete = 1 } = req.body;
    const user = req.user;
    const cart = await Cart.findOne({ userId: user._id });
    const index = cart.products?.findIndex(product =>
        product.productId.equals(productId)
    );
    if (index === undefined || index === -1) {
        return next(new AppError('There is no such product in your cart', 404));
    } else {
        const quantity = cart.products[index].quantity;
        if (quantity === 1 || quantity <= quantityToDelete) {
            cart.products.splice(index, 1);
        } else {
            cart.products[index].quantity -= 1;
        }
    }
    await cart.save();
    res.status(204).send();
});

exports.clearCart = catchAsync(async (req, res) => {
    const user = req.user;
    const cart = await Cart.findOne({ userId: user._id });
    cart.products = [];

    await cart.save();

    res.status(204).send();
});
