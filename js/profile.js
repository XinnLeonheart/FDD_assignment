import {
    getDataByIndex,
    getMatchingDataByIndex,
    updateUserPrivateData
} from './indexedDb.js';

document.addEventListener('DOMContentLoaded', async () => {
    // DOM
    const profileUsername = document.getElementById('profileUsername');
    const profileEmail = document.getElementById('profileEmail');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const editSectionBtn = document.querySelectorAll('.edit-section-btn');

    // profile
    const profileFullName = document.getElementById('profileFullName');
    const fullNameEl = document.getElementById('fullName');
    const majorEl = document.getElementById('major');
    const enrollmentEl = document.getElementById('enrollment');
    const locationEl = document.getElementById('location');
    const bioEl = document.querySelector('.bio p');
    const emailEl = document.getElementById('email');
    const phoneEl = document.getElementById('phone');
    const websiteEl = document.getElementById('website');

    // current user
    let currentUserData = null;

    // load current user
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

                        profileFullName.textContent = userData.name || currentUsername;

                        profileUsername.textContent = userData.name || currentUsername;
                        profileEmail.textContent = userData.email || 'null';

                        fullNameEl.textContent = userData.name || 'null';
                        majorEl.textContent = userData.major || 'null';
                        enrollmentEl.textContent = userData.enrollment || 'null';
                        locationEl.textContent = userData.address || 'null';
                        bioEl.textContent = userData.bio || 'null';
                        emailEl.textContent = userData.email || 'null';
                        phoneEl.textContent = userData.phone || 'null';
                        websiteEl.textContent = userData.website || 'null';
                    }
                }
            }
        } catch (error) {
            console.error("Error loading current user:", error);
        }
    }


    function editProfile() {
        document.querySelectorAll('.value, .bio p').forEach(element => {
            element.contentEditable = true;
            element.classList.add('editing');
        });

        editProfileBtn.textContent = "Save Changes";
        editProfileBtn.removeEventListener('click', editProfile);
        editProfileBtn.addEventListener('click', saveProfileChanges);
    }


    async function saveProfileChanges() {
        const name = fullNameEl.textContent;
        const major = majorEl.textContent;
        const enrollment = enrollmentEl.textContent;
        const address = locationEl.textContent;
        const bio = bioEl.textContent;
        const email = emailEl.textContent;
        const phone = phoneEl.textContent;
        const website = websiteEl.textContent;

        try {
            await updateUserPrivateData(
                currentUserData.username,
                name,
                null,
                email,
                address,
                phone,
                major,
                enrollment,
                bio,
                website,
            );

            showSuccessMessage("Profile updated successfully!");

            // 恢复编辑状态
            document.querySelectorAll('.value, .bio p').forEach(element => {
                element.contentEditable = false;
                element.classList.remove('editing');
            });

            editProfileBtn.textContent = "Edit Profile";
            editProfileBtn.removeEventListener('click', saveProfileChanges);
            editProfileBtn.addEventListener('click', editProfile);
            await loadCurrentUser();
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile.");
        }
    }


    function editSection(section) {
        const elements = document.querySelectorAll(`#${section}Section .value, #${section}Section .bio p`);

        elements.forEach(element => {
            element.contentEditable = true;
            element.classList.add('editing');
            element.focus();
        });

        editProfileBtn.textContent = "Save Changes";
        editProfileBtn.removeEventListener('click', editProfile);
        editProfileBtn.addEventListener('click', saveProfileChanges);
    }


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


    window.logout = async function() {
        if (confirm("Are you sure you want to log out?")) {
            try {
                await updateCurrentUser(null);
                localStorage.removeItem("isLoggedIn");
                window.location.href = "register_login.html";
            } catch (error) {
                console.error("Logout error:", error);
                alert("An error occurred during logout. Please try again.");
            }
        }
    }


    await loadCurrentUser();


    editProfileBtn.addEventListener('click', editProfile);

    editSectionBtn.forEach(button => {
        button.addEventListener('click', () => {
            const section = button.getAttribute('data-section');
            editSection(section);
        });
    });
});