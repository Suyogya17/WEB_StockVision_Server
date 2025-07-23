require("dotenv").config();
const nodemailer = require("nodemailer");

// ✅ Create reusable transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Send OTP mail
exports.sendOTP = async (email, otp) => {
  const mailOptions = {
    from: `"StockVision Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP for StockVision Login",
    html: `<p>Your OTP is <b>${otp}</b>. It will expire in 5 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
};

// ✅ Send Unlock Account Link email
exports.sendUnlockEmail = async (email, unlockLink) => {
  const mailOptions = {
    from: `"StockVision Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Account Locked - Unlock Now",
    html: `
      <h3>Your account has been locked due to multiple failed login attempts.</h3>
      <p>Please click the button below to unlock your account:</p>
      <a href="${unlockLink}" style="display:inline-block;padding:10px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:4px;">
        Unlock Account
      </a>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
