/* eslint-disable camelcase */
const { STRIPE_SECRET_KEY } = process.env;
const stripe = require('stripe')(STRIPE_SECRET_KEY);
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Cart = require('../models/cart.models');
const OrderDetail = require('../models/orderDetail.models');
const OrderItem = require('../models/orderItem.models');
const OrderStatus = require('../models/orderStatus.models');
const Product = require('../models/product.models');
const { findOption } = require('../utils/utils');

const findProductById = (products, id) => products.find((product) => id.equals(product.productId));

exports.getOrder = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { orderId } = req.params;
  const { email } = req.body;

  const order = await OrderDetail.findById(orderId)
    .populate('orderItems.orderItemId')
    .populate('orderStatusId');

  if (!order) {
    return next(new AppError('There is no such order. Please check if order id is correct', 404));
  }

  if (!user && !email) {
    return next(new AppError('Please provide email or create an account', 400));
  }
  if (!user && email) {
    if (email !== order.email) {
      return next(
        new AppError("This order is not your. You cant't get information about this order", 401),
      );
    }
  } else if (order.userId && !order.userId.equals(user._id)) {
    return next(
      new AppError("This order is not your. You cant't get information about this order", 401),
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
  const { user } = req;
  const { comment, email } = req.body;

  let { cart } = req.body;
  if (!cart && user) {
    cart = await Cart.findOne({ userId: user._id });
  }
  if (!cart || Object.keys(cart).length < 1) {
    return next(new AppError("Cart can't be empty", 400));
  }

  if (!user && !email) {
    return next(new AppError('Please provide email or create an account', 400));
  }

  const products = await Product.find({
    _id: {
      $in: cart.products.map((product) => product.productId),
    },
  });
  if (!products || products.length < 1) {
    return next(new AppError("Cart can't be empty please choose products", 400));
  }

  const orderStatus = await OrderStatus.create({
    statusCode: 'waiting',
    description: 'Some dummy text',
  });

  let sum = 0;
  const orderItems = [];
  const sessionData = [];

  for (let i = 0; i < products.length; i += 1) {
    const product = findProductById(cart.products, products[i]._id);
    const { plusToPrice } = findOption(products[i].options, product.optionNameId, product.optionId);
    const totalPrice = +products[i].price.slice(1) + plusToPrice;

    sum += totalPrice * product.quantity;

    sessionData.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: products[i].name,
          description: products[i].desc,
        },
        unit_amount: (totalPrice * 100).toFixed(0),
      },
      quantity: product.quantity,
    });

    orderItems.push(
      OrderItem.create({
        productId: products[i]._id,
        quantity: product.quantity,
      }),
    );
  }
  const orderItemsResolved = await Promise.all(orderItems);

  await OrderDetail.create({
    userId: user && user._id,
    email: !user && email,
    price: sum,
    orderStatusId: orderStatus._id,
    orderItems: orderItemsResolved.map((item) => ({ orderItemId: item._id })),
    comment,
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: user?.email || email,
    line_items: sessionData,
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/success`,
    cancel_url: `${req.protocol}://${req.get('host')}/failure`,
  });

  res.status(201).json({
    message: 'Products from cart were added to order successfully',
    session,
  });
});

exports.updateOrderComment = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { orderId } = req.params;
  const { comment, email } = req.body;

  if (!user && !email) {
    return next(new AppError('Please provide email or create an account', 400));
  }

  const order = await OrderDetail.findById(orderId);

  if (!order) {
    return next(new AppError('There is no such order. Please check if order id is correct', 404));
  }

  if (!user && email) {
    if (email !== order.email) {
      return next(new AppError("This order is not your. You cant't update this order", 401));
    }
  } else if (order.userId && !order.userId.equals(user._id)) {
    return next(
      new AppError("This order is not your. You cant't get information about this order", 401),
    );
  }

  await order.updateOne({ comment });

  res.status(200).json({
    message: 'Order comment was successfully updated',
  });
});

exports.discardOrder = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { orderId } = req.params;
  const { email } = req.body;

  if (!user && !email) {
    return next(new AppError('Please provide email or create an account', 400));
  }

  const order = await OrderDetail.findById(orderId);
  if (!order) {
    return next(new AppError('There is no such order. Please check if order id is correct', 404));
  }

  if (!user && email) {
    if (email !== order.email) {
      return next(new AppError("This order is not your. You cant't update this order", 401));
    }
  } else if (order.userId && !order.userId.equals(user._id)) {
    return next(
      new AppError("This order is not your. You cant't get information about this order", 401),
    );
  }

  await OrderStatus.findByIdAndDelete(order.orderStatusId);
  await OrderItem.findOneAndDelete({ orderId: OrderDetail._id });

  res.status(204).send();
});
