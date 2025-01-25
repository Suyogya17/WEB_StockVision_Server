const express = require ("express");
const { register, login } = require("../controller/auth_controller");
const Router= express.Router();


Router.post("/login", login);
Router.post("/register", register);

module.exports=Router;