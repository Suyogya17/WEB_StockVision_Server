const express = require("express");
const { getAllproduct, save, findById, deleteById, update } = require("../controller/product_controller");
const uploadMiddleware = require("../middleware/uploads");
const Router = express.Router();
const {authenticateToken } = require("../security/auth");

Router.get("/getAllproduct", getAllproduct);
Router.post("/createProduct",uploadMiddleware.single('image'), save);
Router.get("/:id",findById); 
Router.delete("/:id", deleteById);
Router.put("/updateProduct/:id",uploadMiddleware.single("image"), update);

module.exports = Router;
