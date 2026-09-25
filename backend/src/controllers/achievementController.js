const path = require('path');
const fs = require('fs');
const db = require('../config/db');

// Helper to remove uploaded file on error
const cleanupFile = (filePath) => {
    if (filePath && fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
        } catch (e) {
            console.error('File cleanup error:', e);
        }
    }
};

const createAchievement = async (req, res) => {
    try {
        const { title, category, event_type, status, event_date, description } = req.body;
        const userId = req.user.id;

        if (!title || !category || !event_type || !status || !event_date) {
            if (req.file) cleanupFile(req.file.path);
            return res.status(400).json({ message: 'Title, category, event type, status, and event date are required.' });
        }

        const validStatuses = ['win', 'participated'];
        if (!validStatuses.includes(status.toLowerCase())) {
            if (req.file) cleanupFile(req.file.path);
            return res.status(400).json({ message: 'Status must be either "win" or "participated".' });
        }

        // Must include a certificate file
        if (!req.file) {
            return res.status(400).json({ message: 'A valid certificate (PDF, JPG, or PNG under 5MB) is required.' });
        }

        const certificate_url = `/uploads/${req.file.filename}`;

        const insertSql = `
            INSERT INTO achievements (
                user_id, title, category, event_type, status, event_date, 
                description, certificate_url, approval_status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
            RETURNING *
        `;

        const result = await db.query(insertSql, [
            userId,
            title.trim(),
            category.trim(),
            event_type.trim(),
            status.toLowerCase(),
            event_date,
            description ? description.trim() : '',
            certificate_url
        ]);

        const achievement = result.rows[0];

        // Notify faculty/HOD or student record
        await db.query(
            'INSERT INTO notifications (user_id, message) VALUES ($1, $2)',
            [userId, `Your achievement "${achievement.title}" has been submitted and is pending faculty review.`]
        );

        return res.status(201).json({
            message: 'Achievement submitted successfully and sent for review.',
            achievement
        });
    } catch (err) {
        if (req.file) cleanupFile(req.file.path);
        console.error('Error creating achievement:', err);
        return res.status(500).json({ message: 'Failed to create achievement record.' });
    }
};

const getAchievements = async (req, res) => {
    try {
        const {
            userId,
            category,
            event_type,
            status, // win / participated
            approval_status, // pending / approved / rejected
            year,
            section,
            department,
            search,
            startDate,
            endDate,
            sortBy = 'created_at',
            sortOrder = 'DESC'
        } = req.query;

        let sql = `
            SELECT a.*, 
                   u.name as student_name, 
                   u.email as student_email, 
                   u.roll_no as student_roll_no, 
                   u.year as student_year, 
                   u.section as student_section, 
                   u.department as student_department,
                   rev.name as reviewer_name,
                   rev.role as reviewer_role
            FROM achievements a
            JOIN users u ON a.user_id = u.id
            LEFT JOIN users rev ON a.reviewed_by = rev.id
            WHERE 1=1
        `;
        const params = [];

        // Role-based restrictions
        if (req.user.role === 'student') {
            // Student can only see their own achievements unless querying public portfolio
            params.push(req.user.id);
            sql += ` AND a.user_id = $${params.length}`;
        } else if (userId) {
            params.push(parseInt(userId));
            sql += ` AND a.user_id = $${params.length}`;
        }

        if (category) {
            params.push(category);
            sql += ` AND a.category = $${params.length}`;
        }

        if (event_type) {
            params.push(event_type);
            sql += ` AND a.event_type = $${params.length}`;
        }

        if (status) {
            params.push(status.toLowerCase());
            sql += ` AND a.status = $${params.length}`;
        }

        if (approval_status) {
            params.push(approval_status.toLowerCase());
            sql += ` AND a.approval_status = $${params.length}`;
        }

        if (year) {
            params.push(year);
            sql += ` AND u.year = $${params.length}`;
        }

        if (section) {
            params.push(section);
            sql += ` AND u.section = $${params.length}`;
        }

        if (department) {
            params.push(department);
            sql += ` AND u.department = $${params.length}`;
        }

        if (startDate) {
            params.push(startDate);
            sql += ` AND a.event_date >= $${params.length}`;
        }

        if (endDate) {
            params.push(endDate);
            sql += ` AND a.event_date <= $${params.length}`;
        }

        if (search) {
            params.push(`%${search.trim().toLowerCase()}%`);
            sql += ` AND (
                LOWER(a.title) LIKE $${params.length} OR 
                LOWER(a.category) LIKE $${params.length} OR 
                LOWER(u.name) LIKE $${params.length} OR 
                LOWER(u.roll_no) LIKE $${params.length}
            )`;
        }

        const validSortCols = ['created_at', 'event_date', 'title', 'approval_status'];
        const sortCol = validSortCols.includes(sortBy) ? sortBy : 'created_at';
        const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        sql += ` ORDER BY a.${sortCol} ${order}`;

        const result = await db.query(sql, params);
        return res.json({ achievements: result.rows, total: result.rowCount });
    } catch (err) {
        console.error('Error fetching achievements:', err);
        return res.status(500).json({ message: 'Failed to retrieve achievements.' });
    }
};

