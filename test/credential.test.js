const { required } = require("joi");
const mongoose = require("mongoose");

const credSchema = new mongoose.Schema({
  fName: { type: String, required: true },
  lName: { type: String, required: true },
  image: { type: String },
  email: { type: String, required: true },
  phoneNo: { type: String, required: true },
  username: { type: String, required: true },
  address: { type: String, required: true },
  password: { type: String, required: true },
  isAdmin: { type: String, required: true },
  role: { type: String, required: true, default: "user" },
  loginAttempts: { type: Number, default: 0 },
  isLocked: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date },
});

const Credential = mongoose.model("credential", credSchema);

module.exports = Credential;
