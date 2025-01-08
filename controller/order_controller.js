const Order =require("../model/order")

const findAll = async (req, res)=> {
    try{    
        const order =await Order.find().populate(["customerId","productId"]);
        res.status(200).json(order);
    }
    catch(e){
        res.status(500).json(e);
    }
};

const save = async(req,res)=> {
    try{
        const order= new Order(req.body);
        await order.save();
        res.status(201).json(order);
    }catch(e) {
        res.status(500).json(e);
    }
};

module.exports={
    findAll,
    save,
  
}