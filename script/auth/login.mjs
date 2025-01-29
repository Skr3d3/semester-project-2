import { authFetch } from "./fetch.mjs";
import { baseUrl } from "./endpoints.mjs";
const loginEndpoint = `${baseUrl}/auth/login`;

/**
 * Handles the login process.
 * Validates user input, sends the login request,
 * and processes the response.
 */
async function handleLogin(event) {
  event.preventDefault();

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const rememberMeInput = document.getElementById("remember-me");

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const rememberMe = rememberMeInput.checked;

  if (!email) {
    emailInput.classList.add("is-invalid");
    console.log("Email is required");
    return;
  } else {
    emailInput.classList.remove("is-invalid");
  }

  if (!password) {
    passwordInput.classList.add("is-invalid");
    console.log("Password is required");
    return;
  } else {
    passwordInput.classList.remove("is-invalid");
  }

  try {
    console.log("Sending login request...");
    const response = await authFetch(loginEndpoint, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Login failed:", errorData);
      throw new Error(
        `Login failed: ${errorData.message || response.statusText}`
      );
    }

    const data = await response.json();
    console.log("Login successful:", data.data);

    if (rememberMe) {
      localStorage.setItem("accessToken", data.data.accessToken);
    }
    sessionStorage.setItem("accessToken", data.data.accessToken);

    alert("Login successful! Redirecting...");
    location.href = "../index.html";
  } catch (error) {
    console.error("Login error:", error);
    alert("Login failed. Please check your credentials and try again.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  } else {
    console.error("Login form not found");
  }
});
