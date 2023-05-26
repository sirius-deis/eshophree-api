const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const OrderDetails = require('../models/orderDetails.models');
const OrderItems = require('../models/orderItems.models');
const OrderStatus = require('../models/orderStatus.models');

exports.addOrder = catchAsync(async (req, res, next) => {
    const user = req.user;
    const { comment, cart = [] } = req.body;
    if (cart.length < 1) {
        return next(
            new AppError("Cart can't be empty please choose products", 400)
        );
    }
    const sum = cart.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

    const orderStatus = await OrderStatus.create({
        statusCode: 'waiting',
        description: 'Some dummy text',
    });

    const orderDetails = await OrderDetails.create({
        userId: user._id,
        price: sum,
        orderStatusId: orderStatus._id,
        comment,
    });

    await OrderItems.create({
        orderId: orderDetails._id,
        productId: cart.productId,
        quantity: cart.quantity,
    });

    res.status(201).json({
        message: 'Products from cart were added to order successfully',
    });
});

exports.discardOrder = catchAsync((req, res, next) => {
    const user = req.user;
    const { orderId } = req.params;
});
