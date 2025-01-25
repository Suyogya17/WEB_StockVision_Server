const asyncHandler = require("../middleware/async");
const Customer =require("../model/customer")
const nodemailer = require ("nodemailer")

const findAllCustomer = asyncHandler(async (req, res)=> {
    try{    
        const customer =await Customer.find();
        res.status(200).json(customer);
    }
    catch(e){
        res.status(500).json(e);
    }
});

const save = async(req,res)=> {
    try{
        const customer= new Customer(req.body);
        await customer.save();
        
        const transporter = nodemailer.createTransport({
            host:"smtp.gmail.com",
            post:587,
            secure:false,
            protocol: "smtp",
            auth:{
                user:"suyogyashrestha17@gmail.com",
                pass:"fyuqhzlqgtzdmpsv"
            }
        })
        const info = await transporter.sendMail({
            from: "suyogyashrestha17@gmail.com",
            to:customer.email,
            subject:"Customer Registration",
            html:`
            <h1>Your Registration has been Completed !! </h1>
            <p>your user id is ${customer.id}</p>
            `
        })
        res.status(201).json({
            success:true,
            data:
            info});
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
    findAllCustomer,
    save,
    findById,
    deleteById,
    update
}