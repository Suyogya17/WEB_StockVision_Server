const express = require ("express");
const { findAll,save } = require("../controller/order_controller");
const Router= express.Router();


Router.get("/", findAll);
Router.post("/",save);





module.exports=Router;