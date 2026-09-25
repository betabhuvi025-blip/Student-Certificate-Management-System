const db = require('../config/db');

// Helper to escape CSV fields
const escapeCSV = (field) => {
    if (field === null || field === undefined) return '""';
    const stringVal = String(field).replace(/"/g, '""');
    return `"${stringVal}"`;
};

const exportCSV = async (req, res) => {
    try {
        const {
            year,
            section,
            department,
            category,
            event_type,
            status,
            approval_status,
            search,
            startDate,
            endDate
        } = req.query;

        let sql = `
            SELECT a.id,
                   u.name as student_name,
                   u.roll_no as roll_no,
                   u.department as department,
                   u.year as year,
                   u.section as section,
                   a.title as title,
                   a.category as category,
                   a.event_type as event_type,
                   a.status as status,
                   a.event_date as event_date,
                   a.approval_status as approval_status,
                   rev.name as reviewed_by,
                   a.review_comment as review_remarks,
                   a.created_at as submitted_at
            FROM achievements a
            JOIN users u ON a.user_id = u.id
            LEFT JOIN users rev ON a.reviewed_by = rev.id
            WHERE 1=1
        `;
        const params = [];

        // If student, restrict to own achievements
        if (req.user.role === 'student') {
            params.push(req.user.id);
            sql += ` AND a.user_id = $${params.length}`;
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

        sql += ` ORDER BY a.event_date DESC, a.created_at DESC`;

        const result = await db.query(sql, params);
        const rows = result.rows;

        // CSV Header
        const headers = [
            'Record ID',
            'Student Name',
            'Roll Number',
            'Department',
            'Academic Year',
            'Section',
            'Achievement Title',
            'Category',
            'Event Type',
            'Status (Win/Participated)',
            'Event Date',
            'Approval Status',
            'Reviewed By',
            'Review Remarks',
            'Submitted At'
        ];

        let csvContent = headers.join(',') + '\r\n';

        rows.forEach(r => {
            const rowData = [
                escapeCSV(r.id),
                escapeCSV(r.student_name),
                escapeCSV(r.roll_no || 'N/A'),
                escapeCSV(r.department || 'IT'),
                escapeCSV(r.year || 'N/A'),
                escapeCSV(r.section || 'N/A'),
                escapeCSV(r.title),
                escapeCSV(r.category),
                escapeCSV(r.event_type),
                escapeCSV(r.status ? r.status.toUpperCase() : ''),
                escapeCSV(r.event_date),
                escapeCSV(r.approval_status ? r.approval_status.toUpperCase() : ''),
                escapeCSV(r.reviewed_by || 'Pending'),
                escapeCSV(r.review_remarks || ''),
                escapeCSV(r.submitted_at)
            ];
            csvContent += rowData.join(',') + '\r\n';
        });

        const filename = `student_events_report_${Date.now()}.csv`;
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.status(200).send(csvContent);
    } catch (err) {
        console.error('Error exporting CSV:', err);
        return res.status(500).json({ message: 'Failed to generate CSV export.' });
    }
};

module.exports = {
    exportCSV
};
