const mongoose = require('mongoose');

const ProductInventorySchema = new mongoose.Schema({
    quantity: {
        type: Int,
    },
});

const ProductInventory = mongoose.model(
    'ProductInventory',
    ProductInventorySchema
);

module.exports = ProductInventory;
