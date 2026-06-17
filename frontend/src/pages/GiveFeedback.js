import { getLoggedInUser } from "../api/auth.js";
import "../styles/student-feedback.css";


/**
 * ===============================
 * RENDER GIVE FEEDBACK PAGE
 * ===============================
 */
export function renderGiveFeedback() {
  const app = document.getElementById("app");
  const user = getLoggedInUser();

  // 🔐 STUDENT ONLY ACCESS
  if (!user || user.userType !== "student") {
    history.pushState(null, "", "/");
    window.dispatchEvent(new Event("popstate"));
    return;
  }

  // ===============================
  // UI
  // ===============================
  app.innerHTML = `
    <section class="feedback-page">
      <h1>Give Feedback</h1>

      <form id="feedback-form" class="feedback-form">

        <!-- NAME -->
        <div class="form-group">
          <label>Name</label>
          <input
            type="text"
            id="name"
            value="${user.name || ""}"
            readonly
          />
        </div>

        <!-- EMAIL -->
        <div class="form-group">
          <label>Email</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            value="${user.email || ""}"
            required
          />
        </div>

        <!-- MESSAGE -->
        <div class="form-group">
          <label>Feedback (max 200 words)</label>
          <textarea
            id="message"
            placeholder="Write your feedback here..."
            maxlength="200"
            rows="5"
            required
          ></textarea>
          <small id="word-count">0 / 200 words</small>
        </div>

        <!-- SUBMIT -->
        <button type="submit" class="primary-btn">
          Submit Feedback
        </button>

      </form>
    </section>
  `;

  // ===============================
  // WORD COUNT LOGIC
  // ===============================
  const messageInput = document.getElementById("message");
  const wordCountEl = document.getElementById("word-count");

  messageInput.addEventListener("input", () => {
    const words = messageInput.value.trim()
      ? messageInput.value.trim().split(/\s+/).length
      : 0;
    wordCountEl.textContent = `${words} / 200 words`;
  });

  // ===============================
  // FORM SUBMIT
  // ===============================
  document
    .getElementById("feedback-form")
    .addEventListener("submit", submitFeedback);
}

/**
 * ===============================
 * SUBMIT FEEDBACK HANDLER
 * ===============================
 */
async function submitFeedback(e) {
  e.preventDefault();

  const data = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    message: document.getElementById("message").value.trim(),
  };

  // ===============================
  // CLIENT VALIDATION
  // ===============================
  if (!data.email) {
    alert("❌ Email is required");
    return;
  }

  if (!data.message) {
    alert("❌ Feedback message is required");
    return;
  }

  if (data.message.split(/\s+/).length > 200) {
    alert("❌ Feedback must be within 200 words");
    return;
  }

  // ===============================
  // API CALL (🔥 FIXED URL)
  // ===============================
  try {
    const res = await fetch("http://localhost:3000/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Submit failed");
    }

    // ===============================
    // SUCCESS
    // ===============================
    alert("✅ Feedback submitted successfully");

    history.pushState(null, "", "/student/exams");
    window.dispatchEvent(new Event("popstate"));

  } catch (err) {
    console.error("Feedback submit error:", err);
    alert("❌ Failed to submit feedback");
  }
}
