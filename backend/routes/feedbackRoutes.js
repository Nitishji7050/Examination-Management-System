const express = require("express");
const router = express.Router();

const {
  addFeedback,
  getAllFeedback,
  deleteFeedback,
} = require("../controllers/feedbackController");

const auth = require("../middleware/authMiddleware");
const {
  teacherOnly,
  studentOnly,
} = require("../middleware/roleMiddleware");

// 🧑‍🎓 STUDENT
router.post("/", auth, studentOnly, addFeedback);

// 👨‍🏫 TEACHER
router.get("/", auth, teacherOnly, getAllFeedback);
router.delete("/:id", auth, teacherOnly, deleteFeedback);

module.exports = router;
