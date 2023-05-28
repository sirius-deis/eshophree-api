const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const OrderDetail = require('../models/orderDetail.models');
const OrderItem = require('../models/orderItem.models');
const OrderStatus = require('../models/orderStatus.models');

exports.getOrder = catchAsync(async (req, res, next) => {
    const user = req.user;
    const { orderId } = req.params;

    const order = await OrderDetail.findById(orderId)
        .populate('orderItems.orderItemId')
        .populate('orderStatusId');

    if (!order) {
        return next(
            new AppError(
                'There is no such order. Please check if order id is correct',
                400
            )
        );
    }

    if (!order.userId.equals(user._id)) {
        return next(
            new AppError(
                "This order is not your. You cant't get information about this order",
                400
            )
        );
    }

    res.status(200).json({
        message: 'Order was found',
        data: {
            order,
        },
    });
});

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
    const orderItems = [];
    for (let i = 0; i < cart.length; i++) {
        const orderItem = await OrderItem.create({
            productId: cart[i].productId,
            quantity: cart[i].quantity,
        });
        orderItems.push({ orderItemId: orderItem._id });
    }

    await OrderDetail.create({
        userId: user._id,
        price: sum,
        orderStatusId: orderStatus._id,
        orderItems: orderItems,
        comment,
    });

    res.status(201).json({
        message: 'Products from cart were added to order successfully',
    });
});

exports.updateOrderComment = catchAsync(async (req, res, next) => {
    const { orderId } = req.params;
    const { comment } = req.body;
    const orderDetail = await OrderDetail.findById(orderId);

    if (!orderDetail) {
        return next(
            new AppError(
                'There is no such order. Please check if order id is correct',
                400
            )
        );
    }

    await orderDetail.updateOne({ comment });

    res.status(201).json({
        message: 'Products from cart were added to order successfully',
    });
});

exports.discardOrder = catchAsync(async (req, res, next) => {
    const { orderId } = req.params;
    const orderDetail = await OrderDetail.findById(orderId);
    if (!orderDetail) {
        return next(
            new AppError(
                'There is no such order. Please check if order id is correct',
                400
            )
        );
    }
    await OrderStatus.findByIdAndDelete(orderDetail.orderStatusId);
    await OrderItem.findOneAndDelete({ orderId: OrderDetail._id });

    res.status(204).send();
});
