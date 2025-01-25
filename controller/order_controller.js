const asyncHandler = require("../middleware/async");
const Order = require("../model/order");

// Get all orders
const getAllOrder = asyncHandler(async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("customerId") // Populate customer details
            .populate("productId"); // Populate product details if needed

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders,
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Save a new order
const save = asyncHandler(async (req, res) => {
    try {
        const order = new Order(req.body);
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
        const order = await Order.findById(req.params.id);
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
        const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
