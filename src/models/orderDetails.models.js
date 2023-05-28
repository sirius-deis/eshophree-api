const mongoose = require('mongoose');

const OrderDetailsSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'User',
            required: [
                true,
                "This field can't be empty. Please provide valid id od exiting user",
            ],
        },
        price: {
            type: Number,
            min: 1,
            require: [true, "Price can't be negative number or 0"],
        },
        orderStatusId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'OrderStatus',
            required: [
                true,
                'This field is required. Please provide a valid data',
            ],
        },
        comment: {
            type: String,
            trim: true,
            minlength: [5, "Length can't be less than 5 characters"],
            maxlength: [256, "Length can't be more than 256 characters"],
        },
    },
    {
        collection: 'order-details',
    }
);

const OrderDetails = mongoose.model('OrderDetails', OrderDetailsSchema);

module.exports = OrderDetails;
