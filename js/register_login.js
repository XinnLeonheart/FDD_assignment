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

  // Default posts template for new users
  const defaultPosts = [
    {
      id: "1",
      user: "Asia Pacific University",
      category: "news",
      text: "Welcome to the new semester!",
      imageURL: "image/sample1.jpg",
      pdfURL: "",
      pdfName: "",
      comments: [
        { user: "John", text: "Excited!" },
        { user: "Mary", text: "Can't wait!" }
      ]
    },
    {
      id: "2",
      user: "Student Council",
      category: "events",
      text: "Join us for the annual sports day!",
      imageURL: "",
      pdfURL: "files/sports-day.pdf",
      pdfName: "Sports Day Info.pdf",
      comments: []
    }
  ];

  // Register new account
  registerForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = registerForm.querySelector('input[placeholder="Email"]').value;
    const username = registerForm.querySelector('input[placeholder="Username"]').value;
    const password = registerForm.querySelector('input[placeholder="Password"]').value;

    // Get existing users or empty array
    let users = JSON.parse(localStorage.getItem('users')) || [];

    // Check if username or email already exists
    const exists = users.some(u => u.email === email || u.username === username);
    if (exists) {
      alert('Account already exists. Please log in.');
      return;
    }

    // Add new user
    users.push({ email, username, password });
    localStorage.setItem('users', JSON.stringify(users));

    // Mark login session
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', username);

    alert('Registration successful! You are now logged in.');
    window.location.href = 'general.html';
  });

  // Log into existing account
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const emailOrUsername = loginForm.querySelector('input[placeholder="Email/Username"]').value;
    const password = loginForm.querySelector('input[placeholder="Password"]').value;

    // Use users array for authentication
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u =>
      (u.email === emailOrUsername || u.username === emailOrUsername) &&
      u.password === password
    );

    if (user) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUser', user.username);

      // If user has no personal posts yet, give them the default ones
      if (!localStorage.getItem(`posts_${user.username}`)) {
        localStorage.setItem(`posts_${user.username}`, JSON.stringify(defaultPosts));
      }

      alert('Login successful!');
      window.location.href = 'general.html';
    } else {
      alert('Invalid credentials or account does not exist. Please register first.');
    }
  });
});
