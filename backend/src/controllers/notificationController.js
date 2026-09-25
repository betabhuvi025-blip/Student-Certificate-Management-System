const db = require('../config/db');

const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await db.query(
            `SELECT id, user_id, message, is_read, created_at
             FROM notifications
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT 50`,
            [userId]
        );

        const unreadCount = result.rows.filter(n => !n.is_read || n.is_read === 0).length;

        return res.json({
            notifications: result.rows,
            unreadCount
        });
    } catch (err) {
        console.error('Error fetching notifications:', err);
        return res.status(500).json({ message: 'Failed to retrieve notifications.' });
    }
};

const markAsRead = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const userId = req.user.id;

        await db.query(
            'UPDATE notifications SET is_read = 1 WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        return res.json({ message: 'Notification marked as read.' });
    } catch (err) {
        console.error('Error marking notification as read:', err);
        return res.status(500).json({ message: 'Failed to update notification.' });
    }
};

const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        await db.query(
            'UPDATE notifications SET is_read = 1 WHERE user_id = $1',
            [userId]
        );

        return res.json({ message: 'All notifications marked as read.' });
    } catch (err) {
        console.error('Error marking all notifications as read:', err);
        return res.status(500).json({ message: 'Failed to update notifications.' });
    }
};

const deleteNotification = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const userId = req.user.id;

        await db.query(
            'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        return res.json({ message: 'Notification deleted.' });
    } catch (err) {
        console.error('Error deleting notification:', err);
        return res.status(500).json({ message: 'Failed to delete notification.' });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
};
