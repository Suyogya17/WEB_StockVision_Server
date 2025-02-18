const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "4d8ba63524bafdd9e9dde45a05118e7ffb99f4cdcd7d2543c7f7b77a6de9b302";
const Credential = require("../model/credential");
const asyncHandler = require("../middleware/async");
const path = require("path");
const mongoose = require("mongoose");

// Register a new user
const register = asyncHandler(async (req, res) => {
    console.log(req.body);
    const { fName, lName, phoneNo, email, username, address, password, image } = req.body;

    try {
        // Validate required fields
        if (!fName || !lName || !phoneNo || !email || !username || !address || !password) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        // Uncomment and validate image if needed
        // if (!image) {
        //     return res.status(400).json({ message: "Image is required!" });
        // }

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
            isAdmin: false // Assuming the user is not an admin by default
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

        // Generate a JWT token (fix role to use 'isAdmin')
        const token = jwt.sign(
            { username: cred.username, role: cred.isAdmin ? 'admin' : 'user', userId: cred._id }, // Updated role handling
            SECRET_KEY,
            { expiresIn: "7d" }
        );

        res.json({ success: true, token, cred });
        console.log(cred);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while logging in. Please try again later." });
    }
});

// Upload image
const uploadImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: "Please upload a file" });
    }

    res.status(200).json({
        success: true,
        data: req.file.filename,
    });
});

// const update = asyncHandler(async (req, res) => {
//     try {
//         const user = await Credential.findByIdAndUpdate(
//             req.params.id,
//             req.body,
//             { new: true, runValidators: true }
//         );

//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User not found",
//             });
//         }

//         res.status(200).json({
//             success: true,
//             message: "User updated successfully",
//             data: user, // Correct variable name
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Failed to update User",
//             error: error.message, // Correct variable name
//         });
//     }
// });
// const update = asyncHandler(async (req, res) => {
//     try {
//         const updatedUser = await Credential.findByIdAndUpdate(
//             req.params.id,
//             req.body,  // Directly update without checking duplicates
//             { new: true, runValidators: true, upsert: false }  // Prevents inserting new records
//         );

//         if (!updatedUser) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User not found",
//             });
//         }

//         res.status(200).json({
//             success: true,
//             message: "User updated successfully",
//             data: updatedUser,
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Failed to update User",
//             error: error.message,
//         });
//     }
// });
// // Find user by ID
// const findById = asyncHandler(async (req, res) => {
//     try {
//       // Check if the user ID from token matches the ID in the URL
//       if (req.user.id !== req.params.id) {
//         return res.status(403).json({
//           success: false,
//           message: "You are not authorized to view this user's details",
//         });
//       }
  
//       // Find the user by ID
//       const userfind = await Credential.findById(req.params.id);
  
//       // If user is not found, return 404
//       if (!userfind) {
//         return res.status(404).json({
//           success: false,
//           message: "User not found",
//         });
//       }
  
//       // Return user details
//       res.status(200).json({
//         success: true,
//         data: userfind,
//       });
//     } catch (error) {
//       // Catch any errors and return 500
//       res.status(500).json({
//         success: false,
//         message: "Failed to fetch User",
//         error: error.message,
//       });
//     }
//   });
  
const update = asyncHandler(async (req, res) => {
    const user = req.body;

    // Handle file upload if present
    if (req.files && req.files.profilePicture) {
        const profilePicture = req.files.profilePicture;
        const filePath = path.join(__dirname, "../uploads", profilePicture.name);

        // Move the file to the uploads directory
        profilePicture.mv(filePath, async (err) => {
            if (err) {
                return res.status(500).send({ message: "File upload failed" });
            }

            // Update the user's profile with the new image path
            user.image = profilePicture.name;
            // Now proceed with the rest of the update logic
            const cred = await Credential.findByIdAndUpdate(req.params.id, user, {
                new: true,
                runValidators: true,
            });

            if (!cred) {
                return res.status(404).send({ message: "User not found" });
            }

            return res.status(200).json({
                success: true,
                message: "User image updated successfully",
                cred,
            });
        });
    } else {
        // Proceed without image update if no file is provided
        const cred = await Credential.findByIdAndUpdate(req.params.id, user, {
            new: true,
            runValidators: true,
        });

        if (!cred) {
            return res.status(404).send({ message: "User not found" });
        }

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            cred,
        });
    }
});



// Find user by ID
const findbyid = async (req, res) => {
    try {
        console.log('User data from token:', req.user); 

        const userId = req.user.userId;
        
        if (!userId) {
            return res.status(400).json({ error: "User ID is missing" });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(422).json({ error: "Invalid User ID" });
        }

        // Fetch user by userId
        const cred = await Credential.findById(userId);

        if (!cred) {
            return res.status(404).json({ error: "User not found by findbyid" });
        }

        console.log('User data found:', cred);
        res.status(200).json(cred);

    } catch (e) {
        console.error('Error while fetching user data:', e);
        res.status(500).json({ error: 'Server error' });
    }
};

  module.exports = {
    register,
    login,
    uploadImage,
    update,
    findbyid,
  };
  