import { fetchStudents, deleteStudent } from "../api/users.js";
import { getLoggedInUser } from "../api/auth.js";

export async function renderManageStudents() {
  const app = document.getElementById("app");

  // 🔐 AUTH CHECK
  const user = getLoggedInUser();
  if (!user || user.userType !== "teacher") {
    history.pushState(null, "", "/");
    window.dispatchEvent(new Event("popstate"));
    return;
  }

  app.innerHTML = `<h2>Loading students...</h2>`;

  try {
    const res = await fetchStudents();
    const students = res.students || [];

    app.innerHTML = `
      <section class="manage-students-page">
        <h1>Manage Students</h1>

        ${
          students.length === 0
            ? `<p class="no-students">No students found.</p>`
            : `
        <table class="students-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${students
              .map(
                (s) => `
              <tr>
                <td>${s.firstName} ${s.lastName}</td>
                <td>${s.email}</td>
                <td>
                  <button class="delete-btn" data-id="${s._id}">
                    Delete
                  </button>
                </td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        `
        }
      </section>
    `;

    // 🗑️ DELETE HANDLER
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.onclick = async () => {
        const confirmDelete = confirm(
          "Are you sure you want to delete this student?"
        );
        if (!confirmDelete) return;

        try {
          await deleteStudent(btn.dataset.id);
          renderManageStudents(); // 🔄 refresh list
        } catch (err) {
          alert("Failed to delete student");
        }
      };
    });
  } catch (err) {
    console.error(err);
    app.innerHTML = `<p>Error loading students</p>`;
  }
}
