const express = require("express");
const { register, login, uploadImage, update, findbyid } = require("../controller/auth_controller");
const uploadMiddleware = require("../middleware/uploads");
const { authenticateToken } = require("../security/auth"); 
const Router = express.Router();

Router.post("/login", login);
Router.post("/register", uploadMiddleware.single("profilePicture"), register);
Router.post("/uploadImage", uploadMiddleware.single("profilePicture"), uploadImage);
// Router.get("/:id",findById); 
Router.put("/updateUser/:id",uploadMiddleware.single("profilePicture"),authenticateToken, update);
Router.get("/userfindbyid",uploadMiddleware.single("profilePicture"),authenticateToken,authenticateToken,findbyid);

module.exports = Router;
