const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const PasswordReset = require("../models/PasswordReset");
const nodemailer = require("nodemailer");

// ======================
// 📧 EMAIL CONFIG
// ======================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ======================
// 🔢 OTP GENERATOR
// ======================
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ======================
// 📝 REGISTER
// ======================
exports.registerUser = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    userType,
    dateOfBirth,
    gender,
    institution,
    fieldOfStudy,
  } = req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !userType ||
    !dateOfBirth ||
    !gender ||
    !institution ||
    !fieldOfStudy
  ) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      userType,
      dateOfBirth,
      gender,
      institution,
      fieldOfStudy,
    });

    return res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      message: "Server error during registration",
    });
  }
};

// ======================
// 🔐 LOGIN
// ======================
exports.loginUser = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({
      message: "Email, password and role are required",
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user || user.userType !== role) {
      return res.status(400).json({
        message: "Invalid credentials or role",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({
        message: "Invalid credentials",
      });

    const token = jwt.sign(
      { id: user._id, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const fullName = `${user.firstName} ${user.lastName}`;

    return res.status(200).json({
      token,
      userType: user.userType,
      name: fullName,
      userId: user._id,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      message: "Server error during login",
    });
  }
};

// ======================
// 📩 FORGOT PASSWORD
// ======================
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email is required",
    });
  }

  try {
    const user = await User.findOne({ email });

    // 🔥 UPDATED MESSAGE
    if (!user) {
      return res.status(404).json({
        message: "No account found with this email",
      });
    }

    const otp = generateOTP();

    await PasswordReset.findOneAndUpdate(
      { email },
      {
        otp,
        expiry: new Date(Date.now() + 5 * 60 * 1000),
        isVerified: false,
      },
      { upsert: true }
    );

    await transporter.sendMail({
      from: `"Online Exam System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP is ${otp}`,
    });

    return res.status(200).json({
      message: "OTP sent successfully to your email",
    });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    return res.status(500).json({
      message: "Error sending OTP",
    });
  }
};

// ======================
// 🔢 VERIFY OTP
// ======================
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      message: "Email and OTP are required",
    });
  }

  try {
    const record = await PasswordReset.findOne({ email, otp });

    if (!record) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (new Date() > record.expiry) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    record.isVerified = true;
    await record.save();

    return res.status(200).json({
      message: "OTP verified successfully",
    });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    return res.status(500).json({
      message: "Error verifying OTP",
    });
  }
};

// ======================
// 🔐 RESET PASSWORD
// ======================
exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({
      message: "Email and new password are required",
    });
  }

  try {
    const record = await PasswordReset.findOne({
      email,
      isVerified: true,
    });

    if (!record) {
      return res.status(400).json({
        message: "OTP not verified",
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await User.updateOne({ email }, { password: hashed });

    await PasswordReset.deleteOne({ email });

    return res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error("Reset Password Error:", err);
    return res.status(500).json({
      message: "Error resetting password",
    });
  }
};