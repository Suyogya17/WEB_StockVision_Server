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

  await transporter.sendMail(mailOptions); // <- Don't forget to call it
};

// ✅ Send Order Confirmation Email
exports.sendOrderConfirmationEmail = async (email, order) => {
  const itemsList = order.products
    .map(
      (item) =>
        `<li>${item.quantity} x ${item.product.productName} - $${item.product.price}</li>`
    )
    .join("");

  const mailOptions = {
    from: `"StockVision Orders" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Order Confirmation - StockVision",
    html: `
      <h2>Order Confirmation</h2>
      <p>Thank you for your purchase! Your order has been placed successfully.</p>
      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>Total Price:</strong> $${order.totalPrice}</p>
      <p><strong>Shipping Address:</strong> ${order.shippingAddress}</p>
      <h4>Items:</h4>
      <ul>${itemsList}</ul>
      <p>Status: ${order.status} | Payment: ${order.paymentStatus}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

exports.sendResetPasswordEmail = async (email, resetUrl) => {
  const mailOptions = {
    from: `"StockVision Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your StockVision Password",
    html: `
      <h2>Password Reset</h2>
      <p>You requested to reset your password.</p>
      <p>Click below to set a new one:</p>
      <a href="${resetUrl}" style="padding:10px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:5px;">
        Reset Password
      </a>
      <p>This link is valid for 10 minutes.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
