const express = require ("express");
const { register, login } = require("../controller/auth_controller");
const { authenticateToken } = require("../security/auth");
const Router= express.Router();


Router.post("/login", login);
Router.post("/register",authenticateToken, register);

module.exports=Router;