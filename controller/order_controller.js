const asyncHandler = require("../middleware/async");
const Order = require("../model/order");

// Get all orders
const getAllOrder = asyncHandler(async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("customer", "fname lname") // Populate customer details (only name & email)
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
const save = asyncHandler(async (req, res) => {
    try {
        // You may want to validate products and other fields before saving
        const { customer, products, status, totalPrice, shippingAddress, paymentStatus } = req.body;

        if (!customer || !products || products.length === 0 || !shippingAddress || !totalPrice) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const order = new Order({
            customer,
            products,
            status,
            totalPrice,
            shippingAddress,
            paymentStatus
        });

        await order.save();

        res.status(201).json({
            success: true,
            data: order,
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Find order by ID
const findById = asyncHandler(async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("customer") // Populate customer details
            .populate("products.product"); // Populate product details if needed

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({
            success: true,
            data: order,
        });
    } catch (e) {
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
        const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate("customer") // Populate customer details
            .populate("products.product"); // Populate product details if needed

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({
            success: true,
            message: "Order updated successfully",
            data: order,
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = {
    getAllOrder,
    save,
    findById,
    deleteById,
    update,
};
