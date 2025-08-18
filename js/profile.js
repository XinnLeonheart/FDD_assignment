// profile.js
document.addEventListener('DOMContentLoaded', () => {
    // 编辑个人资料按钮
    const editProfileBtn = document.getElementById('editProfileBtn');

    // 编辑各部分的按钮
    const editSectionBtns = document.querySelectorAll('.edit-section-btn');

    // 模拟用户数据
    const userData = {
        fullName: "John Michael Smith",
        major: "Computer Science",
        enrollment: "2022",
        location: "Kuala Lumpur, Malaysia",
        bio: "Passionate about AI and machine learning. Currently working on a research project about neural networks. Love hiking and photography in my free time.",
        email: "john.smith@student.apu.edu.my",
        phone: "+60 12 345 6789",
        website: "johnsmith-portfolio.com"
    };

    // 初始化个人资料
    function initializeProfile() {
        // 填充用户数据
        document.getElementById('fullName').textContent = userData.fullName;
        document.getElementById('major').textContent = userData.major;
        document.getElementById('enrollment').textContent = userData.enrollment;
        document.getElementById('location').textContent = userData.location;
        document.getElementById('email').textContent = userData.email;
        document.getElementById('phone').textContent = userData.phone;
        document.getElementById('website').textContent = userData.website;

        // 填充个人简介
        document.querySelector('.bio p').textContent = userData.bio;
    }

    // 编辑个人资料
    function editProfile() {
        // 显示编辑模式
        document.querySelectorAll('.value').forEach(element => {
            element.contentEditable = true;
            element.classList.add('editing');
            element.focus();
        });

        document.querySelector('.bio p').contentEditable = true;
        document.querySelector('.bio p').classList.add('editing');

        // 改变按钮文本和功能
        editProfileBtn.textContent = "Save Changes";
        editProfileBtn.removeEventListener('click', editProfile);
        editProfileBtn.addEventListener('click', saveProfileChanges);
    }

    // 保存个人资料更改
    function saveProfileChanges() {
        // 保存更改到用户数据对象
        userData.fullName = document.getElementById('fullName').textContent;
        userData.major = document.getElementById('major').textContent;
        userData.enrollment = document.getElementById('enrollment').textContent;
        userData.location = document.getElementById('location').textContent;
        userData.email = document.getElementById('email').textContent;
        userData.phone = document.getElementById('phone').textContent;
        userData.website = document.getElementById('website').textContent;
        userData.bio = document.querySelector('.bio p').textContent;

        // 禁用编辑
        document.querySelectorAll('.value').forEach(element => {
            element.contentEditable = false;
            element.classList.remove('editing');
        });

        document.querySelector('.bio p').contentEditable = false;
        document.querySelector('.bio p').classList.remove('editing');

        // 恢复按钮文本和功能
        editProfileBtn.textContent = "Edit Profile";
        editProfileBtn.removeEventListener('click', saveProfileChanges);
        editProfileBtn.addEventListener('click', editProfile);

        // 显示保存成功的消息
        showSuccessMessage("Profile updated successfully!");

        // 在实际应用中，这里会调用API或更新数据库
        console.log("Profile data saved:", userData);
    }

    // 编辑特定部分
    function editSection(section) {
        const elements = document.querySelectorAll(`#${section}Section .value, #${section}Section .bio p`);

        elements.forEach(element => {
            element.contentEditable = true;
            element.classList.add('editing');
            element.focus();
        });
    }

    // 显示成功消息
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

    // 事件监听器
    editProfileBtn.addEventListener('click', editProfile);

    editSectionBtns.forEach(button => {
        button.addEventListener('click', () => {
            const section = button.getAttribute('data-section');
            editSection(section);
        });
    });

    // 初始化个人资料
    initializeProfile();
});