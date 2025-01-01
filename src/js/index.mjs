import { createAPIKey } from "./auth/api.mjs";

const backBtn = document.getElementById("back-button");
backBtn.addEventListener("click", () => {
  history.back();
});

const navbarBrand = document.querySelector(".navbar-brand");
navbarBrand.addEventListener("click", () => {
  location.href = "./index.html";
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
