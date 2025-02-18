const { required } = require("joi");
const mongoose = require("mongoose");

const credSchema = new mongoose.Schema({
    fName: { type: String, required: true },
    lName: { type: String, required: true },
    image: { type: String},
    email: {type:String, required: true},
    phoneNo: { type: String, required: true },
    username: { type: String, required: true },
    address: { type: String, required: true },
    password: { type: String, required: true },
    isAdmin: { type: String, required: true },
    role: { type: String, required: true, default: 'user' } 

});

const Credential = mongoose.model("Credential", credSchema);

module.exports = Credential;
