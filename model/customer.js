const mongoose = require("mongoose")

const customerSchema=new mongoose.Schema({
    full_name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    contact_no:{
        type:String,
        require:true
    },
    address:{
        type:String,
        require:true
    },

})

const Customer = mongoose.model("customer",customerSchema);

module.exports=Customer;