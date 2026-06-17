import { fetchExams, createExam } from "../api/exams.js";
import { logout, getLoggedInUser } from "../api/auth.js";
import { generateUniqueId } from "../utils/helpers.js";

export async function renderTeacherDashboard() {
  const app = document.getElementById("app");

  // 🔐 AUTH CHECK (TEACHER ONLY)
  const user = getLoggedInUser();
  if (!user || user.userType !== "teacher") {
    history.pushState(null, "", "/");
    window.dispatchEvent(new Event("popstate"));
    return;
  }

  // ======================
  // MAIN LAYOUT
  // ======================
  app.innerHTML = `
    <section class="dashboard teacher-dashboard">

      <!-- HEADER -->
      <header class="dashboard-header">
        <h1>Teacher / Admin Dashboard</h1>

        <div class="header-right">
          <span class="user-name">${user.name}</span>
          <button id="logout-btn" class="secondary-btn">Logout</button>
        </div>
      </header>

      <!-- ACTION BAR -->
      <div class="dashboard-actions">
        <button id="create-exam-btn" class="primary-btn">
          Create New Exam
        </button>

        <button id="manage-students-btn" class="secondary-btn">
          Manage Students
        </button>

        <button id="see-feedback-btn" class="secondary-btn">
          See Feedback
        </button>
      </div>

      <!-- CONTENT -->
      <div id="dashboard-content">
        <div class="loading">Loading exams...</div>
      </div>

      <!-- CREATE EXAM MODAL -->
      <div id="create-exam-dialog" class="dialog-overlay hidden">
        <div class="dialog-content">
          <h2>Create New Exam</h2>

          <form id="create-exam-form">
            <div class="form-group">
              <label>Title</label>
              <input type="text" name="title" required />
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea name="description" rows="3" required></textarea>
            </div>

            <div class="form-group">
              <label>Target Audience</label>
              <input type="text" name="targetAudience" required />
            </div>

            <div id="exam-error" class="form-error hidden"></div>

            <div class="form-actions">
              <button type="button" id="cancel-create-exam" class="secondary-btn">
                Cancel
              </button>
              <button type="submit" class="primary-btn">
                Create Exam
              </button>
            </div>
          </form>
        </div>
      </div>

    </section>
  `;

  const content = document.getElementById("dashboard-content");
  const dialog = document.getElementById("create-exam-dialog");
  const form = document.getElementById("create-exam-form");
  const errorBox = document.getElementById("exam-error");

  // ======================
  // LOAD EXAMS
  // ======================
  async function loadExams() {
    content.innerHTML = `<div class="loading">Loading exams...</div>`;
    try {
      const data = await fetchExams();
      const exams = Array.isArray(data) ? data : data?.exams || [];
      renderExamCards(exams);
    } catch {
      content.innerHTML = `
        <div class="error-message">
          Failed to load exams
        </div>
      `;
    }
  }

  // ======================
  // CREATE EXAM MODAL
  // ======================
  document.getElementById("create-exam-btn").onclick = () =>
    dialog.classList.remove("hidden");

  document.getElementById("cancel-create-exam").onclick = () =>
    dialog.classList.add("hidden");

  // ======================
  // SUBMIT EXAM
  // ======================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.classList.add("hidden");

    const examData = {
      id: generateUniqueId(),
      title: form.title.value.trim(),
      description: form.description.value.trim(),
      targetAudience: form.targetAudience.value.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      await createExam(examData);
      dialog.classList.add("hidden");
      form.reset();
      loadExams();
    } catch (err) {
      errorBox.textContent = err.message || "Failed to create exam";
      errorBox.classList.remove("hidden");
    }
  });

  // ======================
  // MANAGE STUDENTS
  // ======================
  document.getElementById("manage-students-btn").onclick = () => {
    history.pushState(null, "", "/teacher/students");
    window.dispatchEvent(new Event("popstate"));
  };

  // ======================
  // SEE FEEDBACK
  // ======================
  document.getElementById("see-feedback-btn").onclick = () => {
    history.pushState(null, "", "/teacher/feedbacks");
    window.dispatchEvent(new Event("popstate"));
  };

  // ======================
  // LOGOUT
  // ======================
  document.getElementById("logout-btn").onclick = () => {
    logout();
    history.pushState(null, "", "/");
    window.dispatchEvent(new Event("popstate"));
  };

  loadExams();
}

/* ======================
   EXAM CARDS
====================== */
function renderExamCards(exams) {
  const container = document.getElementById("dashboard-content");

  if (!exams.length) {
    container.innerHTML = `
      <div class="no-exams-message">
        <p>No exams created yet.</p>
        <p>Click "Create New Exam" to add one.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="exam-cards-container">
      ${exams
        .map(
          (e) => `
        <div class="exam-card" data-id="${e.id}">
          <h3 class="exam-title">${e.title}</h3>
          <div class="exam-audience">
            Audience: ${e.targetAudience}
          </div>
          <p class="exam-description">${e.description}</p>
          <div class="exam-meta">
            Created: ${new Date(e.createdAt).toLocaleDateString()}
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `;

  container.querySelectorAll(".exam-card").forEach((card) => {
    card.onclick = () => {
      history.pushState(null, "", `/teacher/exams/${card.dataset.id}`);
      window.dispatchEvent(new Event("popstate"));
    };
  });
}
