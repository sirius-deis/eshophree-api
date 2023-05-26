const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "This field can't be blank. Provide a name"],
        },
        categoryId: {
            type: mongoose.SchemaTypes.ObjectId,
            required: true,
        },
        sku: {
            type: String,
        },
        price: {
            type: Number,
            get: price => {
                return `$${price.toFixed(2)}`;
            },
        },
        brandId: {
            type: mongoose.SchemaTypes.ObjectId,
            required: true,
        },
        info: [
            {
                title: {
                    type: String,
                },
                item: {
                    type: String,
                },
            },
        ],
        about: {
            type: [String],
        },
        options: [
            {
                title: String,
                optArr: [
                    {
                        opt: {
                            type: String,
                        },
                        plusToPrice: {
                            type: Number,
                        },
                    },
                ],
            },
        ],
        desc: {
            type: String,
        },
        images: {
            type: [String],
        },
        ratingQuantity: {
            type: Number,
            default: 0,
        },
        ratingAverage: {
            type: Number,
            min: 1,
            max: 5,
            set: val => Math.round(val * 10) / 10,
        },
        discountId: {
            type: mongoose.SchemaTypes.ObjectId,
        },
    },
    {
        toJSON: {
            virtuals: true,
            transform: (doc, ret, options) => {
                delete ret.__v;
                delete ret.discountId;
            },
        },
    }
);

productSchema.virtual('discount', {
    ref: 'Discount',
    localField: 'discountId',
    foreignField: '_id',
    justOne: true,
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
