const Customer =require("../model/customer")

const findAll = async (req, res)=> {
    try{    
        const customer =await Customer.find();
        res.status(200).json(customer);
    }
    catch(e){
        res.status(500).json(e);
    }
};

const save = async(req,res)=> {
    try{
        const customer= new Customer(req.body);
        await customer.save();
        res.status(201).json(customer);
    }catch(e) {
        res.status(500).json(e);
    }
};

const findById =async (req,res)=>{
    try{
       const customer=  await Customer.findById(req.params.id);
       res.status(200).json(customer);

    }catch(e){
        res.json(e);
    }
};

    const deleteById = async (req, res) => {
        try{
            const customer = await Customer.findByIdAndDelete(req.params.id);
            if (!customer) {
                return res.status(404).json({ message: "Customer not found" });
            }
            res.status(200).json("Data Deleted");
        }catch(e){
        res.json(e);
    }
};

const update = async (req, res) => {
    try{
        const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {new:true});
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        res.status(201).json(customer);
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