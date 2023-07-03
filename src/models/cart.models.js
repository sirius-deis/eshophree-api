const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: 'user',
      required: [true, "This field can't be empty. Please provide valid id od exiting user"],
      unique: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          required: [true, "This field can't be empty. Please provide id of exiting product"],
          ref: 'Product',
        },
        quantity: {
          type: Number,
          required: [true, "This field can't be empty"],
          min: 1,
          default: 1,
        },
        color: {
          type: String,
          required: true,
        },
        optionNameId: {
          type: mongoose.Types.ObjectId,
        },
        optionId: {
          type: mongoose.Types.ObjectId,
        },
      },
    ],
  },
  {
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
      },
    },
  },
);

const Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart;
