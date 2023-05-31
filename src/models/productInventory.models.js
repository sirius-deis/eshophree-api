const mongoose = require('mongoose');

const ProductInventorySchema = new mongoose.Schema(
  {
    stock: {
      type: Number,
      min: [0, "This field can't contain negative value"],
      required: [true, 'This field is required'],
    },
  },
  {
    collection: 'product-inventory',
  },
);

const ProductInventory = mongoose.model('ProductInventory', ProductInventorySchema);

module.exports = ProductInventory;
