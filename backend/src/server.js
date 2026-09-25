const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const db = require('./config/db');
const seed = require('./seeds/seed');

// Import routes
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const achievementRoutes = require('./routes/achievementRoutes');
const approvalRoutes = require('./routes/approvalRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const exportRoutes = require('./routes/exportRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: '*', // Allow requests from any client origin in development
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure upload directory exists and serve static uploads
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// API Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        app: 'Student Event Tracker API',
        timestamp: new Date().toISOString(),
        database: db.isPostgres ? 'PostgreSQL' : 'Embedded SQLite'
    });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/export', exportRoutes);

// 404 Not Found Middleware
app.use((req, res, next) => {
    res.status(404).json({
        error: 'Route Not Found',
        message: `The endpoint ${req.method} ${req.originalUrl} does not exist.`
    });
});

// Global 500 Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Application Error:', err);
    res.status(err.status || 500).json({
        error: 'Internal Server Error',
        message: err.message || 'An unexpected error occurred on the server.'
    });
});

// Initialize database and start server
async function startServer() {
    try {
        await db.initDatabase();

        // Check if database has users; if empty, auto-seed with demo data
        const userCheck = await db.query('SELECT COUNT(*) as count FROM users');
        const userCount = parseInt(userCheck.rows[0]?.count || 0);

        if (userCount === 0) {
            console.log('Database is empty. Populating demo seed data...');
            await seed();
        } else {
            console.log(`Database ready (${userCount} users found).`);
        }

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📁 Uploads served from http://localhost:${PORT}/uploads`);
        });
    } catch (err) {
        console.error('❌ Server startup error:', err);
        process.exit(1);
    }
}

startServer();

module.exports = app;
