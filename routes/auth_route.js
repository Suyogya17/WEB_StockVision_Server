const express = require("express");
const { register, login, uploadImage } = require("../controller/auth_controller");
const uploadMiddleware = require("../middleware/uploads");
const Router = express.Router();

Router.post("/login", login);
Router.post("/register", uploadMiddleware.single("image"), register);
Router.post("/uploadImage", uploadMiddleware.single("profilePicture"), uploadImage);

module.exports = Router;
