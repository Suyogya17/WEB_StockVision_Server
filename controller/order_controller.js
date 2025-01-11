const Order =require("../model/order")

const findAll = async (req, res)=> {
    try{    
        const order =await Order.find().populate(["orderId","productId"]);
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

const findById =async (req,res)=>{
    try{
       const order=  await Order.findById(req.params.id);
       res.status(200).json(order);

    }catch(e){
        res.json(e);
    }
};

    const deleteById = async (req, res) => {
        try{
            const order = await Order.findByIdAndDelete(req.params.id);
            if (!order) {
                return res.status(404).json({ message: "Order not found" });
            }
            res.status(200).json("Order Data Deleted");
        }catch(e){
        res.json(e);
    }
};

const update = async (req, res) => {
    try{
        const order = await Order.findByIdAndUpdate(req.params.id, req.body, {new:true});
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.status(201).json(order);
    }catch(e){
    res.json(e);
}
};

module.exports={
    findAll,
    save,
    findById,
    deleteById,
    update
  
}