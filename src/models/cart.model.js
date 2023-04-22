const mongoose = require("mongoose");

const CartSchema = mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    products: [
        {
            productId: {
                type: mongoose.Types.ObjectId,
                ref: "Product",
            },
            quantity: {
                type: Number,
                required: [true, "This field can't be blank"],
            },
        },
    ],
});

const Cart = mongoose.model("Carts", CartSchema);

module.exports = Cart;
