const { required } = require("joi");
const mongoose = require("mongoose")

const productSchema=new mongoose.Schema({
    productName:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
        
    },
    description:{
        type:String,
        require:true
    },
    type:{
        type:String,
        require:true
    },
    quantity:{
        type:String,
        require:true
    },
    price:{
        type:String,
        require:true
    },

})

const Product = mongoose.model("product",productSchema);

module.exports=Product;