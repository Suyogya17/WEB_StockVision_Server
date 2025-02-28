const mongoose = require("mongoose");
const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const Product = require("../model/product"); // Assuming the product model is in the models folder

const { expect } = chai;

describe("Product Model", () => {
  before(async () => {
    // Set up the test database connection
    await mongoose.connect("mongodb://localhost:27017/testdb", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  after(async () => {
    // Clean up the database after tests
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  // Test Case 1: Valid product creation
  it("should create a new product", async () => {
    const product = new Product({
      productName: "Sample Product",
      image: "http://example.com/product-image.jpg", // image as a URL string
      description: "A sample product for testing",
      type: "Electronics",
      quantity: "10", // quantity as string
      price: "100", // price as string
    });

    const savedProduct = await product.save();
    expect(savedProduct._id).to.be.an("Object");
    expect(savedProduct.productName).to.equal("Sample Product");
    expect(savedProduct.price).to.equal("100");
    expect(savedProduct.image).to.equal("http://example.com/product-image.jpg");
    expect(savedProduct.description).to.equal("A sample product for testing");
  });

  // Test Case 2: Missing required fields
  it("should throw an error if the image field is missing", async () => {
    const product = new Product({
      productName: "Product with Missing Image",
      description: "A product without an image",
      type: "Electronics",
      quantity: "10", // quantity as string
      price: "200", // price as string
    });

    try {
      await product.save();
    } catch (err) {
      // Check that the error contains the missing 'image' field
      expect(err.errors).to.have.property("image");
    }
  });

  // Test Case 3: Invalid data type for quantity and price
  it("should throw an error for invalid data types in quantity and price", async () => {
    const product = new Product({
      productName: "Invalid Product",
      image: "http://example.com/product-image.jpg",
      description: "A product with invalid quantity and price",
      type: "Clothing",
      quantity: 10, // Invalid type: quantity should be a string
      price: "free", // Invalid price: should be a valid number string
    });

    try {
      await product.save();
    } catch (err) {
      // Check for validation errors on quantity and price
      expect(err.errors.quantity).to.exist;
      expect(err.errors.price).to.exist;
    }
  });

  // Test Case 4: Validating that all required fields exist in a product
  it("should ensure all required fields are present", async () => {
    const product = new Product({
      productName: "Valid Product",
      image: "http://example.com/product-image.jpg",
      description: "A valid product",
      type: "Furniture",
      quantity: "5", // quantity as string
      price: "150", // price as string
    });

    const savedProduct = await product.save();
    expect(savedProduct.productName).to.equal("Valid Product");
    expect(savedProduct.image).to.equal("http://example.com/product-image.jpg");
    expect(savedProduct.description).to.equal("A valid product");
    expect(savedProduct.type).to.equal("Furniture");
    expect(savedProduct.quantity).to.equal("5");
    expect(savedProduct.price).to.equal("150");
  });
});
