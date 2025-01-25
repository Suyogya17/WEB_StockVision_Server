const mongoose= require("mongoose");
const connectDB = async ()=> {
    try{
        await mongoose.connect ("mongodb://localhost:27017/stockvision"
        );
        console.log("MongoDB Connected")

    } catch (e){
        console.log("Couldnot connect to MongoDB",e.message);

    }
}

module.exports=connectDB;