const jwt = require('jsonwebtoken');
const db = require('../config/db');

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authentication required. No token provided.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'student_event_tracker_jwt_secret_dev_2026');

        // Fetch user from DB to ensure valid session and updated role
        const result = await db.query('SELECT id, name, email, role, department, year, section, roll_no FROM users WHERE id = $1', [decoded.id]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'User account not found or has been deactivated.' });
        }

        req.user = result.rows[0];
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired. Please refresh your session or log in again.' });
        }
        return res.status(401).json({ message: 'Invalid authentication token.' });
    }
};

module.exports = authenticate;
