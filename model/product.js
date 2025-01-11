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
    quantity:{
        type:Number,
        require:true
    },
    price:{
        type:Number,
        require:true
    },

})

const Product = mongoose.model("product",productSchema);

module.exports=Product;