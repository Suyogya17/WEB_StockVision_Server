const Product =require("../model/product")

const findAll = async (req, res)=> {
    try{    
        const product =await Product.find();
        res.status(200).json(product);
    }
    catch(e){
        res.status(500).json(e);
    }
};

const save = async(req,res)=> {
    try{
        const {name,description,type,Quantity,Price}=req.body
        const product= new Product({
            name ,
            description,
            image:req.file.originalname,
            type,
            Quantity,
            Price      
        });
        await product.save();
        res.status(201).json(product);
    }catch(e) {
        res.status(500).json(e);
    }
};

const findById =async (req,res)=>{
    try{
       const product=  await Product.findById(req.params.id);
       res.status(200).json(product);

    }catch(e){
        res.json(e);
    }
};

    const deleteById = async (req, res) => {
        try{
            const product = await Product.findByIdAndDelete(req.params.id);
            if (!product) {
                return res.status(404).json({ message: "product not found" });
            }
            res.status(200).json("Data Deleted");
        }catch(e){
        res.json(e);
    }
};

const update = async (req, res) => {
    try{
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {new:true});
        if (!product) {
            return res.status(404).json({ message: "product not found" });
        }
        res.status(201).json(product);
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