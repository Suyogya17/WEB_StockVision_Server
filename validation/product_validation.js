const joi =require("joi");

const productSchema= joi.object({
    productName:joi.string().required(),
    description:joi.string().required(),
    type:joi.string().required(),
    quantity:joi.number().required(),
    price:joi.number().required(),

})

function ProductValidation(req, res, next) {
    const { productName, description, type, quantity, price } = req.body;
    const { error } = productSchema.validate({ productName, description, type, quantity, price });
    if (error) {
        return res.status(400).json({
            message: "Product Data Validation Failed",
            details: error.details
        });
    }

    if (!req.file) {
        return res.status(400).json({
            message: "Image file is required."
        });
    }

    next();
}
module.exports=ProductValidation;