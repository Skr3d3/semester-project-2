import { initializeSearch } from "./listings/search.mjs";
import { setProfileButton, displayUserCredits } from "./profile/profile.mjs";

const backBtn = document.getElementById("back-button");
backBtn.addEventListener("click", () => {
  history.back();
});

const navbarBrand = document.querySelector(".navbar-brand");
navbarBrand.addEventListener("click", () => {
  let originUrl = window.location.origin;

  if (
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "localhost"
  ) {
    location.href = originUrl + "/index.html";
  } else {
    location.href = originUrl + "/semester-project-2/";
  }
});

const toggleButton = document.getElementById("dark-mode-toggle");
toggleButton.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

const menuToggle = document.getElementById("menu-toggle");
const menuClose = document.getElementById("menu-close");
const slidingMenu = document.getElementById("sliding-menu");
menuToggle.addEventListener("click", () => {
  slidingMenu.style.transform = "translateX(0)";
});
menuClose.addEventListener("click", () => {
  slidingMenu.style.transform = "translateX(100%)";
});

document.addEventListener("click", (e) => {
  const toggleButton = document.getElementById("menu-toggle");
  if (toggleButton.contains(e.target) || slidingMenu.contains(e.target)) {
    return;
  }
  slidingMenu.style.transform = "translateX(100%)";
});

// Login/logout button

document.addEventListener("DOMContentLoaded", () => {
  const authBtn = document.getElementById("auth-btn");

  if (!authBtn) {
    console.error("Auth button (#auth-btn) not found in the DOM");
    return;
  }

  function isUserLoggedIn() {
    return (
      localStorage.getItem("accessToken") !== null ||
      sessionStorage.getItem("accessToken") !== null
    );
  }

  function updateAuthButton() {
    if (isUserLoggedIn()) {
      authBtn.textContent = "Logout";
      authBtn.classList.replace("btn-subtle", "btn-danger");
      authBtn.onclick = () => {
        localStorage.removeItem("accessToken");
        sessionStorage.removeItem("accessToken");
        alert("Logged out successfully!");
        updateAuthButton();
      };
    } else {
      authBtn.textContent = "Login / Signup";
      authBtn.classList.replace("btn-danger", "btn-subtle");
      authBtn.onclick = () => {
        let originUrl = window.location.origin;
        if (
          window.location.hostname === "127.0.0.1" ||
          window.location.hostname === "localhost"
        ) {
          location.href = originUrl + "/login/index.html";
        } else {
          location.href = originUrl + "/semester-project-2/login/index.html";
        }
      };
    }
  }
  updateAuthButton();
});

// Profile button and user credits

document.addEventListener("DOMContentLoaded", () => {
  setProfileButton();
  displayUserCredits();
  initializeSearch();
});
