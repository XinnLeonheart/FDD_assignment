// setting.js
import {
    getDataByIndex,
    getMatchingDataByIndex,
    updateUserPassword,
    updateUserPrivateData
} from './indexedDb.js';

document.addEventListener('DOMContentLoaded', async () => {
    // DOM Elements
    const profileUsername = document.getElementById('profileUsername');
    const profileEmail = document.getElementById('profileEmail');
    const changePasswordForm = document.getElementById('changePasswordForm');
    const securityModal = document.getElementById('securityModal');
    const changeSecurityBtn = document.getElementById('changeSecurityBtn');
    const cancelSecurityBtn = document.getElementById('cancelSecurityChange');
    const securityQuestionForm = document.getElementById('securityQuestionForm');
    const themeToggle = document.getElementById('themeToggle');

    // Security question elements
    const securityQuestionDisplay = document.getElementById('securityQuestionDisplay');
    const securityAnswerDisplay = document.getElementById('securityAnswerDisplay');

    // Current user data
    let currentUserData = null;

    // Load current user
    async function loadCurrentUser() {
        try {
            const currentUserDataFromDB = await getDataByIndex("userDB", "userObjectStore", "currentUserIndex");

            if (currentUserDataFromDB && currentUserDataFromDB.length > 0) {
                const currentUsername = currentUserDataFromDB[0].currentUser;

                if (currentUsername) {
                    const userData = await getMatchingDataByIndex(
                        "userDB",
                        "userObjectStore",
                        "usernameIndex",
                        currentUsername
                    );

                    if (userData) {
                        currentUserData = userData;

                        profileUsername.textContent = userData.name || currentUsername;
                        profileEmail.textContent = userData.email || 'null';

                        // Set security question display
                        securityQuestionDisplay.textContent = userData.securityQuestion || "What city were you born in?";
                    }
                }
            }
        } catch (error) {
            console.error("Error loading current user:", error);
        }
    }

    // Change password
    changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Reset errors
        document.querySelectorAll('#changePasswordForm .error-message').forEach(el => {
            el.style.display = 'none';
        });

        // Get form values
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        let isValid = true;

        // Validate current password
        if (!currentPassword) {
            document.getElementById('currentPasswordError').textContent = 'Current password is required';
            document.getElementById('currentPasswordError').style.display = 'block';
            isValid = false;
        } else if (currentUserData && currentPassword !== currentUserData.password) {
            document.getElementById('currentPasswordError').textContent = 'Incorrect current password';
            document.getElementById('currentPasswordError').style.display = 'block';
            isValid = false;
        }

        // Validate new password
        if (!newPassword) {
            document.getElementById('newPasswordError').textContent = 'New password is required';
            document.getElementById('newPasswordError').style.display = 'block';
            isValid = false;
        } else if (newPassword.length < 6) {
            document.getElementById('newPasswordError').textContent = 'Password must be at least 6 characters';
            document.getElementById('newPasswordError').style.display = 'block';
            isValid = false;
        }

        // Validate confirm password
        if (!confirmPassword) {
            document.getElementById('confirmPasswordError').textContent = 'Please confirm your new password';
            document.getElementById('confirmPasswordError').style.display = 'block';
            isValid = false;
        } else if (newPassword !== confirmPassword) {
            document.getElementById('confirmPasswordError').textContent = 'Passwords do not match';
            document.getElementById('confirmPasswordError').style.display = 'block';
            isValid = false;
        }

        if (!isValid) return;

        try {
            // Update password
            await updateUserPassword(
                currentUserData.username,
                newPassword,
                currentUserData.securityQuestion,
                currentUserData.answer
            );

            showSuccessMessage("Password updated successfully!");

            // Clear form
            changePasswordForm.reset();

            await loadCurrentUser();
        } catch (error) {
            console.error("Error updating password:", error);
            showErrorMessage("Failed to update password. Please try again.");
        }
    });

    // Change security question
    changeSecurityBtn.addEventListener('click', () => {
        securityModal.style.display = 'flex';
    });

    cancelSecurityBtn.addEventListener('click', () => {
        securityModal.style.display = 'none';
    });

    securityQuestionForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Reset errors
        document.querySelectorAll('#securityQuestionForm .error-message').forEach(el => {
            el.style.display = 'none';
        });

        // Get form values
        const securityQuestion = document.getElementById('securityQuestion').value;
        const securityAnswer = document.getElementById('newSecurityAnswer').value;

        if (!securityAnswer) {
            document.getElementById('securityAnswerError').textContent = 'Answer is required';
            document.getElementById('securityAnswerError').style.display = 'block';
            return;
        }

        try {
            // Update security question and answer
            await updateUserPassword(
                currentUserData.username,
                currentUserData.password,
                securityQuestion,
                securityAnswer
            );

            showSuccessMessage("Security question updated successfully!");

            // Update display
            securityQuestionDisplay.textContent = securityQuestion;

            // Close modal
            securityModal.style.display = 'none';
        } catch (error) {
            console.error("Error updating security question:", error);
            showErrorMessage("Failed to update security question. Please try again.");
        }
    });

    // Theme toggle
    themeToggle.addEventListener('change', () => {
        const isDarkMode = themeToggle.checked;
        const inputGroup = document.querySelectorAll('.input-group label');
        const menuItem = document.querySelectorAll('#menu-item-profile,#menu-item-bookmark,#menu-item-explore,#menu-item-home,#menu-item-post,#menu-item-notification');
        inputGroup.forEach(label => {
            label.style.color = isDarkMode ? '#e0e0e0' : '#495057';
        });
        menuItem.forEach(item => {
            if (isDarkMode) {
                item.classList.add('active');
            }
            else if (!isDarkMode)
            {
                item.classList.remove('active');
            }
        });
        document.body.classList.toggle('dark-mode', isDarkMode);
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    });

    // // Load theme preference
    // function loadThemePreference() {
    //     const savedTheme = localStorage.getItem('theme') || 'light';
    //     const isDarkMode = savedTheme === 'dark';
    //
    //     document.body.classList.toggle('dark-mode', isDarkMode);
    //     themeToggle.checked = isDarkMode;
    // }

    // Show a success message
    function showSuccessMessage(message) {
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.innerHTML = `
            <i class='bx bx-check-circle'></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Show error message
    function showErrorMessage(message) {
        const notification = document.createElement('div');
        notification.className = 'notification error';
        notification.innerHTML = `
            <i class='bx bx-error-circle'></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Initialize
    await loadCurrentUser();
    // loadThemePreference();

    // Add notification styles
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s ease;
            z-index: 1000;
        }
        
        .notification.success {
            background-color: #4ade80;
            color: white;
        }
        
        .notification.error {
            background-color: #f72585;
            color: white;
        }
        
        .notification.show {
            opacity: 1;
            transform: translateY(0);
        }
        
        .notification i {
            font-size: 1.5rem;
        }
    `;
    document.head.appendChild(style);
});