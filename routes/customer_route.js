const express = require ("express");
const { findAllCustomer,save, findById, deleteById, update } = require("../controller/customer_controller");
const CustomerValidation = require("../validation/customer_validation");
const Router= express.Router();


Router.get("/getAllCustomer", findAllCustomer);
Router.post("/createCustomer",CustomerValidation,save);
Router.get("/:id",findById);
Router.delete("/:id",deleteById);
Router.put("/:id",update);

module.exports=Router;