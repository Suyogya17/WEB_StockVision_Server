// const express = require ("express");
// const { getAllOrder,save, findById,deleteById,update } = require("../controller/order_controller");
// const OrderValidation = require("../validation/order_validation");
// const Router= express.Router();

// Router.get("/getAllOrder", getAllOrder);
// Router.post("/createOrder",OrderValidation,save);
// Router.get("/:id",findById);
// Router.delete("/:id",deleteById);
// Router.put("/:id",update);

// module.exports=Router;

const express = require("express");
const {
  getAllOrder,
  save,
  findByCustomerId,
  deleteById,
  update,
} = require("../controller/order_controller");
const OrderValidation = require("../validation/order_validation"); // Assuming this validates the order data
const Router = express.Router();
const { authenticateToken } = require("../security/auth");

// Get all orders
Router.get("/getAllOrder", getAllOrder);

// Create a new order
Router.post("/createOrder", authenticateToken, OrderValidation, save);

// Get an order by ID
Router.get("/getuserorders/:userId",authenticateToken, findByCustomerId);

// Delete an order by ID
Router.delete("/orders/:id", deleteById);

// Update an order by ID
Router.put("/order/:id", update);



module.exports = Router;
