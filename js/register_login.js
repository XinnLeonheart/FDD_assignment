document.addEventListener('DOMContentLoaded', function() {
  const container = document.querySelector('.container');
  const registerBtn = document.querySelector('.register-btn');
  const loginBtn = document.querySelector('.login-btn');
  const loginForm = document.querySelector('.form-box.login form');
  const registerForm = document.querySelector('.form-box.register form');

  // Toggle panels
  registerBtn.addEventListener('click', () => container.classList.add('active'));
  loginBtn.addEventListener('click', () => container.classList.remove('active'));

  // Check login state on page load
  if (localStorage.getItem('isLoggedIn') === 'true') {
    window.location.href = 'home.html'; // Redirect to home if already logged in
  }

  // Register
  registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = registerForm.querySelector('input[placeholder="Email"]').value;
    const username = registerForm.querySelector('input[placeholder="Username"]').value;
    const password = registerForm.querySelector('input[placeholder="Password"]').value;

    // Save credentials (for demo only; not secure for real apps)
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userUsername', username);
    localStorage.setItem('userPassword', password);
    localStorage.setItem('isLoggedIn', 'true');

    alert('Registration successful! You are now logged in.');
    window.location.href = 'home.html'; // Redirect after registration
  });

  // Log In
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const emailOrUsername = loginForm.querySelector('input[placeholder="Email/Username"]').value;
    const password = loginForm.querySelector('input[placeholder="Password"]').value;

    const savedEmail = localStorage.getItem('userEmail');
    const savedUsername = localStorage.getItem('userUsername');
    const savedPassword = localStorage.getItem('userPassword');

    if (
      (emailOrUsername === savedEmail || emailOrUsername === savedUsername) &&
      password === savedPassword
    ) {
      localStorage.setItem('isLoggedIn', 'true');
      alert('Login successful!');
      window.location.href = 'home.html'; // Redirect after login
    } else {
      alert('Invalid credentials or account does not exist. Please register first.');
    }
  });
});