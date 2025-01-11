const joi = require("joi");

const orderSchema = joi.object({
    customerId: joi.string().required(),
    productId: joi.string().required(),
    date: joi.date().iso().required(),
    day: joi.string().required(),
    time: joi.string().required(),
    status: joi.string().required(),
});
function OrderValidation(req, res, next) {
    const { customerId, productId, date, day, time, status } = req.body;
    const { error } = orderSchema.validate({ customerId, productId, date, day, time, status });

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    next();
}

module.exports = OrderValidation;
