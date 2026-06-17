import { getLoggedInUser } from "../api/auth.js";
import "../styles/feedback.css";

export async function renderFeedbackList() {
  const app = document.getElementById("app");
  const user = getLoggedInUser();

  // 🔐 TEACHER ONLY ACCESS
  if (!user || user.userType !== "teacher") {
    history.pushState(null, "", "/");
    window.dispatchEvent(new Event("popstate"));
    return;
  }

  // =========================
  // PAGE LAYOUT
  // =========================
  app.innerHTML = `
  <section class="feedback-page">
    <h1 class="page-title">Student Feedback</h1>

    <div class="table-wrapper">
      <table class="feedback-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Feedback</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody id="feedback-container">
          <tr>
            <td colspan="4" class="loading">Loading feedback...</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
`;


  const container = document.getElementById("feedback-container");

  // =========================
  // FETCH FEEDBACK
  // =========================
  try {
    const res = await fetch("http://localhost:3000/api/feedback", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || "Failed to fetch feedback");
    }

    // Support both formats:
    // 1) [ {...}, {...} ]
    // 2) { success: true, data: [...] }
    const feedbacks = Array.isArray(result)
      ? result
      : result.data || [];

    renderFeedbackCards(feedbacks);
  } catch (err) {
    console.error("Feedback fetch error:", err);
    container.innerHTML = `
      <p class="error">❌ ${err.message || "Error loading feedback"}</p>
    `;
  }
}

// =========================
// RENDER FEEDBACK CARDS
// =========================
function renderFeedbackCards(feedbacks) {
  const container = document.getElementById("feedback-container");

  if (!feedbacks.length) {
    container.innerHTML = `
      <tr>
        <td colspan="4" class="empty">No feedback submitted yet.</td>
      </tr>
    `;
    return;
  }

  container.innerHTML = feedbacks
    .map(
      (f) => `
        <tr>
          <td>${escapeHTML(f.name)}</td>
          <td>${escapeHTML(f.email)}</td>
          <td class="message-cell">${escapeHTML(f.message)}</td>
          <td>
            <button 
              class="delete-btn"
              onclick="deleteFeedback('${f._id}')"
            >
              Delete
            </button>
          </td>
        </tr>
      `
    )
    .join("");
}

// =========================
// DELETE FEEDBACK (GLOBAL)
// =========================
window.deleteFeedback = async function (id) {
  if (!confirm("Are you sure you want to delete this feedback?")) return;

  try {
    const res = await fetch(`http://localhost:3000/api/feedback/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || "Delete failed");
    }

    // reload list
    renderFeedbackList();
  } catch (err) {
    console.error("Delete feedback error:", err);
    alert(`❌ ${err.message || "Failed to delete feedback"}`);
  }
};

// =========================
// BASIC HTML ESCAPE (SECURITY)
// =========================
function escapeHTML(str = "") {
  return String(str).replace(/[&<>"']/g, (m) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[m];
  });
}
