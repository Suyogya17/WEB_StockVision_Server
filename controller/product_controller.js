const asyncHandler = require("../middleware/async");
const Product = require("../model/product");

const getAllproduct = asyncHandler(async (req, res) => {
  const products = await Product.find();
  res.status(200).json({ success: true, count: products.length, data: products });
});

const save = asyncHandler(async (req, res) => {
  const { productName, description, type, quantity, price } = req.body;

  if (!req.file) {
    return res.status(400).json({ success: false, message: "Image file is required" });
  }

  const newProduct = await Product.create({
    productName,
    description,
    type,
    quantity,
    price,
    image: req.file.path,
  });

  res.status(201).json({ success: true, data: newProduct });
});

const findById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }
  res.status(200).json({ success: true, data: product });
});

const deleteById = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }
  res.status(200).json({ success: true, message: "Product deleted" });
});

const update = asyncHandler(async (req, res) => {
  const updateData = req.body;
  if (req.file) {
    updateData.image = req.file.path;
  }

  const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  res.status(200).json({ success: true, data: product });
});

module.exports = {
  getAllproduct,
  save,
  findById,
  deleteById,
  update,
};
