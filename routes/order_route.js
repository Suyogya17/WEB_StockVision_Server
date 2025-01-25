const express = require ("express");
const { getAllOrder,save, findById,deleteById,update } = require("../controller/order_controller");
const OrderValidation = require("../validation/order_validation");
const Router= express.Router();


Router.get("/getAllOrder", getAllOrder);
Router.post("/createOrder",OrderValidation,save);
Router.get("/:id",findById);
Router.delete("/:id",deleteById);
Router.put("/:id",update);





module.exports=Router;