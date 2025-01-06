const Customer =require("../model/customer")

const findAll = async (req, res)=> {
    const customer =Customer.find();
    res.status(200).json(customer);

}


module.exports={
    findAll
}