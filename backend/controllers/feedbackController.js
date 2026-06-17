const Feedback = require("../models/Feedback");

// ===============================
// ➕ ADD FEEDBACK (STUDENT)
// ===============================
exports.addFeedback = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const wordCount = message.trim().split(/\s+/).length;
    if (wordCount > 200) {
      return res.status(400).json({
        success: false,
        message: "Feedback must be within 200 words",
      });
    }

    const feedback = await Feedback.create({
      name,
      email,
      message,
    });

    res.status(201).json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    console.error("Add feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding feedback",
    });
  }
};

// ===============================
// 📄 GET ALL FEEDBACK (TEACHER)
// ===============================
exports.getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: feedbacks,
    });
  } catch (error) {
    console.error("Fetch feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching feedback",
    });
  }
};

// ===============================
// ❌ DELETE FEEDBACK (TEACHER)
// ===============================
exports.deleteFeedback = async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Feedback deleted successfully",
    });
  } catch (error) {
    console.error("Delete feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting feedback",
    });
  }
};
