/**
 * Notification System
 * Handles browser notifications for upcoming task deadlines
 * Add this script to dashboard.html: <script src="assets/js/notifications.js"></script>
 */

class TaskNotifications {
    constructor() {
        this.checkInterval = null;
        this.notifiedTasks = new Set();
        this.init();
    }

    /**
     * Initialize notification system
     */
    init() {
        // Request permission on page load
        this.requestPermission();
        
        // Start checking for deadlines
        this.startDeadlineChecker();
        
        // Check immediately
        this.checkDeadlines();
    }

    /**
     * Request notification permission
     */
    requestPermission() {
        if (!('Notification' in window)) {
            console.log('Browser does not support notifications');
            return;
        }

        if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.showWelcomeNotification();
                }
            });
        }
    }

    /**
     * Show welcome notification
     */
    showWelcomeNotification() {
        new Notification('Task Reminders Enabled! 🔔', {
            body: 'You will receive notifications for upcoming deadlines',
            icon: '/favicon.ico',
            badge: '/favicon.ico'
        });
    }

    /**
     * Start checking deadlines periodically
     */
    startDeadlineChecker() {
        // Check every 30 minutes
        this.checkInterval = setInterval(() => {
            this.checkDeadlines();
        }, 30 * 60 * 1000);
    }

    /**
     * Stop deadline checker
     */
    stopDeadlineChecker() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
    }

    /**
     * Check for upcoming deadlines and send notifications
     */
    checkDeadlines() {
        if (Notification.permission !== 'granted') {
            return;
        }

        if (!window.allTasks || !Array.isArray(window.allTasks)) {
            return;
        }

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        window.allTasks.forEach(task => {
            // Skip completed tasks
            if (task.status === 'Completed') {
                return;
            }

            // Skip tasks without deadlines
            if (!task.deadline) {
                return;
            }

            // Skip if already notified
            if (this.notifiedTasks.has(task.task_id)) {
                return;
            }

            const deadline = new Date(task.deadline);
            const deadlineDay = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
            const daysUntil = Math.ceil((deadlineDay - today) / (1000 * 60 * 60 * 24));

            // Notify for tasks due today or overdue
            if (daysUntil <= 0) {
                this.sendDeadlineNotification(task, daysUntil);
                this.notifiedTasks.add(task.task_id);
            }
            // Notify for tasks due within 2 days (only once)
            else if (daysUntil <= 2 && daysUntil > 0) {
                this.sendUpcomingNotification(task, daysUntil);
                this.notifiedTasks.add(task.task_id);
            }
        });
    }

    /**
     * Send notification for overdue or due today tasks
     */
    sendDeadlineNotification(task, daysUntil) {
        const title = daysUntil === 0 
            ? '⚠️ Task Due Today!' 
            : '🚨 Task Overdue!';
        
        const body = daysUntil === 0
            ? `"${task.title}" is due today`
            : `"${task.title}" was due ${Math.abs(daysUntil)} day${Math.abs(daysUntil) > 1 ? 's' : ''} ago`;

        const notification = new Notification(title, {
            body: body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: `task-${task.task_id}`,
            requireInteraction: true,
            vibrate: [200, 100, 200]
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
            if (typeof window.openEditTaskModal === 'function') {
                window.openEditTaskModal(task);
            }
        };
    }

    /**
     * Send notification for upcoming deadlines
     */
    sendUpcomingNotification(task, daysUntil) {
        const title = '📅 Upcoming Deadline';
        const body = `"${task.title}" is due in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`;

        const notification = new Notification(title, {
            body: body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: `task-${task.task_id}`
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
            if (typeof window.openEditTaskModal === 'function') {
                window.openEditTaskModal(task);
            }
        };
    }

    /**
     * Clear notification history (for testing)
     */
    clearNotificationHistory() {
        this.notifiedTasks.clear();
    }

    /**
     * Manually trigger notification check
     */
    manualCheck() {
        this.checkDeadlines();
    }
}

// Initialize notification system when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.taskNotifications = new TaskNotifications();
    });
} else {
    window.taskNotifications = new TaskNotifications();
}

/* ---------------------------------------------------------
   ⭐ Added Feature: Button to Enable Notifications Manually
--------------------------------------------------------- */

document.getElementById("enableNotificationsBtn")?.addEventListener("click", () => {
    Notification.requestPermission().then(p => {
        if (p === "granted") {
            window.taskNotifications.manualCheck();
        }
    });
});
