const joi =require("joi");

const customerSchema= joi.object({
    name:joi.string().required(),
    image:joi.string().required(),
    description:joi.string().required(),
    type:joi.string().required(),
    quantity:joi.number().required(),
    price:joi.number().required(),

})

function ProductValidation(req, res, next) {
    const { name, image, description, type, quantity, price } = req.body;
    const { error } = customerSchema.validate({ name, image, description, type, quantity, price });
    if (error) {
        // Send detailed validation error
        return res.status(400).json({
            message: "Product Data Validation Failed",
            details: error.details
        });
    }
    next();
}
module.exports=ProductValidation;