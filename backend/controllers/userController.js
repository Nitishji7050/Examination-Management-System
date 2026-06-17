const User = require("../models/User");

/**
 * GET ALL STUDENTS
 * @route GET /api/users/students
 * @access Private (teacher/admin)
 */
exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ userType: "student" })
      .select("-password") // password hide
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error("Get students error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch students",
    });
  }
};

/**
 * DELETE STUDENT
 * @route DELETE /api/users/students/:id
 * @access Private (teacher/admin)
 */
exports.deleteStudent = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (student.userType !== "student") {
      return res.status(400).json({
        success: false,
        message: "Only students can be deleted here",
      });
    }

    await student.deleteOne();

    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("Delete student error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete student",
    });
  }
};
