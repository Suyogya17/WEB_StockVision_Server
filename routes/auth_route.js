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

// 📩 OTP-related routes
Router.post("/resend-otp", resendOTP);
Router.post("/verify-otp", verifyOTP);

// 🔐 Authentication routes
Router.post("/login", login);
Router.post("/register", uploadMiddleware.single("profilePicture"), register);

// 📸 Upload image
Router.post(
  "/uploadImage",
  uploadMiddleware.single("profilePicture"),
  uploadImage
);

// 👤 User routes
Router.put(
  "/updateUser/:id",
  uploadMiddleware.single("profilePicture"),
  authenticateToken,
  update
);
Router.get("/userfindbyid", authenticateToken, findbyid);
Router.get("/getAllUser", getAllUser);
Router.post("/request-reset", requestPasswordReset);
Router.post("/reset-password/:token", resetPassword);

module.exports = Router;
