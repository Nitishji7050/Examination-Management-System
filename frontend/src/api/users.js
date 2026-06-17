const API_BASE_URL = "http://localhost:3000/api/users";

// 🔹 GET all students
export async function fetchStudents() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE_URL}/students`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch students");
  }

  return res.json();
}

// 🔹 DELETE student
export async function deleteStudent(studentId) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE_URL}/students/${studentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to delete student");
  }

  return res.json();
}
