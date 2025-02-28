const mongoose = require("mongoose");
const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const Order = require("../model/order");
const Credential = require("../model/credential");
const Product = require("../model/product");
const { expect } = chai;

chai.use(chaiHttp);

describe("Order Model", () => {
  let customer, product;

  before(async () => {
    // Set up the test database connection
    await mongoose.connect("mongodb://localhost:27017/testdb", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create a sample customer (Credential) for testing
    customer = new Credential({
      fName: "John",
      lName: "Doe",
      email: "john.doe@example.com",
      phoneNo: "1234567890",
      username: "johndoe",
      address: "123 Main St",
      password: "password123",
      isAdmin: "false",
      role: "user",
    });
    await customer.save();

    // Create a sample product with all required fields
    product = new Product({
      productName: "Sample Product",
      price: "100",
      description: "A sample product for testing",
      image: "http://example.com/product-image.jpg",
    });
    await product.save();
  });

  after(async () => {
    // Clean up the database after tests
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  // Test Case 1: Valid order creation
// Test Case 1: Create an order with valid data
it("should create a new order with valid data", async () => {
    const order = new Order({
      customer: customer._id, // Reference to the existing customer
      products: [
        {
          product: product._id, // Reference to the existing product
          quantity: "1", // Quantity is a string (matching the schema)
        },
      ],
      totalPrice: "100", // The total price as a string (matching the schema)
      shippingAddress: "123 Main St", // Valid shipping address
    });
  
    const savedOrder = await order.save();
    
    // Validate that the order has been saved successfully
    expect(savedOrder).to.have.property("_id");
    expect(savedOrder.customer.toString()).to.equal(customer._id.toString());
    expect(savedOrder.products[0].product.toString()).to.equal(product._id.toString());
    expect(savedOrder.products[0].quantity).to.equal("1");
    expect(savedOrder.totalPrice).to.equal("100");
    expect(savedOrder.shippingAddress).to.equal("123 Main St");
    expect(savedOrder.status).to.equal("pending"); // Default status
  });
  

  // Test Case 2: Missing required fields
  it("should throw an error if required fields are missing", async () => {
    const order = new Order({
      customer: customer._id,
      products: [
        {
          product: product._id,
          quantity: "2",
        },
      ],
      // Missing totalPrice
      shippingAddress: "123 Main St",
    });

    try {
      await order.save();
    } catch (err) {
      expect(err.errors).to.have.property("totalPrice");
    }
  });

  // Test Case 3: Invalid product reference
  it("should throw an error for invalid product reference", async () => {
    const invalidProductId = new mongoose.Types.ObjectId();
    const order = new Order({
      customer: customer._id,
      products: [
        {
          product: invalidProductId, // Invalid product ID
          quantity: "2",
        },
      ],
      totalPrice: "200",
      shippingAddress: "123 Main St",
    });

    try {
      await order.save();
    } catch (err) {
      expect(err.errors).to.have.property("products");
    }
  });

  // Test Case 4: Check default status value
  it("should have a default status value of 'pending'", async () => {
    const order = new Order({
      customer: customer._id,
      products: [
        {
          product: product._id,
          quantity: "2",
        },
      ],
      totalPrice: "200",
      shippingAddress: "123 Main St",
    });

    const savedOrder = await order.save();
    expect(savedOrder.status).to.equal("pending");
  });
});
