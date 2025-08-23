const currentUser = localStorage.getItem("currentUser");
if (!currentUser || localStorage.getItem("isLoggedIn") !== "true") {
  window.location.replace("register_login.html");
}

document.addEventListener("DOMContentLoaded", () => {
  const displayNameInput = document.getElementById("displayName");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("newPassword");
  const togglePassword = document.getElementById("togglePassword");

  // Eye icon toggle
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        togglePassword.innerHTML = "<i class='bx bx-show'></i>";
      } else {
        passwordInput.type = "password";
        togglePassword.innerHTML = "<i class='bx bx-hide'></i>";
      }
    });
  }

  // Display current account info
  function showCurrentAccountInfo() {
    const currentUser = localStorage.getItem("currentUser");
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.username === currentUser);

    if (user) {
      displayNameInput.value = user.username;
      emailInput.value = user.email;
      passwordInput.value = user.password;
    }
  }
  showCurrentAccountInfo();

  // Save Profile (update login credentials)
  document.querySelector(".settings-group .save-btn").addEventListener("click", () => {
    const newUsername = displayNameInput.value.trim();
    const newEmail = emailInput.value.trim();

    if (!newUsername || !newEmail) {
      alert("Display name and email cannot be empty.");
      return;
    }

    const currentUser = localStorage.getItem("currentUser");
    let users = JSON.parse(localStorage.getItem("users")) || [];
    const userIndex = users.findIndex(u => u.username === currentUser);

    if (userIndex !== -1) {
      users[userIndex].username = newUsername;
      users[userIndex].email = newEmail;
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("currentUser", newUsername);
      alert("Profile updated! Your login credentials have been changed.");
    }
  });

  // Update Password (also updates login credentials)
  document.querySelectorAll(".settings-group .save-btn")[1].addEventListener("click", () => {
    if (passwordInput.value.trim() !== "") {
      const currentUser = localStorage.getItem("currentUser");
      let users = JSON.parse(localStorage.getItem("users")) || [];
      const userIndex = users.findIndex(u => u.username === currentUser);
      if (userIndex !== -1) {
        users[userIndex].password = passwordInput.value;
        localStorage.setItem("users", JSON.stringify(users));
        alert("Password changed successfully! You can use the new password to log in.");
        passwordInput.value = "";
      }
    } else {
      alert("Please enter a new password!");
    }
  });

  // Logout functionality
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm("Are you sure you want to log out?")) {
        localStorage.setItem("isLoggedIn", "false");
        localStorage.removeItem("currentUser");

        window.location.replace("register_login.html");
      }
    });
  }

  // Home menu item redirects to general.html
  const homeMenuItem = document.querySelector('.sidebar-left .menu-item[data-category="general"]');
  if (homeMenuItem) {
    homeMenuItem.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "general.html";
    });
  }
});