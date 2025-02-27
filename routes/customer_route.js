const express = require("express");
const { requestPasswordReset } = require("../controller/customer_controller");
const Router = express.Router();

Router.post("/requestPasswordReset", requestPasswordReset);  // Route to request password reset

module.exports = Router;
