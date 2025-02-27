const mongoose = require("mongoose")

const customerSchema=new mongoose.Schema({
    fName: {
        type: String,
        required: true,
  
      },
      lName: {
        type: String,
        required: true,

      },
      phoneNo: {
        type: String,
        default: true,
        
      },
      image: {
        type: String,
      },
      username: {
        type: String,
        required: true,
       
      },
      password: {
        type: String,
        required: true,
    
      },
      email: {
        type: String,
        required: true,
    
      },
      address: {
        type: String,
        required: true,
    
      },
      
      
    });

const Customer = mongoose.model("customer",customerSchema);

module.exports=Customer;