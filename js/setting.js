document.addEventListener("DOMContentLoaded", () => {
  const displayNameInput = document.getElementById("displayName");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("newPassword");

  // Load saved settings
  const savedName = localStorage.getItem("displayName");
  const savedEmail = localStorage.getItem("email");

  if (savedName) displayNameInput.value = savedName;
  if (savedEmail) emailInput.value = savedEmail;

  // Save Profile
  document.querySelector(".settings-group .save-btn").addEventListener("click", () => {
    localStorage.setItem("displayName", displayNameInput.value);
    localStorage.setItem("email", emailInput.value);
    alert("Profile updated!");
  });

  // Update Password
  document.querySelectorAll(".settings-group .save-btn")[2].addEventListener("click", () => {
    if (passwordInput.value.trim() !== "") {
      localStorage.setItem("password", passwordInput.value);
      alert("Password changed successfully!");
      passwordInput.value = "";
    } else {
      alert("Please enter a new password!");
    }
  });

  // Logout functionality
  document.getElementById("logoutBtn").addEventListener("click", () => {
    if (confirm("Are you sure you want to log out?")) {
      localStorage.clear(); // clear all saved data (profile, dark mode, etc.)
      window.location.href = "register_login.html"; // redirect to login page
    }
  });
});
