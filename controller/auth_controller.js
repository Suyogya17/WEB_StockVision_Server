const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "4d8ba63524bafdd9e9dde45a05118e7ffb99f4cdcd7d2543c7f7b77a6de9b302";
const Credential = require("../model/credential");
const asyncHandler = require("../middleware/async");
const path = require("path");

// Register a new user
const register = asyncHandler(async (req, res) => {
    console.log(req.body);
    const { fName, lName, phoneNo, email, username, address, password,image } = req.body;

    try {
        // Validate required fields
        if (!fName || !lName || !phoneNo || !email || !username || !address || !password) {
            return res.status(400).json({ message: "All fields are required!" });
        }

         // Check if the image is uploaded
         if (!image) {
            return res.status(400).json({ message: "Image is required!" });
        }

        // Check if the username already exists
        const existingUser = await Credential.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists!" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new credential
        const cred = new Credential({
            fName,
            lName,
            email,
            image,
            phoneNo,
            username,
            address,
            password: hashedPassword,
        });

        // Save the user to the database
        await cred.save();

        res.status(201).json({ success: true, data: cred });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login a user
const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the user exists
        const cred = await Credential.findOne({ username });
        if (!cred || !(await bcrypt.compare(password, cred.password))) {
            return res.status(403).json({ message: "Invalid Username or Password" });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { username: cred.username, role: cred.role },
            SECRET_KEY,
            { expiresIn: "24h" }
        );

        res.json({ success: true, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while logging in. Please try again later." });
    }
});

// Upload image
const uploadImage = asyncHandler(async (req, res) => {

     // // check for the file size and send an error message
  // if (req.file.size > process.env.MAX_FILE_UPLOAD) {
  //   return res.status(400).send({
  //     message: `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
  //   });
  // }

  if (!req.file) {
    return res.status(400).send({ message: "Please upload a file" });
  }
  res.status(200).json({
    success: true,
    data: req.file.filename,
  });
});
module.exports = {
    register,
    login,
    uploadImage,
};
