const ActivityLog = require("../model/activityLog");

const logActivity = async ({ req, userId, action, status }) => {
  try {
    await ActivityLog.create({
      userId,
      action,
      status,
      ip: req.ip || req.headers["x-forwarded-for"] || "unknown",
      userAgent: req.headers["user-agent"] || "unknown",
    });
  } catch (e) {
    console.error("Failed to log activity:", e.message);
  }
};

module.exports = logActivity;
