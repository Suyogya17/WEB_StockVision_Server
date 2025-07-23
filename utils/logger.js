const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "../logs/activity.log");

// Ensure logs directory exists
fs.mkdirSync(path.dirname(logFile), { recursive: true });

exports.logAction = (userId, action, ip) => {
  const logEntry = `[${new Date().toISOString()}] User: ${userId || "N/A"} | Action: ${action} | IP: ${ip || "N/A"}\n`;
  fs.appendFileSync(logFile, logEntry);
};
