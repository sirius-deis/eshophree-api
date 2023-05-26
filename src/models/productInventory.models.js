const mongoose = require('mongoose');

const ProductInventorySchema = new mongoose.Schema(
    {
        stock: {
            type: Number,
        },
    },
    {
        collection: 'product-inventory',
    }
);

const ProductInventory = mongoose.model(
    'ProductInventory',
    ProductInventorySchema
);

module.exports = ProductInventory;
