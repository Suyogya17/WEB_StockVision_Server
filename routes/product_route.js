const express = require("express");
const { getAllproduct, save, findById, deleteById, update } = require("../controller/product_controller");
const Router = express.Router();
const multer = require("multer");
const ProductValidation = require("../validation/product_validation");
const {authenticateToken } = require("../security/auth");

const storage = multer.diskStorage({
    destination: function(req, res, cb) {
        cb(null, 'assets/product_img');
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });

Router.get("/getAllproduct",authenticateToken, getAllproduct);
Router.post("/createProduct",authenticateToken,upload.single('file'), ProductValidation, save);
Router.get("/:id",authenticateToken,findById); 
Router.delete("/:id",authenticateToken, deleteById);
Router.put("/:id",authenticateToken, update);

module.exports = Router;
