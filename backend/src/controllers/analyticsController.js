const db = require('../config/db');

const getStudentAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;

        // Overall stats
        const overallRes = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN approval_status = 'approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN approval_status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN approval_status = 'rejected' THEN 1 ELSE 0 END) as rejected,
                SUM(CASE WHEN approval_status = 'approved' AND status = 'win' THEN 1 ELSE 0 END) as wins,
                SUM(CASE WHEN approval_status = 'approved' AND status = 'participated' THEN 1 ELSE 0 END) as participated,
                SUM(CASE WHEN approval_status = 'approved' AND status = 'win' THEN 10
                         WHEN approval_status = 'approved' AND status = 'participated' THEN 5
                         ELSE 0 END) as total_points
            FROM achievements
            WHERE user_id = $1
        `, [userId]);

        // Category breakdown
        const categoryRes = await db.query(`
            SELECT category, COUNT(*) as count
            FROM achievements
            WHERE user_id = $1
            GROUP BY category
            ORDER BY count DESC
        `, [userId]);

        // Monthly participation trend (last 6-12 entries)
        const trendRes = await db.query(`
            SELECT substr(event_date, 1, 7) as month, COUNT(*) as count
            FROM achievements
            WHERE user_id = $1
            GROUP BY month
            ORDER BY month ASC
        `, [userId]);

        // Calculate student's departmental rank
        const rankRes = await db.query(`
            SELECT u.id,
                   SUM(CASE WHEN a.approval_status = 'approved' AND a.status = 'win' THEN 10
                            WHEN a.approval_status = 'approved' AND a.status = 'participated' THEN 5
                            ELSE 0 END) as points
            FROM users u
            LEFT JOIN achievements a ON u.id = a.user_id
            WHERE u.role = 'student'
            GROUP BY u.id
            ORDER BY points DESC
        `);

        let rank = 1;
        const allStudents = rankRes.rows;
        for (let i = 0; i < allStudents.length; i++) {
            if (allStudents[i].id === userId) {
                rank = i + 1;
                break;
            }
        }

        return res.json({
            stats: overallRes.rows[0] || {},
            categoryBreakdown: categoryRes.rows,
            trend: trendRes.rows,
            rank,
            totalStudents: allStudents.length
        });
    } catch (err) {
        console.error('Error fetching student analytics:', err);
        return res.status(500).json({ message: 'Failed to retrieve analytics.' });
    }
};

const getDepartmentAnalytics = async (req, res) => {
    try {
        const { year, section } = req.query;
        let userFilter = "u.role = 'student'";
        const params = [];

        if (year) {
            params.push(year);
            userFilter += ` AND u.year = $${params.length}`;
        }
        if (section) {
            params.push(section);
            userFilter += ` AND u.section = $${params.length}`;
        }

        // Summary cards
        const studentCountRes = await db.query(`SELECT COUNT(*) as count FROM users u WHERE ${userFilter}`, params);
        
        let achFilter = "1=1";
        const achParams = [];
        if (year) {
            achParams.push(year);
            achFilter += ` AND u.year = $${achParams.length}`;
        }
        if (section) {
            achParams.push(section);
            achFilter += ` AND u.section = $${achParams.length}`;
        }

        const statsRes = await db.query(`
            SELECT 
                COUNT(a.id) as total_submissions,
                SUM(CASE WHEN a.approval_status = 'approved' THEN 1 ELSE 0 END) as approved_count,
                SUM(CASE WHEN a.approval_status = 'pending' THEN 1 ELSE 0 END) as pending_count,
                SUM(CASE WHEN a.approval_status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
                SUM(CASE WHEN a.approval_status = 'approved' AND a.status = 'win' THEN 10
                         WHEN a.approval_status = 'approved' AND a.status = 'participated' THEN 5
                         ELSE 0 END) as total_points
            FROM achievements a
            JOIN users u ON a.user_id = u.id
            WHERE ${achFilter}
        `, achParams);

        // Category distribution (Pie Chart)
        const categoryRes = await db.query(`
            SELECT a.category, COUNT(a.id) as count
            FROM achievements a
            JOIN users u ON a.user_id = u.id
            WHERE ${achFilter}
            GROUP BY a.category
            ORDER BY count DESC
        `, achParams);

        // Event type distribution
        const eventTypeRes = await db.query(`
            SELECT a.event_type, COUNT(a.id) as count
            FROM achievements a
            JOIN users u ON a.user_id = u.id
            WHERE ${achFilter}
            GROUP BY a.event_type
            ORDER BY count DESC
        `, achParams);

        // Participation trend over time (Line Chart)
        const trendRes = await db.query(`
            SELECT substr(a.event_date, 1, 7) as month, COUNT(a.id) as count
            FROM achievements a
            JOIN users u ON a.user_id = u.id
            WHERE ${achFilter} AND a.event_date IS NOT NULL AND a.event_date != ''
            GROUP BY month
            ORDER BY month ASC
        `, achParams);

        // Year-wise student distribution
        const yearDistRes = await db.query(`
            SELECT u.year, COUNT(a.id) as submission_count,
                   SUM(CASE WHEN a.approval_status = 'approved' THEN 1 ELSE 0 END) as approved_count
            FROM users u
            LEFT JOIN achievements a ON u.id = a.user_id
            WHERE u.role = 'student'
            GROUP BY u.year
            ORDER BY u.year ASC
        `);

        // Top-performing students (Leaderboard preview)
        const topStudentsRes = await db.query(`
            SELECT u.id, u.name, u.roll_no, u.year, u.section,
                   COUNT(a.id) as total_entries,
                   SUM(CASE WHEN a.approval_status = 'approved' THEN 1 ELSE 0 END) as approved_entries,
                   SUM(CASE WHEN a.approval_status = 'approved' AND a.status = 'win' THEN 1 ELSE 0 END) as wins,
                   SUM(CASE WHEN a.approval_status = 'approved' AND a.status = 'win' THEN 10
                            WHEN a.approval_status = 'approved' AND a.status = 'participated' THEN 5
                            ELSE 0 END) as points
            FROM users u
            LEFT JOIN achievements a ON u.id = a.user_id
            WHERE ${userFilter}
            GROUP BY u.id, u.name, u.roll_no, u.year, u.section
            ORDER BY points DESC, wins DESC, u.roll_no ASC
            LIMIT 10
        `, params);

        return res.json({
            studentCount: parseInt(studentCountRes.rows[0]?.count || 0),
            summary: statsRes.rows[0] || {},
            categoryDistribution: categoryRes.rows,
            eventTypeDistribution: eventTypeRes.rows,
            trend: trendRes.rows,
            yearDistribution: yearDistRes.rows,
            topStudents: topStudentsRes.rows
        });
    } catch (err) {
        console.error('Error fetching department analytics:', err);
        return res.status(500).json({ message: 'Failed to retrieve department analytics.' });
    }
};

const getLeaderboard = async (req, res) => {
    try {
        const { year, section, department, search, limit = 50 } = req.query;

        let sql = `
            SELECT u.id, u.name, u.email, u.roll_no, u.year, u.section, u.department,
                   COUNT(a.id) as total_submissions,
                   SUM(CASE WHEN a.approval_status = 'approved' THEN 1 ELSE 0 END) as approved_count,
                   SUM(CASE WHEN a.approval_status = 'approved' AND a.status = 'win' THEN 1 ELSE 0 END) as wins_count,
                   SUM(CASE WHEN a.approval_status = 'approved' AND a.status = 'participated' THEN 1 ELSE 0 END) as participated_count,
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
        if (department) {
            params.push(department);
            sql += ` AND u.department = $${params.length}`;
        }
        if (search) {
            params.push(`%${search.trim().toLowerCase()}%`);
            sql += ` AND (LOWER(u.name) LIKE $${params.length} OR LOWER(u.roll_no) LIKE $${params.length})`;
        }

        sql += ` GROUP BY u.id, u.name, u.email, u.roll_no, u.year, u.section, u.department
                 ORDER BY points DESC, wins_count DESC, approved_count DESC, u.roll_no ASC
                 LIMIT $${params.length + 1}`;
        params.push(parseInt(limit));

        const result = await db.query(sql, params);

        // Assign ranks with ties properly handled
        let currentRank = 1;
        const rankedStudents = result.rows.map((student, idx) => {
            if (idx > 0 && student.points < result.rows[idx - 1].points) {
                currentRank = idx + 1;
            }
            return {
                ...student,
                rank: currentRank
            };
        });

        return res.json({ leaderboard: rankedStudents, total: rankedStudents.length });
    } catch (err) {
        console.error('Error fetching leaderboard:', err);
        return res.status(500).json({ message: 'Failed to retrieve leaderboard.' });
    }
};

module.exports = {
    getStudentAnalytics,
    getDepartmentAnalytics,
    getLeaderboard
};
