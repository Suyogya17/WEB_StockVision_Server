const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Credential = require("../model/credential");
const asyncHandler = require("../middleware/async");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const logActivity = require("../utils/logActivity");

const SECRET_KEY =
  "4d8ba63524bafdd9e9dde45a05118e7ffb99f4cdcd7d2543c7f7b77a6de9b302";
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000;

// 🔐 Generate OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// 📧 Email Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "suyogyashrestha17@gmail.com",
    pass: "awbpbkaarbfhvztm",
  },
});

// ✅ Register with Email OTP
const register = asyncHandler(async (req, res) => {
  const { fName, lName, phoneNo, email, username, address, password } =
    req.body;
  if (
    !fName ||
    !lName ||
    !phoneNo ||
    !email ||
    !username ||
    !address ||
    !password
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existingUser = await Credential.findOne({
    $or: [{ username }, { email }],
  });
  if (existingUser)
    return res.status(400).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = generateOTP();
  const otpExpiry = Date.now() + 10 * 60 * 1000;

  const newUser = new Credential({
    fName,
    lName,
    phoneNo,
    email,
    username,
    address,
    password: hashedPassword,
    otp,
    otpExpiry,
    isVerified: false,
    isAdmin: false,
  });

  await newUser.save();
  await logActivity({
    req,
    userId: newUser._id,
    action: "register",
    status: "success",
  });

  await transporter.sendMail({
    from: "your-email@gmail.com",
    to: email,
    subject: "Your OTP for verification",
    text: `Your OTP is ${otp}. It expires in 10 minutes.`,
  });

  res.status(201).json({ success: true, message: "OTP sent to email" });
});

// ✅ Verify OTP
const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await Credential.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.otp !== otp || Date.now() > user.otpExpiry) {
    await logActivity({
      req,
      userId: user._id,
      action: "verify-otp",
      status: "fail",
    });
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  await logActivity({
    req,
    userId: user._id,
    action: "verify-otp",
    status: "success",
  });

  const token = jwt.sign(
    {
      userId: user._id,
      role: user.isAdmin ? "admin" : "user",
      username: user.username,
    },
    SECRET_KEY,
    { expiresIn: "7d" }
  );

  res
    .status(200)
    .json({ success: true, message: "Verification successful", token });
});

// 🔁 Resend OTP
const resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await Credential.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.isVerified)
    return res.status(400).json({ message: "User already verified" });

  const newOTP = generateOTP();
  user.otp = newOTP;
  user.otpExpiry = Date.now() + 10 * 60 * 1000;
  await user.save();

  await transporter.sendMail({
    from: "your-email@gmail.com",
    to: email,
    subject: "Resent OTP",
    text: `Your new OTP is ${newOTP}. It expires in 10 minutes.`,
  });

  await logActivity({
    req,
    userId: user._id,
    action: "resend-otp",
    status: "success",
  });

  res.status(200).json({ success: true, message: "New OTP sent to email" });
});

// ✅ Login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await Credential.findOne({ email });
  if (!user)
    return res.status(403).json({ message: "Invalid email or password" });

  if (!user.isVerified)
    return res.status(403).json({ message: "Please verify your account" });

  if (user.lockUntil && user.lockUntil > Date.now()) {
    await logActivity({
      req,
      userId: user._id,
      action: "login",
      status: "locked",
    });
    return res
      .status(403)
      .json({ message: "Account locked. Try again later." });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    user.loginAttempts += 1;
    if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.lockUntil = Date.now() + LOCK_TIME;
    }
    await user.save();
    await logActivity({
      req,
      userId: user._id,
      action: "login",
      status: "fail",
    });
    return res.status(403).json({ message: "Invalid credentials" });
  }

  user.loginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();

  const token = jwt.sign(
    {
      userId: user._id,
      role: user.isAdmin ? "admin" : "user",
      username: user.username,
    },
    SECRET_KEY,
    { expiresIn: "7d" }
  );

  await logActivity({
    req,
    userId: user._id,
    action: "login",
    status: "success",
  });

  res.status(200).json({ success: true, token, user });
});

// ✅ Upload Image
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: "Please upload a file" });
  }

  res.status(200).json({
    success: true,
    data: req.file.filename,
  });
});

// ✅ Update User
const update = asyncHandler(async (req, res) => {
  const updateData = req.body;
  if (req.file) updateData.image = req.file.filename;

  const updatedUser = await Credential.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedUser) return res.status(404).send({ message: "User not found" });

  res.status(200).json({ success: true, data: updatedUser });
});

// ✅ Get User by Token
const findbyid = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(422).json({ error: "Invalid user ID" });
  }

  const user = await Credential.findById(userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  res.status(200).json(user);
});

// ✅ Get All Users
const getAllUser = asyncHandler(async (req, res) => {
  const users = await Credential.find();
  res.status(200).json({ success: true, count: users.length, data: users });
});

// ✅ Request Password Reset
const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await Credential.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpiry = Date.now() + 15 * 60 * 1000;
  await user.save();

  const resetUrl = `http://localhost:5173/uresetpassword/${token}`;

  await transporter.sendMail({
    from: "your-email@gmail.com",
    to: user.email,
    subject: "Password Reset Request",
    text: `You requested a password reset. Click here to reset: ${resetUrl}`,
  });

  await logActivity({
    req,
    userId: user._id,
    action: "request-reset",
    status: "success",
  });

  res.status(200).json({ message: "Password reset link sent to email" });
});

// ✅ Reset Password
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const resetToken = req.params.token;

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await Credential.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiry: { $gt: Date.now() },
  });

  if (!user)
    return res.status(400).json({ message: "Invalid or expired token" });

  const isSamePassword = await bcrypt.compare(password, user.password);
  if (isSamePassword) {
    return res.status(400).json({ message: "Cannot reuse old password" });
  }

  const hashedNewPassword = await bcrypt.hash(password, 10);
  user.password = hashedNewPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;

  await user.save();

  await logActivity({
    req,
    userId: user._id,
    action: "reset-password",
    status: "success",
  });

  res.status(200).json({ message: "Password reset successful" });
});

module.exports = {
  register,
  verifyOTP,
  login,
  uploadImage,
  update,
  findbyid,
  getAllUser,
  resendOTP,
  requestPasswordReset,
  resetPassword,
};
