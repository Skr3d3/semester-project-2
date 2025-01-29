import { authFetch } from "./fetch.mjs";
import { baseUrl } from "./endpoints.mjs";

const signupEndpoint = `${baseUrl}/auth/register`;

document
  .getElementById("signup-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    console.log("button works");

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const retypePassword = document.getElementById("retype-password").value;
    const name = document.getElementById("name").value;

    if (password !== retypePassword) {
      document.getElementById("retype-password").classList.add("is-invalid");
      return;
    } else {
      document.getElementById("retype-password").classList.remove("is-invalid");
    }

    if (!name.trim()) {
      document.getElementById("name").classList.add("is-invalid");
      return;
    } else {
      document.getElementById("name").classList.remove("is-invalid");
    }
    const emailPattern = /^[a-zA-Z0-9._%+-]+@stud\.noroff\.no$/;
    if (!email.trim().match(emailPattern)) {
      document.getElementById("email").classList.add("is-invalid");
      return;
    } else {
      document.getElementById("email").classList.remove("is-invalid");
    }

    try {
      const response = await authFetch(signupEndpoint, {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Signup failed: ${errorData.message || response.statusText}`
        );
      }

      alert("Sign up successful! Redirecting to login page...");
      location.href = "../login/index.html";
    } catch (error) {
      console.error("Signup error:", error);
      alert("Signup failed. Please try again.");
    }
  });
