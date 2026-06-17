const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// ====================
// ENV & DATABASE
// ====================
dotenv.config();
connectDB();

const app = express();

// ====================
// GLOBAL MIDDLEWARE
// ====================
app.use(
  cors({
    origin: true, // allow all origins (frontend dev friendly)
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ====================
// API ROUTES
// ====================

// 🔐 Authentication
app.use("/api/auth", require("./routes/authRoutes"));

// 📝 Exams
app.use("/api/exams", require("./routes/examRoutes"));

// ❓ Questions
app.use("/api/questions", require("./routes/questionRoutes"));

// 🧪 Exam Attempts
app.use("/api/attempts", require("./routes/attemptRoutes"));

// 👥 Users / Students
app.use("/api/users", require("./routes/userRoutes"));

// 💬 Feedback (Student → Teacher)
app.use("/api/feedback", require("./routes/feedbackRoutes"));

// ====================
// HEALTH CHECK / ROOT
// ====================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Online Examination Management System API is running",
    environment: process.env.NODE_ENV || "development",
  });
});

// ====================
// GLOBAL 404 HANDLER
// ====================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "❌ API route not found",
    path: req.originalUrl,
  });
});

// ====================
// GLOBAL ERROR HANDLER
// ====================
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ====================
// SERVER START
// ====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
