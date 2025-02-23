const asyncHandler = require("../middleware/async");
const Order = require("../model/order");

// Get all orders
const getAllOrder = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer", "username") // Populate customer details (only name & email)
      .populate("products.product", "productName price image"); // Populate product details

    console.log("Fetched Orders:", orders); // Debugging: See what backend is sending

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (e) {
    console.error("Error fetching orders:", e); // Debugging
    res.status(500).json({ error: e.message });
  }
});

// Save a new order
// const save = asyncHandler(async (req, res) => {
//   console.log(" Received User from Middleware:", req.user); // Debugging

//   // Ensure `req.user` is present
//   if (!req.user || !req.user.userId) {
//     return res.status(401).json({ message: "User not authenticated" });
//   }

//   const { products, totalPrice, shippingAddress, status, paymentStatus } =
//     req.body;

//   // Ensure required fields are present
//   if (!products || products.length === 0 || !shippingAddress || !totalPrice) {
//     return res.status(400).json({ message: "Missing required fields" });
//   }

//   try {
//     const order = new Order({
//       customer: req.user.userId, // Ensure this matches your middleware's user object
//       products,
//       totalPrice,
//       shippingAddress,
//       status: status || "pending",
//       paymentStatus: paymentStatus || "pending",

//     });

//     await order.save();

//     res.status(201).json({
//       success: true,
//       message: "Order placed successfully",
//       orderDetails: order,
//     });
//     console.log("order saved: " ,order)
//   } catch (error) {
//     console.error("Error Saving Order:", error); // Log any errors
//     res.status(500).json({
//       success: false,
//       message: "Error placing order",
//       error: error.message,
//     });
//   }
// });
const save = asyncHandler(async (req, res) => {
  console.log("Received User from Middleware:", req.user); // Debugging

  // Ensure `req.user` is present and contains `userId`
  if (!req.user || !req.user.userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const { products, totalPrice, shippingAddress, status, paymentStatus } =
    req.body;

  // Ensure required fields are present
  if (!products || products.length === 0 || !shippingAddress || !totalPrice) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const order = new Order({
      customer: req.user.userId, // Ensure this matches your middleware's user object
      products,
      totalPrice,
      shippingAddress,
      status: status || "pending", // Default to "pending"
      paymentStatus: paymentStatus || "pending", // Default to "pending"
    });

    await order.save();

    // Send the response back with the order details
    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderDetails: order,
    });

    console.log("Order saved:", order); // Debugging log for saved order
  } catch (error) {
    console.error("Error Saving Order:", error); // Log any errors
    res.status(500).json({
      success: false,
      message: "Error placing order",
      error: error.message,
    });
  }
});

// Find order by ID
const findByCustomerId = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Fetching orders for userId:", userId);

    if (!userId) {
      return res
        .status(400)
        .json({ message: "userId is required in the request URL." });
    }
    const orders = await Order.find({ customer: userId })
      .populate("customer", "username")
      .populate("products.product"); // Populate product details if needed

    if (!orders) {
      return res.status(404).json({ message: "No orders found for this user" });
    }
    res.status(200).json({
      success: true,
      data: orders,
    });
    console.log("Fetching orders for userId:", userId, orders);
  } catch (e) {
    console.error("Error fetching orders:", e);
    res.status(500).json({ error: e.message });
  }
});

// Delete order by ID
const deleteById = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update an order
const update = asyncHandler(async (req, res) => {
  try {
    const { shippingAddress } = req.body; // Only extract shipping address from request body
    
    const order = await Order.findByIdAndUpdate(req.params.id, {
      shippingAddress, // Update only the shipping address
    }, {
      new: true, // Ensure that the updated order is returned
    })
      .populate("customer")
      .populate("products.product"); // Populate customer and products for response

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      message: "Shipping address updated successfully",
      data: order,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
module.exports = {
  getAllOrder,
  save,
  findByCustomerId,
  deleteById,
  update,
};
