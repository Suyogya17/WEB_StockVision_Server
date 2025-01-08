const mongoose = require("mongoose")

const orderSchema=new mongoose.Schema({
    customerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"customer"
    },
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"product"
    },
    date:{
        type:String,
        require:true
    },
    day:{
        type:String,
        require:true
    },

    time:{
        type:String,
        require:true
    },
    status:{
        type:String,
        require:true
    }

})

const Order = mongoose.model("order",orderSchema);

module.exports=Order;