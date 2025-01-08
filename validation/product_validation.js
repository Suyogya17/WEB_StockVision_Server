const joi =require("joi");

const customerSchema= joi.object({
    name:joi.string().required(),
    image:joi.string().required(),
    description:joi.string().required(),
    type:joi.string().required(),
    quantity:joi.string().required(),
    price:joi.string().required(),

})

function ProductValidation(req,res,next){
    const{name,image,description,type,quantity,price}=req.body;
    const{error}=customerSchema.validate({name,image,description,type,quantity,price})
    if(error){
          return  res.json("Product Data Validaition Fail")

    }
    next()
}

module.exports=ProductValidation