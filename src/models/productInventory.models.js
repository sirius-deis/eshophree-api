const mongoose = require('mongoose');

const ProductInventorySchema = new mongoose.Schema(
    {
        stock: {
            type: Int,
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