const getAchievementById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const sql = `
            SELECT a.*, 
                   u.name as student_name, 
                   u.email as student_email, 
                   u.roll_no as student_roll_no, 
                   u.year as student_year, 
                   u.section as student_section, 
                   u.department as student_department,
                   rev.name as reviewer_name
            FROM achievements a
            JOIN users u ON a.user_id = u.id
            LEFT JOIN users rev ON a.reviewed_by = rev.id
            WHERE a.id = $1
        `;

        const result = await db.query(sql, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Achievement record not found.' });
        }

        const achievement = result.rows[0];

        // Check permission: student can only view their own
        if (req.user.role === 'student' && achievement.user_id !== req.user.id) {
            return res.status(403).json({ message: 'Access denied.' });
        }

        return res.json({ achievement });
    } catch (err) {
        console.error('Error fetching achievement by ID:', err);
        return res.status(500).json({ message: 'Failed to retrieve achievement.' });
    }
};

const updateAchievement = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { title, category, event_type, status, event_date, description } = req.body;

        const checkRes = await db.query('SELECT * FROM achievements WHERE id = $1', [id]);
        if (checkRes.rows.length === 0) {
            if (req.file) cleanupFile(req.file.path);
            return res.status(404).json({ message: 'Achievement not found.' });
        }

        const existing = checkRes.rows[0];

        // Student can only update their own
        if (req.user.role === 'student' && existing.user_id !== req.user.id) {
            if (req.file) cleanupFile(req.file.path);
            return res.status(403).json({ message: 'You can only edit your own achievements.' });
        }

        let certUrl = existing.certificate_url;
        if (req.file) {
            certUrl = `/uploads/${req.file.filename}`;
            // Delete old file if present
            const oldPath = path.join(__dirname, '..', '..', existing.certificate_url);
            cleanupFile(oldPath);
        }

        // If an achievement was rejected and the student edits it, reset to pending
        const newApprovalStatus = (req.user.role === 'student' && existing.approval_status === 'rejected') 
            ? 'pending' 
            : existing.approval_status;

        const updateSql = `
            UPDATE achievements
            SET title = COALESCE($1, title),
                category = COALESCE($2, category),
                event_type = COALESCE($3, event_type),
                status = COALESCE($4, status),
                event_date = COALESCE($5, event_date),
                description = COALESCE($6, description),
                certificate_url = $7,
                approval_status = $8
            WHERE id = $9
            RETURNING *
        `;

        const result = await db.query(updateSql, [
            title ? title.trim() : null,
            category ? category.trim() : null,
            event_type ? event_type.trim() : null,
            status ? status.toLowerCase() : null,
            event_date || null,
            description !== undefined ? description.trim() : null,
            certUrl,
            newApprovalStatus,
            id
        ]);

        return res.json({
            message: 'Achievement updated successfully.',
            achievement: result.rows[0]
        });
    } catch (err) {
        if (req.file) cleanupFile(req.file.path);
        console.error('Error updating achievement:', err);
        return res.status(500).json({ message: 'Failed to update achievement.' });
    }
};

const deleteAchievement = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const checkRes = await db.query('SELECT * FROM achievements WHERE id = $1', [id]);
        if (checkRes.rows.length === 0) {
            return res.status(404).json({ message: 'Achievement not found.' });
        }

        const existing = checkRes.rows[0];

        // Only owner student or HOD can delete
        if (req.user.role === 'student' && existing.user_id !== req.user.id) {
            return res.status(403).json({ message: 'You can only delete your own achievements.' });
        }

        // Remove certificate file from disk
        if (existing.certificate_url) {
            const filePath = path.join(__dirname, '..', '..', existing.certificate_url);
            cleanupFile(filePath);
        }

        await db.query('DELETE FROM achievements WHERE id = $1', [id]);

        return res.json({ message: 'Achievement deleted successfully.' });
    } catch (err) {
        console.error('Error deleting achievement:', err);
        return res.status(500).json({ message: 'Failed to delete achievement.' });
    }
};

module.exports = {
    createAchievement,
    getAchievements,
    getAchievementById,
    updateAchievement,
    deleteAchievement
};
