const User = require("../model/credential");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOTP, sendUnlockEmail } = require("../utils/mailer");
const asyncHandler = require("../middleware/async");
const { logAction } = require("../utils/logger");
const { sendResetPasswordEmail } = require("../utils/mailer");
const MAX_ATTEMPTS = 5;
const crypto = require("crypto");

// ✅ Register new user
exports.register = asyncHandler(async (req, res) => {
  const { fName, lName, phoneNo, username, email, address, password, role } =
    req.body;

  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!strongRegex.test(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
    });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: "Email already registered" });
  }

  const hash = await bcrypt.hash(password, 10);

  // ✅ Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

  const user = await User.create({
    fName,
    lName,
    username,
    phoneNo,
    address,
    email,
    password: hash,
    role,
    otp,
    otpExpiry,
    isVerified: false,
  });

  // ✅ Send OTP to user email
  await sendOTP(email, otp);

  await logAction(user._id, "Registered and OTP sent", req.ip);
  res
    .status(201)
    .json({ message: "User registered successfully. OTP sent to email." });
});

// ✅ Login with password and unlock link if locked
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user)
    return res.status(400).json({ message: "Invalid email or password" });

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    user.loginAttempts += 1;

    if (user.loginAttempts >= MAX_ATTEMPTS) {
      user.isLocked = true;
      await user.save();

      const unlockLink = `https://localhost:3000/api/auth/unlock-account?email=${encodeURIComponent(
        email
      )}`;
      await sendUnlockEmail(user.email, unlockLink);

      return res.status(403).json({
        message: "Account locked. Unlock link sent to email.",
      });
    }

    await user.save();
    return res.status(401).json({ message: "Wrong password" });
  }

  if (user.isLocked) {
    return res.status(403).json({
      message: "Account is locked. Please check your email to unlock it.",
    });
  }

  if (!user.isVerified) {
    return res.status(401).json({
      message:
        "Please verify your account first. Check your email for the OTP.",
    });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  await logAction(user._id, "Login successful", req.ip);
  res.status(200).json({ message: "Login successful", token, user });
});

// ✅ (Optional) Verify OTP if used in another flow
exports.verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
    await logAction(user?._id || null, "Invalid OTP attempt", req.ip);
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  user.otp = null;
  user.otpExpires = null;
  user.loginAttempts = 0;
  user.isLocked = false;
  user.lastLogin = new Date();
  user.isVerified = true;
  await user.save();

  await logAction(user._id, "OTP verified & JWT issued", req.ip);

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.status(200).json({ message: "Login successful", token, user });
});

// ✅ Resend OTP (optional)
exports.resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  await sendOTP(email, otp);
  res.status(200).json({ message: "OTP resent successfully" });
});

// ✅ Unlock account manually via POST
exports.unlockAccount = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user || !user.isLocked)
    return res.status(400).json({ message: "User not locked or not found" });

  user.isLocked = false;
  user.loginAttempts = 0;
  await user.save();

  await logAction(user._id, "Account manually unlocked", req.ip);
  res.status(200).json({ message: "Account unlocked successfully" });
});

// ✅ Unlock account via GET link (email redirect)
exports.unlockAccountViaLink = asyncHandler(async (req, res) => {
  const { email } = req.query;

  const user = await User.findOne({ email });
  if (!user || !user.isLocked) {
    return res
      .status(400)
      .send(
        "<h3>Account not locked or user not found.</h3><p>You can close this page.</p>"
      );
  }

  user.isLocked = false;
  user.loginAttempts = 0;
  await user.save();

  await logAction(user._id, "Account unlocked via email link", req.ip);

  // ✅ Redirect to frontend login page
  return res.status(200).json({ message: "Account unlocked successfully!" });
});

// ✅ Upload profile picture
exports.uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const imageUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({
    success: true,
    message: "Image uploaded",
    imageUrl,
    data: req.file.filename,
  });
});

// ✅ Update user
exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { fName, lName, username, email, phoneNo, address, role } = req.body;
  const updateData = {
    fName,
    lName,
    username,
    email,
    phoneNo,
    address,
    role,
  };

  if (req.file) updateData.image = `/uploads/${req.file.filename}`;

  const updatedUser = await User.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  if (!updatedUser) return res.status(404).json({ message: "User not found" });

  res.status(200).json({ message: "User updated", user: updatedUser });
});

// ✅ Get user by token
exports.findbyid = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.status(200).json({ user });
});

// ✅ Get all users
exports.getAllUser = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
  res.status(200).json({ users });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const loggedInUserId = req.user.userId; // Extracted by authenticateToken middleware

  if (!email) return res.status(400).json({ message: "Email is required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  // ✅ SECURITY CHECK: Ensure email belongs to logged-in user
  if (user._id.toString() !== loggedInUserId) {
    return res
      .status(401)
      .json({ message: "Unauthorized request for password reset" });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const resetToken = crypto.createHash("sha256").update(token).digest("hex");

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpiry = Date.now() + 10 * 60 * 1000; // 10 min
  await user.save();

  const resetUrl = `https://localhost:5173/reset-password/${token}`;

  try {
    await sendResetPasswordEmail(user.email, resetUrl);
  } catch (err) {
    console.error("Failed to send reset email:", err);
    return res.status(500).json({ message: "Failed to send reset email." });
  }

  res
    .status(200)
    .json({
      success: true,
      message: "Password reset link sent to your email.",
    });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  const hash = await bcrypt.hash(password, 10);
  user.password = hash;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;
  await user.save();

  await logAction(user._id, "Password reset", req.ip);

  res.status(200).json({ message: "Password reset successfully" });
});
