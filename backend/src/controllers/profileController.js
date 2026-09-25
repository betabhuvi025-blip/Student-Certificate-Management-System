const db = require('../config/db');

const getProfile = async (req, res) => {
    try {
        const userId = req.params.id ? parseInt(req.params.id) : req.user.id;

        // If requesting someone else's profile, only faculty/hod can view
        if (userId !== req.user.id && req.user.role === 'student') {
            return res.status(403).json({ message: 'Access denied.' });
        }

        const result = await db.query(
            `SELECT id, name, email, role, department, year, section, roll_no, created_at
             FROM users WHERE id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Also fetch summary points and stats for this student
        const user = result.rows[0];
        let stats = null;

        if (user.role === 'student') {
            const statsRes = await db.query(
                `SELECT 
                    COUNT(*) as total_achievements,
                    SUM(CASE WHEN approval_status = 'approved' THEN 1 ELSE 0 END) as approved_count,
                    SUM(CASE WHEN approval_status = 'pending' THEN 1 ELSE 0 END) as pending_count,
                    SUM(CASE WHEN approval_status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
                    SUM(CASE WHEN approval_status = 'approved' AND status = 'win' THEN 10 
                             WHEN approval_status = 'approved' AND status = 'participated' THEN 5 
                             ELSE 0 END) as total_points
                 FROM achievements WHERE user_id = $1`,
                [user.id]
            );
            stats = statsRes.rows[0] || {};
        }

        return res.json({ user, stats });
    } catch (err) {
        console.error('Error fetching profile:', err);
        return res.status(500).json({ message: 'Failed to retrieve profile details.' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, department, year, section, roll_no } = req.body;
        const userId = req.user.id;

        const updateSql = `
            UPDATE users
            SET name = COALESCE($1, name),
                department = COALESCE($2, department),
                year = COALESCE($3, year),
                section = COALESCE($4, section),
                roll_no = COALESCE($5, roll_no)
            WHERE id = $6
            RETURNING id, name, email, role, department, year, section, roll_no, created_at
        `;

        const result = await db.query(updateSql, [
            name ? name.trim() : null,
            department ? department.trim() : null,
            year || null,
            section || null,
            roll_no ? roll_no.trim().toUpperCase() : null,
            userId
        ]);

        return res.json({
            message: 'Profile updated successfully.',
            user: result.rows[0]
        });
    } catch (err) {
        console.error('Error updating profile:', err);
        return res.status(500).json({ message: 'Failed to update profile.' });
    }
};

const getAllStudents = async (req, res) => {
    try {
        const { year, section, search } = req.query;
        let sql = `
            SELECT u.id, u.name, u.email, u.roll_no, u.department, u.year, u.section, u.created_at,
                   COUNT(a.id) as total_submissions,
                   SUM(CASE WHEN a.approval_status = 'approved' THEN 1 ELSE 0 END) as approved_submissions,
                   SUM(CASE WHEN a.approval_status = 'approved' AND a.status = 'win' THEN 10
                            WHEN a.approval_status = 'approved' AND a.status = 'participated' THEN 5
                            ELSE 0 END) as points
            FROM users u
            LEFT JOIN achievements a ON u.id = a.user_id
            WHERE u.role = 'student'
        `;
        const params = [];

        if (year) {
            params.push(year);
            sql += ` AND u.year = $${params.length}`;
        }
        if (section) {
            params.push(section);
            sql += ` AND u.section = $${params.length}`;
        }
        if (search) {
            params.push(`%${search.trim().toLowerCase()}%`);
            sql += ` AND (LOWER(u.name) LIKE $${params.length} OR LOWER(u.roll_no) LIKE $${params.length} OR LOWER(u.email) LIKE $${params.length})`;
        }

        sql += ` GROUP BY u.id, u.name, u.email, u.roll_no, u.department, u.year, u.section, u.created_at
                 ORDER BY points DESC, u.roll_no ASC`;

        const result = await db.query(sql, params);
        return res.json({ students: result.rows });
    } catch (err) {
        console.error('Error fetching students list:', err);
        return res.status(500).json({ message: 'Failed to load students.' });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    getAllStudents
};
