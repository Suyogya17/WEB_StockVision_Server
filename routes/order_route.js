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
const router = express.Router();
const {
  getAllOrder,
  save,
  findByCustomerId,
  deleteById,
  update,
  updateStatus,
  verifyKhaltiPayment,
  initiateKhaltiPayment
} = require("../controller/order_controller");
const OrderValidation = require("../validation/order_validation"); // Assuming this validates the order data
const Router = express.Router();
const { authenticateToken } = require("../security/auth");
const uploadMiddleware = require("../middleware/uploads");

// Get all orders
Router.get("/getAllOrder", getAllOrder);

// Create a new order
Router.post("/createOrder", authenticateToken, save);

// Get an order by ID
Router.get(
  "/getuserorders/:userId",
  authenticateToken,
  uploadMiddleware.single("image"),
  findByCustomerId
);

// Delete an order by ID
Router.delete("/deleteOrder/:id", authenticateToken, deleteById);

// Update an order by ID
Router.put("/updateOrder/:id", update);
Router.put("/updateStatus", updateStatus);
Router.post("/khalti/verify", authenticateToken, verifyKhaltiPayment);
Router.post("/khalti/initiate", authenticateToken, initiateKhaltiPayment);
module.exports = Router;
