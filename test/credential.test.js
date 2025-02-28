const mongoose = require("mongoose");
const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const Credential = require("../model/credential"); // Assuming your schema is in the models folder

const { expect } = chai;

chai.use(chaiHttp);

describe("Credential Model", () => {
  before(async () => {
    // Set up the test database connection
    await mongoose.connect("mongodb://localhost:27017/testdb", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  after(async () => {
    // Close the connection after tests
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  // Test Case 1: Valid credential creation
  it("should create a new credential", async () => {
    const credential = new Credential({
      fName: "John",
      lName: "Doe",
      image: "http://example.com/image.jpg",
      email: "john.doe@example.com",
      phoneNo: "1234567890",
      username: "johndoe",
      address: "123 Main St",
      password: "password123",
      isAdmin: "false",
      role: "user",
    });

    const savedCredential = await credential.save();
    expect(savedCredential._id.toString()).to.be.a("string"); // Convert _id to string
    expect(savedCredential.fName).to.equal("John");
    expect(savedCredential.email).to.equal("john.doe@example.com");
  });

  // Test Case 2: Invalid credential creation (missing required fields)
  it("should throw an error if required fields are missing", async () => {
    const credential = new Credential({
      fName: "John",
      lName: "Doe",
      email: "john.doe@example.com",
      phoneNo: "1234567890",
      username: "johndoe",
      address: "123 Main St",
      password: "password123",
      isAdmin: "false",
    });

    try {
      await credential.save();
    } catch (err) {
      expect(err.errors).to.have.property("role"); // 'role' is missing
    }
  });

  // Test Case 3: Email format validation
  it("should throw an error for invalid email format", async () => {
    const invalidCredential = new Credential({
      fName: "John",
      lName: "Doe",
      image: "http://example.com/image.jpg",
      email: "invalid-email",
      phoneNo: "1234567890",
      username: "johndoe",
      address: "123 Main St",
      password: "password123",
      isAdmin: "false",
      role: "user",
    });

    try {
      await invalidCredential.save();
    } catch (err) {
      expect(err.errors.email).to.exist;
      expect(err.errors.email.message).to.equal("Invalid email format");
    }
  });

  // Test Case 4: Check default value for role
  it('should have a default value for role as "user"', async () => {
    const credential = new Credential({
      fName: "Jane",
      lName: "Doe",
      image: "http://example.com/image.jpg",
      email: "jane.doe@example.com",
      phoneNo: "1234567890",
      username: "janedoe",
      address: "123 Main St",
      password: "password123",
      isAdmin: "false",
    });

    const savedCredential = await credential.save();
    expect(savedCredential.role).to.equal("user");
  });
});
