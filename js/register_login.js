const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

registerBtn.addEventListener('click', () => {
  container.classList.add('active');
});

loginBtn.addEventListener('click', () => {
  container.classList.remove('active');
});

document.querySelector('.login form').addEventListener('submit', function(e) {
  e.preventDefault(); // Prevent actual form submission
  window.location.href = 'general.html'; // Change to your target page
});

