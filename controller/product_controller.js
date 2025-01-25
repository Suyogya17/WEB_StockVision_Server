const asyncHandler = require("../middleware/async");
const Product = require("../model/product");

const getAllproduct = asyncHandler(async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({
            success: true,
            count: products.length,
            data: products,
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch products",
            error: error.message,
        });
    }
});

const save = asyncHandler(async (req, res) => {
    try {
        const { productname, description, type, quantity, price } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Image file is required",
            });
        }

        const product = new Product({
            productname,
            description,
            image: req.file.originalname,
            type,
            quantity,
            price,
        });

        await product.save();

        res.status(201).json({
            success: true,
            message: "Product saved successfully",
            data: product,
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: "Failed to save product",
            error: error.message,
        });
    }
});

const findById = asyncHandler(async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        res.status(200).json({
            success: true,
            data: product,
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch product",
            error: error.message,
        });
    }
});

const deleteById = asyncHandler(async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: "Failed to delete product",
            error: error.message,
        });
    }
});

const update = asyncHandler(async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product,
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: "Failed to update product",
            error: error.message,
        });
    }
});

module.exports = {
    getAllproduct,
    save,
    findById,
    deleteById,
    update,
};
