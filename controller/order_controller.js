const asyncHandler = require("../middleware/async");
const Order = require("../model/order");
const Product = require("../model/product");
const axios = require("axios");
const { sendOrderConfirmationEmail } = require("../utils/mailer");

// ✅ Get all orders
const getAllOrder = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer", "username")
      .populate("products.product", "productName price image");
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (e) {
    res.status(500).json({ success: false, message: "Failed to fetch orders", error: e.message });
  }
});

// ✅ Save order (used for COD or internal calls)
const save = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.userId) return res.status(401).json({ message: "User not authenticated" });

  const { products, totalPrice, shippingAddress, status, paymentStatus, payment } = req.body;
  if (!products?.length || !shippingAddress || !totalPrice) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Stock validation
  for (let { product: productId, quantity } of products) {
    const product = await Product.findById(productId);
    if (!product || product.quantity < quantity) {
      return res.status(400).json({
        message: `Insufficient stock for ${product?.productName || productId}`,
      });
    }
  }

  const order = new Order({
    customer: req.user.userId,
    products,
    totalPrice,
    shippingAddress,
    status: status || "pending",
    paymentStatus: paymentStatus || "pending",
    payment: {
      method: payment?.method || "cod",
      transactionId: payment?.transactionId,
      paidAt: payment?.paidAt,
    },
  });

  await order.save();

  // Deduct stock
  for (let { product: productId, quantity } of products) {
    const product = await Product.findById(productId);
    if (product) {
      product.quantity -= quantity;
      await product.save();
    }
  }

  const populatedOrder = await Order.findById(order._id)
    .populate("customer", "email")
    .populate("products.product", "productName price");

  await sendOrderConfirmationEmail(populatedOrder.customer.email, populatedOrder);

  res.status(201).json({ success: true, message: "Order placed successfully", orderDetails: order });
});

// ✅ Find orders by customer
const findByCustomerId = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const orders = await Order.find({ customer: userId })
    .populate("customer", "username")
    .populate("products.product");
  if (!orders) return res.status(404).json({ message: "No orders found" });
  res.status(200).json({ success: true, data: orders });
});

// ✅ Delete order and restore stock
const deleteById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("products.product");
  if (!order) return res.status(404).json({ message: "Order not found" });

  for (let { product, quantity } of order.products) {
    const productToUpdate = await Product.findById(product._id);
    if (productToUpdate) {
      productToUpdate.quantity += quantity;
      await productToUpdate.save();
    }
  }

  await Order.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "Order deleted and stock restored" });
});

// ✅ Update order
const update = asyncHandler(async (req, res) => {
  const { shippingAddress, products } = req.body;
  const orderId = req.params.id;
  const order = await Order.findById(orderId).populate("products.product");
  if (!order) return res.status(404).json({ message: "Order not found" });

  // Restore old stock
  for (let item of order.products) {
    const productToUpdate = await Product.findById(item.product._id);
    if (productToUpdate) {
      productToUpdate.quantity += item.quantity;
      await productToUpdate.save();
    }
  }

  // Validate and deduct new stock
  for (let item of products) {
    const product = await Product.findById(item.product);
    const existingItem = order.products.find(p => p.product._id.toString() === item.product);
    const prevQty = existingItem ? existingItem.quantity : 0;
    const diff = item.quantity - prevQty;

    if (!product || product.quantity < diff) {
      return res.status(400).json({ message: `Not enough stock for ${product?.productName || item.product}` });
    }

    product.quantity -= diff;
    await product.save();
  }

  order.shippingAddress = shippingAddress || order.shippingAddress;
  order.products = products || order.products;

  await order.save();
  res.status(200).json({ success: true, message: "Order updated successfully", data: order });
});

// ✅ Update order status/payment status
const updateStatus = asyncHandler(async (req, res) => {
  const { orderId, updatedData } = req.body;
  const validStatus = ["pending", "shipped", "delivered", "cancelled"];
  const validPaymentStatus = ["pending", "completed", "failed"];
  const validPaymentMethods = ["khalti", "esewa", "stripe", "cod"];
  const updateFields = {};

  if (updatedData.status && validStatus.includes(updatedData.status)) updateFields.status = updatedData.status;
  if (updatedData.paymentStatus && validPaymentStatus.includes(updatedData.paymentStatus))
    updateFields.paymentStatus = updatedData.paymentStatus;

  if (updatedData.payment) {
    if (updatedData.payment.method && validPaymentMethods.includes(updatedData.payment.method)) {
      updateFields["payment.method"] = updatedData.payment.method;
    }
    if (updatedData.payment.transactionId) {
      updateFields["payment.transactionId"] = updatedData.payment.transactionId;
    }
    if (updatedData.payment.paidAt) {
      updateFields["payment.paidAt"] = new Date(updatedData.payment.paidAt);
    }
  }

  const updatedOrder = await Order.findByIdAndUpdate(orderId, { $set: updateFields }, { new: true })
    .populate("customer", "username")
    .populate("products.product", "productName image");

  if (!updatedOrder) return res.status(404).json({ message: "Order not found" });

  res.status(200).json({ success: true, message: "Order status updated", data: updatedOrder });
});

// ✅ Initiate Khalti Payment
const initiateKhaltiPayment = asyncHandler(async (req, res) => {
  const {
    amount,
    purchase_order_id,
    purchase_order_name,
    customer_info,
    return_url = "http://localhost:5173/orderhistory",
    website_url = "http://localhost:5173",
  } = req.body;

  try {
    const response = await axios.post(
      "https://dev.khalti.com/api/v2/epayment/initiate/",
      { return_url, website_url, amount, purchase_order_id, purchase_order_name, customer_info },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to initiate Khalti payment", error: error.message });
  }
});

// ✅ Verify Khalti Payment & Save Order
const verifyKhaltiPayment = asyncHandler(async (req, res) => {
  try {
    const { pidx, orderId } = req.body;

    if (!pidx || !orderId) {
      return res.status(400).json({ message: "Missing pidx or order ID" });
    }

    // 🔍 Verify payment with Khalti
    const verifyResponse = await axios.post(
      "https://a.khalti.com/api/v2/epayment/lookup/",
      { pidx },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = verifyResponse.data;

    if (result.status !== "Completed") {
      return res.status(400).json({ message: "Payment not completed." });
    }

    // ✅ Just update the existing saved order
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          paymentStatus: "completed",
          "payment.method": "khalti",
          "payment.transactionId": result.transaction_id,
          "payment.paidAt": new Date(result.created_on),
        },
      },
      { new: true }
    ).populate("customer", "username")
     .populate("products.product");

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and order updated.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("❌ Error verifying Khalti payment:", error);
    return res.status(500).json({
      success: false,
      message: "Khalti payment verification failed.",
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
  initiateKhaltiPayment,
  verifyKhaltiPayment,
};
