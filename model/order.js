const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,  
            ref: "customer",  
            required: true
        },
        products: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,  
                    ref: "product",
                    required: true
                },
                quantity: {
                    type: String,  
                    required: true,
                }
            }
        ],
        totalPrice: {
            type: String,  
            required: true
        },
        shippingAddress: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "shipped", "delivered", "cancelled"],
            default: "pending"
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "completed", "failed"],
            default: "pending"
        },
        orderDate: {
            type: Date,  //  Stores the order date
            default: Date.now  // Automatically sets the order date
        }
    },
    { timestamps: true }  //  Automatically adds createdAt and updatedAt
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
