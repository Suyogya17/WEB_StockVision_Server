const joi = require("joi");

const orderSchema = joi.object({
  products: joi
    .array()
    .items(
      joi.object({
        product: joi.string().required(), // Product ID
        quantity: joi.number().positive().required(), // Quantity
      })
    )
    .min(1)
    .required(), // At least one product

  status: joi
    .string()
    .valid("pending", "shipped", "delivered", "cancelled")
    .required(),

  totalPrice: joi.number().positive().required(),

  shippingAddress: joi.string().required(),

  paymentStatus: joi
    .string()
    .valid("pending", "completed", "failed")
    .default("pending"),

  payment: joi
    .object({
      method: joi
        .string()
        .valid("khalti", "esewa", "stripe", "cod")
        .required(),
      transactionId: joi.string().optional(),
      paidAt: joi.date().optional(),
    })
    .required(), // 🛑 This is required by your Mongoose schema
});

function OrderValidation(req, res, next) {
  const { error } = orderSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res
      .status(400)
      .json({ message: "Validation Error", details: error.details });
  }

  next();
}

module.exports = OrderValidation;
