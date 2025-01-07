const express = require ("express");
const { findAll,save, findById, deleteById, update } = require("../controller/customer_controller");
const Router= express.Router();


Router.get("/", findAll);
Router.post("/",save);
Router.get("/:id",findById);
Router.delete("/:id",deleteById);
Router.put("/:id",update);




module.exports=Router;