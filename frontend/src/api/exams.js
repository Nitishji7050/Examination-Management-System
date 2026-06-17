/**
 * API module for exam-related operations
 */

const API_BASE_URL = "http://localhost:3000/api";

/* =========================
   HELPER
========================= */
function getAuthHeaders() {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Not authenticated");
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

/* =========================
   FETCH ALL EXAMS
========================= */
export async function fetchExams() {
  try {
    const response = await fetch(`${API_BASE_URL}/exams`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error("Unauthorized");
      }
      throw new Error("Failed to fetch exams");
    }

    const data = await response.json();

    // 🔐 normalize response
    return Array.isArray(data) ? data : data.exams || [];
  } catch (error) {
    console.error("fetchExams error:", error);
    throw error;
  }
}

/* =========================
   FETCH EXAM BY ID
========================= */
export async function fetchExamById(examId) {
  try {
    const response = await fetch(`${API_BASE_URL}/exams/${examId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch exam");
    }

    return await response.json();
  } catch (error) {
    console.error(`fetchExamById (${examId}) error:`, error);
    throw error;
  }
}

/* =========================
   CREATE EXAM
========================= */
export async function createExam(examData) {
  try {
    const response = await fetch(`${API_BASE_URL}/exams`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(examData),
    });

    if (!response.ok) {
      throw new Error("Failed to create exam");
    }

    return await response.json();
  } catch (error) {
    console.error("createExam error:", error);
    throw error;
  }
}

/* =========================
   UPDATE EXAM
========================= */
export async function updateExam(examId, examData) {
  try {
    const response = await fetch(`${API_BASE_URL}/exams/${examId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(examData),
    });

    if (!response.ok) {
      throw new Error("Failed to update exam");
    }

    return await response.json();
  } catch (error) {
    console.error(`updateExam (${examId}) error:`, error);
    throw error;
  }
}

/* =========================
   DELETE EXAM
========================= */
export async function deleteExam(examId) {
  try {
    const response = await fetch(`${API_BASE_URL}/exams/${examId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to delete exam");
    }

    return await response.json();
  } catch (error) {
    console.error(`deleteExam (${examId}) error:`, error);
    throw error;
  }
}
