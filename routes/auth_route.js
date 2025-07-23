const express = require("express");
const {
  register,
  login,
  uploadImage,
  update,
  findbyid,
  verifyOTP,
  resendOTP,
  getAllUser,
  unlockAccount,
  unlockAccountViaLink,
} = require("../controller/auth_controller");

const uploadMiddleware = require("../middleware/uploads");
const { authenticateToken } = require("../security/auth");

const Router = express.Router();

// ✅ AUTH routes
Router.post("/register", uploadMiddleware.single("profilePicture"), register);
Router.post("/login", login);
Router.post("/verify-otp", verifyOTP);
Router.post("/resend-otp", resendOTP);

// ✅ UNLOCK routes
Router.post("/unlock", unlockAccount); // manual unlock (form-based)
Router.get("/unlock-account", unlockAccountViaLink); // ✅ this is correct


// ✅ PROFILE routes
Router.post(
  "/uploadImage",
  uploadMiddleware.single("image"),
  uploadImage
);
Router.put(
  "/updateUser/:id",
  uploadMiddleware.single("image"),
  authenticateToken,
  update
);
Router.get("/userfindbyid", authenticateToken, findbyid);
Router.get("/getAllUser", getAllUser);

module.exports = Router;
