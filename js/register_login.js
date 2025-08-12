document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.container');
  const registerBtn = document.querySelector('.register-btn');
  const loginBtn = document.querySelector('.login-btn');
  const loginForm = document.querySelector('.form-box.login form');
  const registerForm = document.querySelector('.form-box.register form');

  // Switch between forms
  registerBtn.addEventListener('click', () => container.classList.add('active'));
  loginBtn.addEventListener('click', () => container.classList.remove('active'));

  // Auto-redirect if already logged in
  if (localStorage.getItem('isLoggedIn') === 'true') {
    window.location.href = 'general.html';
  }

  // Register new account
  registerForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = registerForm.querySelector('input[placeholder="Email"]').value;
    const username = registerForm.querySelector('input[placeholder="Username"]').value;
    const password = registerForm.querySelector('input[placeholder="Password"]').value;

    // Save account info (demo only)
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userUsername', username);
    localStorage.setItem('userPassword', password);

    // Mark login session
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', username); // store username for per-user posts

    alert('Registration successful! You are now logged in.');
    window.location.href = 'general.html';
  });

  // Log into existing account
  loginForm.addEventListener('submit', e => {
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
      localStorage.setItem('currentUser', savedUsername);
      alert('Login successful!');
      window.location.href = 'general.html';
    } else {
      alert('Invalid credentials or account does not exist. Please register first.');
    }
  });
});
