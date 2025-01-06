const mongoose = require("mongoose")

const productSchema=new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    image:{
        type:String,
        require:true
    },
    description:{
        type:String,
        require:true
    },
    type:{
        type:String,
        require:true
    },
    Quantity:{
        type:String,
        require:true
    },
    Price:{
        type:String,
        require:true
    },

})

const Product = mongoose.model("product",productSchema);

module.exports=Product;