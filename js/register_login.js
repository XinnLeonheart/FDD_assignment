import "./indexedDb.js"
import {updateCurrentUser} from "./indexedDb.js";

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
  // if (localStorage.getItem('isLoggedIn') === 'true') {
  //   window.location.href = 'general.html';
  // }

  // Register a new account
  registerForm.addEventListener('submit', async e => {
      e.preventDefault();
      const email = registerForm.querySelector('input[placeholder="Email"]').value;
      const username = registerForm.querySelector('input[placeholder="Username"]').value;
      const password = registerForm.querySelector('input[placeholder="Password"]').value;

      // get user data from indexedDB
      const result = await check(email);
      if (result != null)
      {
        alert('Email already exists. Please choose another one.');
        return;
      }
      const result2 = await check(username);
      if (result2 != null)
      {
          alert('Username already exists. Please choose another one.');
          return;
      }

      await addUserAccountData(username, email, password);
      console.log('Data added successfully!')

      // Save account info (demo only)
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userUsername', username);
      localStorage.setItem('userPassword', password);

      // Mark login session
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUser', username); // store username for per-user posts


      alert('Registration successful! You are now going to log in.');

      window.location.href = 'register_login.html';
  });

  // Log into an existing account
  loginForm.addEventListener('submit', async e => {
      e.preventDefault();
      const emailOrUsername = loginForm.querySelector('input[placeholder="Email/Username"]').value;
      const password = loginForm.querySelector('input[placeholder="Password"]').value;

      // const savedEmail = localStorage.getItem('userEmail');
      // const savedUsername = localStorage.getItem('userUsername');
      // const savedPassword = localStorage.getItem('userPassword');

      // get user data from indexedDB
      const result = await check(emailOrUsername);
      const savedEmail = result.email;
      const savedUsername = result.username;
      const savedPassword = result.password;

      // check user data
      if
      (
          // ((emailOrUsername === savedEmail || emailOrUsername === savedUsername) && password === savedPassword) ||
          ((emailOrUsername === savedEmail || emailOrUsername === savedUsername) && savedPassword === password)
      )
      {
          // save user log in status
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('currentUser', savedUsername);
          await updateCurrentUser(savedUsername);
          alert('Login successful!');
          window.location.href = 'general.html';
      }
      else
      {
          alert('Invalid credentials or account does not exist. Please register first.');
      }
  });
});


