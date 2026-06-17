import { fetchStudentAttempts } from "../api/attempts.js";
import { fetchExamById } from "../api/exams.js";
import { getLoggedInUser, logout } from "../api/auth.js";
import "../styles/student-dashboard.css";

export async function renderStudentExams() {
  const app = document.getElementById("app");

  // 🔐 AUTH CHECK
  const user = getLoggedInUser();
  if (!user || user.userType !== "student") {
    history.pushState(null, "", "/");
    window.dispatchEvent(new Event("popstate"));
    return;
  }

  // 🧱 LAYOUT
  app.innerHTML = `
    <section class="dashboard student-dashboard">

      <!-- HEADER -->
      <header class="dashboard-header">
        <h1 class="dashboard-title">Student Dashboard</h1>

        <div class="header-user">
          <span class="user-name">${user.name}</span>
          <button id="logout-btn" class="logout-btn">Logout</button>
        </div>
      </header>

      <!-- ACTION BAR -->
      <div class="student-actions">
        <button id="give-feedback-btn" class="primary-btn">
          Give Feedback
        </button>
      </div>

      <!-- CONTENT -->
      <div class="student-exams">
        <div class="loading">Loading your exams...</div>
      </div>

    </section>
  `;

  // 🚪 LOGOUT
  document.getElementById("logout-btn").onclick = () => {
    logout();
    history.pushState(null, "", "/");
    window.dispatchEvent(new Event("popstate"));
  };

  // 💬 GIVE FEEDBACK BUTTON
  document.getElementById("give-feedback-btn").onclick = () => {
    history.pushState(null, "", "/student/feedback");
    window.dispatchEvent(new Event("popstate"));
  };

  try {
    const attemptsResponse = await fetchStudentAttempts();
    const attempts = attemptsResponse.attempts || attemptsResponse || [];

    const examAttempts = {};

    for (const attempt of attempts) {
      const examId = attempt.examId || attempt.exam;

      if (!examAttempts[examId]) {
        try {
          const examRes = await fetchExamById(examId);
          examAttempts[examId] = {
            exam: examRes.exam || examRes,
            attempts: [],
          };
        } catch {
          examAttempts[examId] = {
            exam: { title: "Unknown Exam" },
            attempts: [],
          };
        }
      }
      examAttempts[examId].attempts.push(attempt);
    }

    renderExamsDashboard(examAttempts);
  } catch {
    document.querySelector(".student-exams").innerHTML = `
      <div class="empty-state">
        <h3>Error Loading Exams</h3>
        <p>Please try again later.</p>
      </div>
    `;
  }
}

function renderExamsDashboard(examAttempts) {
  const hasExams = Object.keys(examAttempts).length > 0;

  document.querySelector(".student-exams").innerHTML = `
    <header class="dashboard-content-header">
      <h2>My Exams</h2>
      <p>View your exam history and results</p>
    </header>

    <main class="exams-container">
      ${hasExams ? renderExamCards(examAttempts) : renderEmptyState()}
    </main>
  `;
}

function renderExamCards(examAttempts) {
  return `
    <div class="exam-cards">
      ${Object.values(examAttempts)
        .map(({ exam, attempts }) => {
          const bestScore = Math.max(...attempts.map(a => a.score));
          return `
            <div class="exam-card">
              <h3>${exam.title}</h3>
              <div class="score-circle ${getScoreClass(bestScore)}">
                ${bestScore}%
              </div>
              <p>Best Score</p>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderEmptyState() {
  return `
    <div class="empty-state">
      <h3>No Exams Found</h3>
      <p>You haven't taken any exams yet.</p>
    </div>
  `;
}

function getScoreClass(p) {
  if (p >= 80) return "excellent";
  if (p >= 60) return "good";
  if (p >= 40) return "average";
  return "poor";
}
