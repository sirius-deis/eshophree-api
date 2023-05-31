const mongoose = require('mongoose');

const OrderStatusSchema = new mongoose.Schema(
  {
    statusCode: {
      type: String,
      enum: {
        values: ['waiting', 'started', 'processing', 'completed', 'discarded'],
        message: 'Incorrect value please chose on of available values',
      },
      required: true,
    },
    description: {
      type: String,
      minlength: [5, "This field can't be less than 5 characters"],
      maxlength: [1024, "This field can't be more than 1024 characters"],
      required: true,
    },
  },
  {
    collection: 'order-statuses',
  },
);

const OrderStatus = mongoose.model('OrderStatus', OrderStatusSchema);

module.exports = OrderStatus;
