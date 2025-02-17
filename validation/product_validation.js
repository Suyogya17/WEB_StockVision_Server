const joi =require("joi");

const productSchema= joi.object({
    productName:joi.string().required(),
    description:joi.string().required(),
    type:joi.string().required(),
    quantity:joi.string().required(),
    price:joi.string().required(),
    image:joi.string().required,
})

function ProductValidation(req, res, next) {
    const { productName,image, description, type, quantity, price } = req.body;
    const { error } = productSchema.validate({ productName, image, description, type, quantity, price });
    if (error) {
        return res.status(400).json({
            message: "Product Data Validation Failed",
            details: error.details
        });
    }

    next();
}
module.exports=ProductValidation;