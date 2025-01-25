const joi =require("joi");

const customerSchema= joi.object({
    fName:joi.string().required(),
    lName:joi.string().required(),
    email:joi.string().required().email(),
    image:joi.string().required,
    phoneNo:joi.string().required(),
    address:joi.string().required()

});
function CustomerValidation(req,res,next){
    const{fName,lName,email,image,phoneNo,address}=req.body;
    const{error}=customerSchema.validate({fName,lName,email,image,phoneNo,address});
    if(error){
          return  res.json({ error: error.details[0].message });
    }
    next();
}

module.exports=CustomerValidation;