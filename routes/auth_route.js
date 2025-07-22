const express = require("express");
const {
  register,
  login,
  uploadImage,
  update,
  findbyid,
  getAllUser,
  verifyOTP,
  requestPasswordReset,
  resetPassword,
  resendOTP,
} = require("../controller/auth_controller");

const uploadMiddleware = require("../middleware/uploads");
const { authenticateToken } = require("../security/auth");

const Router = express.Router();

// OTP
Router.post("/resend-otp", resendOTP);
Router.post("/verify-otp", verifyOTP);

// Auth
Router.post("/register", uploadMiddleware.single("profilePicture"), register);
Router.post("/login", login);

// Password
Router.post("/request-reset", requestPasswordReset);
Router.post("/reset-password/:token", resetPassword);

// User actions
Router.get("/userfindbyid",authenticateToken, findbyid);
Router.put("/updateUser/:id", uploadMiddleware.single("profilePicture"), authenticateToken, update);
Router.get("/getAllUser", getAllUser);

// Upload (optional)
Router.post("/uploadImage", uploadMiddleware.single("profilePicture"), uploadImage);

module.exports = Router;
