const asyncHandler = require("../middleware/async");
const Order = require("../model/order");
const Product = require("../model/product");

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
    res.status(500).json({
      sucess: false,
      message: "Failed to fetch orders",
      error: e.message,
    });
  }
});

const save = asyncHandler(async (req, res) => {
  const { sendOrderConfirmationEmail } = require("../utils/mailer");

  console.log("Received User from Middleware:", req.user); // Debugging

  if (!req.user || !req.user.userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const { products, totalPrice, shippingAddress, status, paymentStatus } =
    req.body;

  if (!products || products.length === 0 || !shippingAddress || !totalPrice) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // ✅ Validate stock
    for (let i = 0; i < products.length; i++) {
      const { product: productId, quantity } = products[i];
      const product = await Product.findById(productId);

      if (!product) {
        return res
          .status(404)
          .json({ message: `Product ${productId} not found` });
      }

      if (product.quantity < quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.productName}. Only ${product.quantity} left in stock.`,
        });
      }
    }

    // ✅ Create order
    const order = new Order({
      customer: req.user.userId,
      products,
      totalPrice,
      shippingAddress,
      status: status || "pending",
      paymentStatus: paymentStatus || "pending",
    });

    await order.save();

    // ✅ Deduct stock
    for (let i = 0; i < products.length; i++) {
      const { product: productId, quantity } = products[i];
      const product = await Product.findById(productId);

      if (product) {
        product.quantity -= quantity;
        await product.save();
      }
    }

    // ✅ Send confirmation email
    const populatedOrder = await Order.findById(order._id)
      .populate("customer", "email")
      .populate("products.product", "productName price");

    await sendOrderConfirmationEmail(
      populatedOrder.customer.email,
      populatedOrder
    );

    // ✅ Respond
    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderDetails: order,
    });

    console.log("Order saved and confirmation sent:", order);
  } catch (error) {
    console.error("Error Saving Order:", error);
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
    const order = await Order.findById(req.params.id).populate(
      "products.product"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Restore product quantities
    for (let i = 0; i < order.products.length; i++) {
      const { product, quantity } = order.products[i];

      // Find the product in the database and restore the quantity
      const productToUpdate = await Product.findById(product._id);

      if (productToUpdate) {
        productToUpdate.quantity += quantity; // Restore the quantity
        await productToUpdate.save();
      }
    }

    // Now delete the order
    await Order.findByIdAndDelete(req.params.id);

    res
      .status(200)
      .json({ message: "Order deleted and product quantities restored" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update an order
const update = asyncHandler(async (req, res) => {
  try {
    const { shippingAddress, products } = req.body;
    const orderId = req.params.id;

    // Fetch the existing order from the database
    const order = await Order.findById(orderId).populate("products.product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    console.log("Updating order:", orderId);

    // Step 1: Restore the previous product stock before updating
    for (let item of order.products) {
      const productToUpdate = await Product.findById(item.product._id);
      if (productToUpdate) {
        productToUpdate.quantity += item.quantity; // Restore previous quantity
        await productToUpdate.save();
      }
    }

    // Step 2: Validate and update new product quantities
    for (let item of products) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res
          .status(404)
          .json({ message: `Product ${item.product} not found` });
      }

      const existingOrderItem = order.products.find(
        (p) => p.product._id.toString() === item.product
      );
      const previousQuantity = existingOrderItem
        ? existingOrderItem.quantity
        : 0;
      const quantityDifference = item.quantity - previousQuantity;

      // Ensure sufficient stock for the new quantity
      if (product.quantity < quantityDifference) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.productName}. Only ${product.quantity} left.`,
        });
      }

      // Update the stock based on the quantity difference
      product.quantity -= quantityDifference;
      await product.save();
    }

    // Step 3: Update the order details
    order.shippingAddress = shippingAddress || order.shippingAddress;
    order.products = products || order.products;

    await order.save();

    console.log("Order updated successfully:", order);

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: error.message });
  }
});
// Update only order status or payment status
const updateStatus = asyncHandler(async (req, res) => {
  const { orderId, updatedData } = req.body;

  if (!orderId || !updatedData) {
    return res.status(400).json({ message: "Missing required data" });
  }

  const validStatus = ["pending", "shipped", "delivered", "cancelled"];
  const validPaymentStatus = ["pending", "completed", "failed"];

  const updateFields = {};

  if (updatedData.status) {
    if (!validStatus.includes(updatedData.status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }
    updateFields.status = updatedData.status;
  }

  if (updatedData.paymentStatus) {
    if (!validPaymentStatus.includes(updatedData.paymentStatus)) {
      return res.status(400).json({ message: "Invalid payment status" });
    }
    updateFields.paymentStatus = updatedData.paymentStatus;
  }

  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: updateFields },
      { new: true }
    )
      .populate("customer", "username")
      .populate("products.product", "productName image");

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating order status",
      error: error.message,
    });
  }
});

module.exports = {
  getAllOrder,
  save,
  findByCustomerId,
  deleteById,
  update,
  updateStatus,
};
