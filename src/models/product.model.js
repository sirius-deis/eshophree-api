const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    name: {
        type: String,
        require: [true, "This field can't be blank. Provide a name"],
    },
    text: {
        type: String,
        require: [true, "This field can't be blank. Provide a text"],
    },
    category: {
        type: String,
        require: [true, "This field can't be blank. Provide a category"],
    },
    brand: {
        type: String,
    },
    price: {
        type: Number,
        require: [true, "This field can't be blank. Provide a price"],
    },
    stock: {
        type: Number,
        require: [true, "This field can't be blank. Provide amount of this product"],
    },
    desc: {
        type: String,
        require: [true, "This field can't be blank. Provide description for this product"],
    },
    options: [
        {
            title: String,
            optArr: [
                {
                    opt: String,
                    price: Number,
                },
            ],
        },
    ],
    images: {
        type: [String],
        default: "default.png",
    },
    addition: {
        type: String,
        require: [true, "This field can't be blank. Provide additional details for this product"],
    },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
