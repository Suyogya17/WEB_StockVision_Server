const asyncHandler = require("../middleware/async");
const Customer = require("../model/customer");
const nodemailer = require("nodemailer");
const crypto = require("crypto"); // Ensure this is included for crypto usage

// Forgot Password Request (Step 1)
const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body; // Email received from frontend
  console.log(`Request for password reset received for email: ${email}`);

  try {
    // Find user by email
    const user = await Customer.findOne({ email });
    if (!user) {
      console.error("User not found with this email.");
      return res.status(404).json({ message: "User not found with this email." });
    }

    // Generate a reset token (random string)
    const resetToken = crypto.randomBytes(20).toString('hex');
    console.log("Generated reset token:", resetToken);

    // Store the token and expiration time in the database
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send reset link via email
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Use the frontend URL from environment variable
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    console.log("Reset link:", resetLink);

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <h1>Reset Your Password</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
      `,
    });

    console.log("Email sent:", info);

    res.status(200).json({
      success: true,
      message: "Password reset link has been sent to your email.",
    });
  } catch (error) {
    console.error("Error during password reset:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = {
  requestPasswordReset,
};
