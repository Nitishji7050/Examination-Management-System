// ===============================
// GLOBAL STYLES
// ===============================
import "./styles/main.css";
import "./styles/user.css";
import "./styles/teacher-dashboard.css";
import "./styles/student-dashboard.css";
import "./styles/feedback.css";
import "./styles/student-feedback.css";
import "./styles/new.css";


// ===============================
// PAGE IMPORTS
// ===============================
import { renderHome } from "./pages/Home.js";
import { renderTeacherDashboard } from "./pages/TeacherDashboard.js";
import { renderStudentExams } from "./pages/StudentDashboard.js";
import { renderExamEditor } from "./pages/ExamInterface.js";
import { renderStudentExam } from "./pages/StudentExamInterface.js";
import { renderStatisticsPage } from "./pages/StatisticsPage.js";

// 👥 STUDENT MANAGEMENT
import { renderManageStudents } from "./pages/ManageStudents.js";

// 💬 FEEDBACK MANAGEMENT
import { renderFeedbackList } from "./pages/FeedbackList.js";
import { renderGiveFeedback } from "./pages/GiveFeedback.js";

// ===============================
// ROUTER FUNCTION (SPA)
// ===============================
function router() {
  const path = window.location.pathname;
  const app = document.getElementById("app");

  // ===============================
  // TEACHER: EXAM STATISTICS
  // ===============================
  if (path.match(/^\/teacher\/exams\/([^/]+)\/statistics$/)) {
    const examId = path.split("/")[3];
    renderStatisticsPage(examId);
    return;
  }

  // ===============================
  // TEACHER: EXAM EDITOR
  // ===============================
  if (path.match(/^\/teacher\/exams\/([^/]+)$/)) {
    const examId = path.split("/")[3];
    renderExamEditor(examId);
    return;
  }

  // ===============================
  // STUDENT: EXAM INTERFACE
  // ===============================
  if (path.startsWith("/exam/")) {
    const examId = path.split("/").pop();
    renderStudentExam(examId);
    return;
  }

  // ===============================
  // STATIC ROUTES
  // ===============================
  switch (path) {
    // 🏠 HOME
    case "/":
      renderHome();
      break;

    // ===============================
    // 👨‍🏫 TEACHER ROUTES
    // ===============================
    case "/teacher/exams":
      renderTeacherDashboard();
      break;

    case "/teacher/students":
      renderManageStudents();
      break;

    case "/teacher/feedbacks":
      renderFeedbackList();
      break;

    // ===============================
    // 👨‍🎓 STUDENT ROUTES
    // ===============================
    case "/student/exams":
      renderStudentExams();
      break;

    case "/student/feedback":
      renderGiveFeedback();
      break;

    // ===============================
    // ❌ FALLBACK (404)
    // ===============================
    default:
      app.innerHTML = `
        <div style="padding:40px;text-align:center">
          <h1>404 - Page Not Found</h1>
          <p>The page you are looking for does not exist.</p>
        </div>
      `;
  }
}

// ===============================
// SPA EVENTS
// ===============================
window.addEventListener("DOMContentLoaded", router);
window.addEventListener("popstate", router);

// SPA Link Handling
document.addEventListener("click", (e) => {
  if (e.target.tagName === "A" && e.target.dataset.link === "spa") {
    e.preventDefault();
    history.pushState(null, "", e.target.getAttribute("href"));
    router();
  }
});
