const express = require ("express");
const { findAll } = require("../controller/customer_controller");
const Router= express.Router();


Router.get("/", findAll);

module.exports=Router;