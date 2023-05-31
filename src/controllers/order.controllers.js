/* eslint-disable camelcase */
const { STRIPE_SECRET_KEY } = process.env;
const stripe = require('stripe')(STRIPE_SECRET_KEY);
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Cart = require('../models/cart.models');
const OrderDetail = require('../models/orderDetail.models');
const OrderItem = require('../models/orderItem.models');
const OrderStatus = require('../models/orderStatus.models');

exports.getOrder = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { orderId } = req.params;

  const order = await OrderDetail.findById(orderId).populate('orderItems.orderItemId').populate('orderStatusId');

  if (!order) {
    return next(new AppError('There is no such order. Please check if order id is correct', 400));
  }

  if (!order.userId.equals(user._id)) {
    return next(new AppError("This order is not your. You cant't get information about this order", 400));
  }

  res.status(200).json({
    message: 'Order was found',
    data: {
      order,
    },
  });
});

exports.addOrder = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { comment } = req.body;
  const cart = await Cart.findOne({ userId: user._id }).populate('products.productId');
  const { products } = cart;
  if (!products || products.length < 1) {
    return next(new AppError("Cart can't be empty please choose products", 400));
  }
  // eslint-disable-next-line max-len
  const sum = products.reduce((acc, curr) => acc + curr.productId.price.slice(1) * curr.quantity, 0);

  const orderStatus = await OrderStatus.create({
    statusCode: 'waiting',
    description: 'Some dummy text',
  });
  const orderItems = [];

  for (let i = 0; i < products.length; i += 1) {
    orderItems.push(
      OrderItem.create({
        productId: products[i].productId,
        quantity: products[i].quantity,
      }),
    );
  }

  const orderItemsResolved = await Promise.all(orderItems);

  await OrderDetail.create({
    userId: user._id,
    price: sum,
    orderStatusId: orderStatus._id,
    orderItems: orderItemsResolved.map((item) => ({ orderItemId: item._id })),
    comment,
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: user.email,
    line_items: products.map((product) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: product.productId.name,
          description: product.productId.desc,
        },
        unit_amount: (product.productId.price.slice(1) * 100).toFixed(0),
      },
      quantity: product.quantity,
    })),
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/checkout`,
    cancel_url: `${req.protocol}://${req.get('host')}/checkout`,
  });

  res.status(201).json({
    message: 'Products from cart were added to order successfully',
    session,
  });
});

exports.updateOrderComment = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const { comment } = req.body;
  const orderDetail = await OrderDetail.findById(orderId);

  if (!orderDetail) {
    return next(new AppError('There is no such order. Please check if order id is correct', 400));
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
    return next(new AppError('There is no such order. Please check if order id is correct', 400));
  }
  await OrderStatus.findByIdAndDelete(orderDetail.orderStatusId);
  await OrderItem.findOneAndDelete({ orderId: OrderDetail._id });

  res.status(204).send();
});
