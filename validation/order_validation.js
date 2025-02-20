// const joi = require("joi");

// const orderSchema = joi.object({
//     customerId: joi.string().required(),
//     productId: joi.string().required(),
//     date: joi.date().iso().required(),
//     day: joi.string().required(),
//     time: joi.string().required(),
//     status: joi.string().required(),
// });
// function OrderValidation(req, res, next) {
//     const { customerId, productId, date, day, time, status } = req.body;
//     const { error } = orderSchema.validate({ customerId, productId, date, day, time, status });

//     if (error) {
//         return res.status(400).json({ error: error.details[0].message });
//     }

//     next();
// }

// module.exports = OrderValidation;
const joi = require("joi");

const orderSchema = joi.object({
    customer: joi.string().required(), // Assuming customer is a string representing customer ID
    products: joi.array().items(
        joi.object({
            product: joi.string().required(), // Product ID
            quantity: joi.number().positive().required(), // Quantity of the product
            price: joi.number().positive().required(), // Price of the product
        })
    ).min(1).required(), // At least one product in the order
    status: joi.string().valid("pending", "shipped", "delivered", "cancelled").required(), // Enum for order status
    totalPrice: joi.number().positive().required(), // Total price of the order
    shippingAddress: joi.string().required(), // Shipping address required
    paymentStatus: joi.string().valid("pending", "completed", "failed").default("pending"), // Payment status with default
});

function OrderValidation(req, res, next) {
    const { error } = orderSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    next();
}

module.exports = OrderValidation;
