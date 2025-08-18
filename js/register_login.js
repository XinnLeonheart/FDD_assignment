// DOM Elements
const container = document.getElementById('container');
const registerBtn = document.getElementById('registerBtn');
const loginBtn = document.getElementById('loginBtn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const securityModal = document.getElementById('securityModal');
const securityQuestionText = document.getElementById('securityQuestionText');
const submitReset = document.getElementById('submitReset');
const cancelReset = document.getElementById('cancelReset');
const toggleLeft = document.querySelector('.toggle-left');

// 安全问题和密码重置相关元素
const securityAnswer = document.getElementById('securityAnswer');
const newPassword = document.getElementById('newPassword');
const confirmNewPassword = document.getElementById('confirmNewPassword');

// 存储当前重置密码的用户信息
let resetUser = null;

// 事件监听器
registerBtn.addEventListener('click', () => {
    container.classList.add('active');
    toggleLeft.style.display = 'none';
});

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
    toggleLeft.style.display = '';
});

// 显示安全问题和重置密码模态框
forgotPasswordLink.addEventListener('click', async (e) => {
    e.preventDefault();

    const emailOrUsername = prompt("Please enter your email or username:");
    if (!emailOrUsername) return;

    try {
        const user = await window.check(emailOrUsername);
        if (user) {
            resetUser = user;
            securityQuestionText.textContent = user.securityQuestion || "What city were you born in?";
            securityModal.style.display = "flex";
        } else {
            alert("User not found. Please check your email or username.");
        }
    } catch (error) {
        console.error("Error retrieving user:", error);
        alert("An error occurred. Please try again later.");
    }
});

// 关闭模态框
cancelReset.addEventListener('click', () => {
    securityModal.style.display = "none";
    resetUser = null;
    securityAnswer.value = "";
    newPassword.value = "";
    confirmNewPassword.value = "";
});

// 提交密码重置
submitReset.addEventListener('click', async () => {
    // 验证答案
    if (!securityAnswer.value) {
        document.getElementById('securityAnswerError').textContent = 'Answer is required';
        document.getElementById('securityAnswerError').style.display = 'block';
        return;
    } else {
        document.getElementById('securityAnswerError').style.display = 'none';
    }

    // 验证新密码
    if (!newPassword.value) {
        document.getElementById('newPasswordError').textContent = 'New password is required';
        document.getElementById('newPasswordError').style.display = 'block';
        return;
    } else if (newPassword.value.length < 6) {
        document.getElementById('newPasswordError').textContent = 'Password must be at least 6 characters';
        document.getElementById('newPasswordError').style.display = 'block';
        return;
    } else {
        document.getElementById('newPasswordError').style.display = 'none';
    }

    // 验证确认密码
    if (!confirmNewPassword.value) {
        document.getElementById('confirmNewPasswordError').textContent = 'Please confirm your new password';
        document.getElementById('confirmNewPasswordError').style.display = 'block';
        return;
    } else if (newPassword.value !== confirmNewPassword.value) {
        document.getElementById('confirmNewPasswordError').textContent = 'Passwords do not match';
        document.getElementById('confirmNewPasswordError').style.display = 'block';
        return;
    } else {
        document.getElementById('confirmNewPasswordError').style.display = 'none';
    }

    // 检查安全答案
    const correctAnswer = resetUser.answer ? resetUser.answer.toLowerCase() : "new york";
    if (securityAnswer.value.toLowerCase() !== correctAnswer) {
        document.getElementById('securityAnswerError').textContent = 'Incorrect answer';
        document.getElementById('securityAnswerError').style.display = 'block';
        return;
    }

    try {
        // 更新密码
        await window.updateUserPassword(
            resetUser.username,
            newPassword.value,
            resetUser.securityQuestion,
            resetUser.answer
        );

        alert("Password reset successfully! You can now log in with your new password.");
        securityModal.style.display = "none";
        resetUser = null;
        securityAnswer.value = "";
        newPassword.value = "";
        confirmNewPassword.value = "";
    } catch (error) {
        console.error("Error resetting password:", error);
        alert("Failed to reset password. Please try again.");
    }
});

// 表单验证函数
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

function validatePassword(password) {
    return password.length >= 6;
}

