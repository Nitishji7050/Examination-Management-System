import "../styles/new.css";
import { login, register } from "../api/auth.js";

export function renderHome() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="auth-wrapper">

      <!-- LEFT -->
      <div class="auth-left">
        <div class="auth-left-content">
          <h1>Examination Management System</h1>
          <p>
            A secure and modern platform for conducting online examinations,
            managing students, teachers, and evaluating results efficiently.
          </p>
        </div>
      </div>

      <!-- RIGHT -->
      <div class="auth-right">

        <!-- LOGIN -->
        <div class="auth-box" id="login-box">
          <h2>Login</h2>
          <p class="sub-text">Use your email account</p>

          <form id="login-form">
            <input type="email" name="email" placeholder="Email" required />
            <input type="password" name="password" placeholder="Password" required />

            <select name="role" required>
              <option value="" disabled selected>Select Role</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>

            <button type="submit">LOGIN</button>
          </form>

          <p class="switch-text">
            <span id="forgot-password-link">Forgot Password?</span>
          </p>

          <p class="switch-text">
            New here?
            <span id="show-register">Create an account</span>
          </p>
        </div>

        <!-- REGISTER -->
        <div class="auth-box hidden" id="register-box">
          <h2>Create Account</h2>

          <form id="register-form">
            <div class="row">
              <input name="firstName" placeholder="First Name" required />
              <input name="lastName" placeholder="Last Name" required />
            </div>

            <input name="institution" placeholder="Institution" required />

            <div class="row">
              <input type="date" name="dateOfBirth" required />
              <select name="gender" required>
                <option value="" disabled selected>Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div class="row">
              <input name="fieldOfStudy" placeholder="Field of Study" required />
              <select name="userType" required>
                <option value="" disabled selected>Select User Type</option>
                <option value="student">Student</option>
              <!--  <option value="teacher">Teacher</option> -->
              </select>
            </div>

            <input type="email" name="email" placeholder="Email" required />
            <input type="password" name="password" placeholder="Password" required />

            <button type="submit">REGISTER</button>
          </form>

          <p class="switch-text">
            Already have an account?
            <span id="show-login">Login</span>
          </p>
        </div>

      </div>
    </div>
  `;

  // toggle
  document.getElementById("show-register").onclick = () => {
    document.getElementById("login-box").classList.add("hidden");
    document.getElementById("register-box").classList.remove("hidden");
  };

  document.getElementById("show-login").onclick = () => {
    document.getElementById("register-box").classList.add("hidden");
    document.getElementById("login-box").classList.remove("hidden");
  };

  // login
  document.getElementById("login-form").onsubmit = async (e) => {
    e.preventDefault();
    const f = e.target;

    await login({
      email: f.email.value,
      password: f.password.value,
      role: f.role.value,
    });
  };

  // register
  document.getElementById("register-form").onsubmit = async (e) => {
    e.preventDefault();
    const f = e.target;

    await register({
      firstName: f.firstName.value,
      lastName: f.lastName.value,
      institution: f.institution.value,
      dateOfBirth: f.dateOfBirth.value,
      gender: f.gender.value,
      fieldOfStudy: f.fieldOfStudy.value,
      email: f.email.value,
      password: f.password.value,
      userType: f.userType.value,
    });
  };

  document.getElementById("forgot-password-link").onclick = () => {
    renderForgotPassword();
  };
}

// ======================
// 📩 FORGOT PASSWORD (CENTER)
// ======================
function renderForgotPassword() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="center-screen">
      <div class="auth-box">
        <h2>Forgot Password</h2>
        <input type="email" id="email" placeholder="Enter your email" />
        <button id="sendOtp">Send OTP</button>
        <p id="back">Back to Login</p>
      </div>
    </div>
  `;

  document.getElementById("sendOtp").onclick = async () => {
    const email = document.getElementById("email").value;

    const res = await fetch("http://localhost:3000/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) renderVerifyOtp(email);
  };

  document.getElementById("back").onclick = renderHome;
}

// ======================
// 🔢 VERIFY OTP (CENTER)
// ======================
function renderVerifyOtp(email) {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="center-screen">
      <div class="auth-box">
        <h2>Verify OTP</h2>
        <input type="text" id="otp" placeholder="Enter OTP" />
        <button id="verify">Verify</button>
      </div>
    </div>
  `;

  document.getElementById("verify").onclick = async () => {
    const otp = document.getElementById("otp").value;

    const res = await fetch("http://localhost:3000/api/auth/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) renderResetPassword(email);
  };
}

// ======================
// 🔐 RESET PASSWORD (CENTER)
// ======================
function renderResetPassword(email) {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="center-screen">
      <div class="auth-box">
        <h2>Reset Password</h2>
        <input type="password" id="newPass" placeholder="New Password" />
        <button id="reset">Update Password</button>
      </div>
    </div>
  `;

  document.getElementById("reset").onclick = async () => {
    const newPassword = document.getElementById("newPass").value;

    const res = await fetch("http://localhost:3000/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, newPassword }),
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) renderHome();
  };
}