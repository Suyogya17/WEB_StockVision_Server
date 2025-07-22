const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Credential",
    required: false // can be null for unauthenticated events like failed login
  },
  action: { type: String, required: true }, // e.g. "login", "register", "reset-password"
  status: { type: String, enum: ["success", "fail"], required: true },
  ip: { type: String },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ActivityLog", activityLogSchema);
