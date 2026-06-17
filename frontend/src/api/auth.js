// client/api/auth.js

const API_BASE = "http://localhost:3000/api/auth";

/* =========================
   LOGIN
========================= */
export async function login({ email, password, role }) {
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, role }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Login failed");
      return;
    }

    // 🔐 Save JWT token
    localStorage.setItem("token", data.token);

    // 👤 Save logged-in user info (IMPORTANT)
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: data.userId,
        name: data.name,
        userType: data.userType,
      })
    );

    alert("Logged in successfully!");

    // 🔁 Redirect based on role
    if (data.userType === "student") {
      window.location.href = "/student/exams";
    } else if (data.userType === "teacher") {
      window.location.href = "/teacher/exams";
    }
  } catch (err) {
    console.error("Login error:", err);
    alert("Server error");
  }
}

/* =========================
   REGISTER
========================= */
export async function register(userData) {
  try {
    // Required fields validation
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "password",
      "userType",
      "dateOfBirth",
      "gender",
      "institution",
      "fieldOfStudy",
    ];

    const missingFields = requiredFields.filter(
      (field) => !userData[field]
    );

    if (missingFields.length > 0) {
      alert(
        `Please fill all required fields: ${missingFields.join(", ")}`
      );
      return;
    }

    // Format DOB (YYYY-MM-DD)
    if (userData.dateOfBirth) {
      const dob = new Date(userData.dateOfBirth);
      if (!isNaN(dob.getTime())) {
        userData.dateOfBirth = dob.toISOString().split("T")[0];
      }
    }

    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Registration failed");
      return;
    }

    alert("Registration successful! Please login.");
  } catch (err) {
    console.error("Registration error:", err);
    alert("Server error");
  }
}

/* =========================
   LOGOUT
========================= */
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  alert("Logged out successfully");
  window.location.href = "/";
}

/* =========================
   AUTH HELPERS (OPTIONAL)
========================= */

// Get logged-in user
export function getLoggedInUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

// Check login
export function isAuthenticated() {
  return !!localStorage.getItem("token");
}