// 登录表单提交
loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    let isValid = true;

    // 重置错误
    document.querySelectorAll('#loginForm .error-message').forEach(el => {
        el.style.display = 'none';
        el.textContent = '';
    });

    // 获取表单值
    const emailOrUsername = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    // 验证邮箱/用户名
    if (!emailOrUsername) {
        document.getElementById('loginEmailError').textContent = 'Email or username is required';
        document.getElementById('loginEmailError').style.display = 'block';
        isValid = false;
    }

    // 验证密码
    if (!password) {
        document.getElementById('loginPasswordError').textContent = 'Password is required';
        document.getElementById('loginPasswordError').style.display = 'block';
        isValid = false;
    } else if (!validatePassword(password)) {
        document.getElementById('loginPasswordError').textContent = 'Password must be at least 6 characters';
        document.getElementById('loginPasswordError').style.display = 'block';
        isValid = false;
    }

    if (!isValid) return;

    try {
        // 在IndexedDB中检查用户
        const user = await window.check(emailOrUsername);

        if (!user) {
            document.getElementById('loginEmailError').textContent = 'User not found';
            document.getElementById('loginEmailError').style.display = 'block';
            return;
        }

        if (user.password !== password) {
            document.getElementById('loginPasswordError').textContent = 'Incorrect password';
            document.getElementById('loginPasswordError').style.display = 'block';
            return;
        }

        // 登录成功
        alert('Login successful! Redirecting to dashboard...');

        // 保存用户会话
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', user.username);
        localStorage.setItem('currentUserEmail', user.email);

        // 更新IndexedDB中的当前用户
        await updateCurrentUser(user.username);

        // 重定向到主页
        setTimeout(() => {
            window.location.href = 'general.html';
        }, 100);
    } catch (error) {
        console.error("Login error:", error);
        alert('An error occurred during login. Please try again.');
    }
});

// 注册表单提交
registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    let isValid = true;

    // 重置错误
    document.querySelectorAll('#registerForm .error-message').forEach(el => {
        el.style.display = 'none';
        el.textContent = '';
    });

    // 获取表单值
    const name = document.getElementById('registerName').value.trim();
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    // 验证名称
    if (!name) {
        document.getElementById('registerNameError').textContent = 'Full name is required';
        document.getElementById('registerNameError').style.display = 'block';
        isValid = false;
    }

    // 验证用户名
    if (!username) {
        document.getElementById('registerUsernameError').textContent = 'Username is required';
        document.getElementById('registerUsernameError').style.display = 'block';
        isValid = false;
    }

    // 验证邮箱
    if (!email) {
        document.getElementById('registerEmailError').textContent = 'Email is required';
        document.getElementById('registerEmailError').style.display = 'block';
        isValid = false;
    } else if (!validateEmail(email)) {
        document.getElementById('registerEmailError').textContent = 'Please enter a valid email';
        document.getElementById('registerEmailError').style.display = 'block';
        isValid = false;
    }

    // 验证密码
    if (!password) {
        document.getElementById('registerPasswordError').textContent = 'Password is required';
        document.getElementById('registerPasswordError').style.display = 'block';
        isValid = false;
    } else if (!validatePassword(password)) {
        document.getElementById('registerPasswordError').textContent = 'Password must be at least 6 characters';
        document.getElementById('registerPasswordError').style.display = 'block';
        isValid = false;
    }

    // 验证确认密码
    if (!confirmPassword) {
        document.getElementById('registerConfirmPasswordError').textContent = 'Please confirm your password';
        document.getElementById('registerConfirmPasswordError').style.display = 'block';
        isValid = false;
    } else if (password !== confirmPassword) {
        document.getElementById('registerConfirmPasswordError').textContent = 'Passwords do not match';
        document.getElementById('registerConfirmPasswordError').style.display = 'block';
        isValid = false;
    }

    if (!isValid) return;

    try {
        // 检查用户名是否已存在
        const usernameCheck = await window.check(username);
        if (usernameCheck) {
            document.getElementById('registerUsernameError').textContent = 'Username already exists';
            document.getElementById('registerUsernameError').style.display = 'block';
            return;
        }

        // 检查邮箱是否已存在
        const emailCheck = await window.check(email);
        if (emailCheck) {
            document.getElementById('registerEmailError').textContent = 'Email already registered';
            document.getElementById('registerEmailError').style.display = 'block';
            return;
        }

        // 添加用户到IndexedDB
        await window.addUserAccountData(
            username,
            email,
            password,
            "What city were you born in?", // 默认安全问题
            "new york" // 默认安全答案
        );

        // 注册成功
        alert('Registration successful! You can now log in.');

        // 切换到登录表单
        container.classList.remove('active');
        toggleLeft.style.display = '';

        // 清空表单
        registerForm.reset();
    } catch (error) {
        console.error("Registration error:", error);
        alert('An error occurred during registration. Please try again.');
    }
});

// 检查用户是否已登录
window.addEventListener('DOMContentLoaded', async () => {
    localStorage.setItem('isLoggedIn', 'false');
    await deleteUserData('currentUserIndex');
});