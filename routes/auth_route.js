const express = require("express");
const { register, login, uploadImage } = require("../controller/auth_controller");
const uploadMiddleware = require("../middleware/uploads");
const { authenticateToken } = require("../security/auth"); 
const Router = express.Router();

Router.post("/login", login);
Router.post("/register", uploadMiddleware.single("image"), register);
Router.post("/uploadImage", uploadMiddleware.single("profilePicture"), uploadImage, authenticateToken);

module.exports = Router;
