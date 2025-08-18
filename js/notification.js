// Notification functions

import {loadCurrentUser} from "./general.js";

export function markAsRead(button) {
    const notificationItem = button.closest('.notification-item');
    notificationItem.classList.remove('unread');


    // Remove the status indicator
    const statusIndicator = notificationItem.querySelector('.notification-status');
    if (statusIndicator) {
        statusIndicator.remove();
        const notificationCountClass = document.querySelector('.notification-count');
        notificationCountClass.textContent = (parseInt(notificationCountClass.textContent) - 1).toString();
    }

    updateNotificationCount();
}

export function markAllAsRead() {
    const unreadNotifications = document.querySelectorAll('.notification-item.unread');
    unreadNotifications.forEach(item => {
        item.classList.remove('unread');
        const statusIndicator = item.querySelector('.notification-status');
        const notificationCountClass = document.querySelector('.notification-count');
        notificationCountClass.textContent = '0';
        if (statusIndicator) {
            statusIndicator.remove();
        }
    });

    updateNotificationCount();
}

export function deleteNotification(button) {
    const notificationItem = button.closest('.notification-item');
    const notificationCountID = document.querySelector('#notificationCount');
    notificationItem.remove();
    notificationCountID.textContent = (parseInt(notificationCountID.textContent) - 1).toString();
    updateNotificationCount();
    if (notificationCountID.textContent === '0')
    {
        const notificationList = document.getElementById('notificationList');
        notificationList.innerHTML = `
                    <div class="empty-state">
                        <i class='bx bx-bell-off'></i>
                        <h3>No notifications</h3>
                        <p>You don't have any notifications at the moment. When you do, they'll appear here.</p>
                    </div>
                `;

        // Update header
        document.querySelector('.notification-title h1').innerHTML = 'Notifications';
        document.querySelector('.notification-actions').style.display = 'none';
    }
}

export function deleteAllNotifications() {
    if (confirm("Are you sure you want to delete all notifications?")) {
        const notificationList = document.getElementById('notificationList');
        notificationList.innerHTML = `
                    <div class="empty-state">
                        <i class='bx bx-bell-off'></i>
                        <h3>No notifications</h3>
                        <p>You don't have any notifications at the moment. When you do, they'll appear here.</p>
                    </div>
                `;

        // Update header
        document.querySelector('.notification-title h1').innerHTML = 'Notifications';
        document.querySelector('.notification-actions').style.display = 'none';
    }
}

export function updateNotificationCount() {
    const unreadCount = document.querySelectorAll('.notification-item.unread').length;
    const countElement = document.querySelector('.notification-count');

    if (unreadCount > 0) {
        countElement.textContent = unreadCount.toString();
        countElement.style.display = 'inline-flex';
    } else {
        countElement.style.display = 'none';
    }
}

// Initialize notification count
document.addEventListener('DOMContentLoaded', updateNotificationCount);
document.addEventListener('DOMContentLoaded', loadCurrentUser);

window.deleteNotification = deleteNotification;
window.markAsRead = markAsRead;
window.markAllAsRead = markAllAsRead;
window.deleteAllNotifications = deleteAllNotifications;
window.updateNotificationCount = updateNotificationCount;