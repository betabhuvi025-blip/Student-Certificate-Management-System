const db = require('../config/db');

const getPendingApprovals = async (req, res) => {
    try {
        const { year, section, category, search } = req.query;

        let sql = `
            SELECT a.*, 
                   u.name as student_name, 
                   u.email as student_email, 
                   u.roll_no as student_roll_no, 
                   u.year as student_year, 
                   u.section as student_section, 
                   u.department as student_department
            FROM achievements a
            JOIN users u ON a.user_id = u.id
            WHERE a.approval_status = 'pending'
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
        if (category) {
            params.push(category);
            sql += ` AND a.category = $${params.length}`;
        }
        if (search) {
            params.push(`%${search.trim().toLowerCase()}%`);
            sql += ` AND (
                LOWER(a.title) LIKE $${params.length} OR 
                LOWER(u.name) LIKE $${params.length} OR 
                LOWER(u.roll_no) LIKE $${params.length}
            )`;
        }

        sql += ` ORDER BY a.created_at ASC`;

        const result = await db.query(sql, params);
        return res.json({ pending: result.rows, count: result.rowCount });
    } catch (err) {
        console.error('Error fetching pending approvals:', err);
        return res.status(500).json({ message: 'Failed to retrieve pending submissions.' });
    }
};

const reviewAchievement = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { action, comment = '' } = req.body; // action: 'approve' or 'reject'
        const reviewerId = req.user.id;
        const reviewerName = req.user.name;
        const reviewerRole = req.user.role.toUpperCase();

        if (!action || !['approve', 'reject'].includes(action.toLowerCase())) {
            return res.status(400).json({ message: 'Action must be either "approve" or "reject".' });
        }

        const isApproval = action.toLowerCase() === 'approve';
        const newStatus = isApproval ? 'approved' : 'rejected';

        // Check achievement exists
        const checkRes = await db.query(`
            SELECT a.*, u.name as student_name, u.id as student_id
            FROM achievements a 
            JOIN users u ON a.user_id = u.id 
            WHERE a.id = $1
        `, [id]);

        if (checkRes.rows.length === 0) {
            return res.status(404).json({ message: 'Achievement not found.' });
        }

        const achievement = checkRes.rows[0];

        // Update achievement status
        const updateSql = `
            UPDATE achievements
            SET approval_status = $1,
                reviewed_by = $2,
                review_comment = $3
            WHERE id = $4
            RETURNING *
        `;

        const result = await db.query(updateSql, [
            newStatus,
            reviewerId,
            comment.trim(),
            id
        ]);

        const updatedAchievement = result.rows[0];

        // Generate student notification
        const statusText = isApproval ? '✅ APPROVED' : '❌ REJECTED';
        const commentPart = comment.trim() ? ` Remarks: "${comment.trim()}"` : '';
        const notificationMsg = `Your achievement "${achievement.title}" was ${statusText} by ${reviewerRole} ${reviewerName}.${commentPart}`;

        await db.query(
            'INSERT INTO notifications (user_id, message) VALUES ($1, $2)',
            [achievement.student_id, notificationMsg]
        );

        return res.json({
            message: `Achievement successfully ${newStatus}.`,
            achievement: updatedAchievement
        });
    } catch (err) {
        console.error('Error reviewing achievement:', err);
        return res.status(500).json({ message: 'Failed to process approval.' });
    }
};

module.exports = {
    getPendingApprovals,
    reviewAchievement
};
