// model/product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  image: {
    type: String, // or Buffer if you're storing it directly
  },
});

module.exports = mongoose.model("product", productSchema);
