const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const { teacherOnly } = require("../middleware/roleMiddleware");

const {
  getAllStudents,
  deleteStudent,
} = require("../controllers/userController");

/**
 * =========================
 * STUDENT MANAGEMENT ROUTES
 * =========================
 */

// Get all students
router.get(
  "/students",
  auth,
  teacherOnly,
  getAllStudents
);

// Delete a student
router.delete(
  "/students/:id",
  auth,
  teacherOnly,
  deleteStudent
);

module.exports = router;
