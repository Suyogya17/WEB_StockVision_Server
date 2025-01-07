const express = require ("express");
const { findAll,save, findById, deleteById, update } = require("../controller/product_controller");
const Router= express.Router();

const multer= require ("multer")

const storage = multer.diskStorage({destination: function(req,res,cb){
    cb(null,'assets/product_img')
},
filename: function(req,file,cb){
    cb(null, file.originalname)
},

})
const  upload = multer({storage})

Router.get("/", findAll);
Router.post("/",upload.single('file'),save);
Router.get("/:id",findById); 
Router.delete("/:id",deleteById);
Router.put("/:id",update);




module.exports=Router;