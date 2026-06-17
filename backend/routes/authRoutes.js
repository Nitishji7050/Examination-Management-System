const express = require("express");
const router = express.Router();

// Controllers import
const {
  registerUser,
  loginUser,
  forgotPassword,
  verifyOtp,
  resetPassword
} = require("../controllers/authController");

// ======================
// 🔐 AUTH ROUTES
// ======================

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// ======================
// 🔁 PASSWORD RESET ROUTES
// ======================

// Send OTP to email
router.post("/forgot-password", forgotPassword);

// Verify OTP
router.post("/verify-otp", verifyOtp);

// Reset password
router.post("/reset-password", resetPassword);

module.exports = router;