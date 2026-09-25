const path = require('path');
const fs = require('fs');
require('dotenv').config();

let dbClient = null;
let isPostgres = false;

// Attempt PostgreSQL initialization if DATABASE_URL or PGHOST is defined
async function initDatabase() {
    if (process.env.DATABASE_URL || process.env.PGHOST) {
        try {
            const { Pool } = require('pg');
            const pool = new Pool({
                connectionString: process.env.DATABASE_URL,
                host: process.env.PGHOST || 'localhost',
                port: process.env.PGPORT || 5432,
                user: process.env.PGUSER || 'postgres',
                password: process.env.PGPASSWORD || 'postgres',
                database: process.env.PGDATABASE || 'student_event_tracker',
                ssl: process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL.includes('localhost') ? { rejectUnauthorized: false } : false
            });

            // Test connection
            const client = await pool.connect();
            client.release();
            isPostgres = true;
            dbClient = pool;
            console.log('✅ Connected to PostgreSQL database');

            // Run PostgreSQL table migrations
            await runPostgresMigrations(pool);
            return;
        } catch (err) {
            console.warn('⚠️ Could not connect to PostgreSQL:', err.message);
            console.log('🔄 Seamlessly falling back to embedded local database engine...');
        }
    }

    // Fallback: embedded SQLite with identical schema
    initSqlite();
}

function initSqlite() {
    try {
        const Database = require('better-sqlite3');
        const dbPath = path.join(__dirname, '..', '..', 'tracker.db');
        const sqliteDb = new Database(dbPath);
        sqliteDb.pragma('journal_mode = WAL');
        sqliteDb.pragma('foreign_keys = ON');

        // Create tables matching PostgreSQL schema
        sqliteDb.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL CHECK (role IN ('student', 'faculty', 'hod')),
                department TEXT DEFAULT 'Information Technology',
                year TEXT,
                section TEXT,
                roll_no TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS achievements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                title TEXT NOT NULL,
                category TEXT NOT NULL,
                event_type TEXT NOT NULL,
                status TEXT NOT NULL CHECK (status IN ('win', 'participated')),
                event_date TEXT NOT NULL,
                description TEXT,
                certificate_url TEXT,
                approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
                reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
                review_comment TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                message TEXT NOT NULL,
                is_read INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id);
            CREATE INDEX IF NOT EXISTS idx_achievements_status ON achievements(approval_status);
            CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
        `);

        dbClient = sqliteDb;
        isPostgres = false;
        console.log('✅ Local Database initialized at ' + dbPath);
    } catch (err) {
        console.error('❌ Failed to initialize database:', err);
        throw err;
    }
}

async function runPostgresMigrations(pool) {
    const schemaSqlPath = path.join(__dirname, '..', 'models', 'schema.sql');
    if (fs.existsSync(schemaSqlPath)) {
        const sql = fs.readFileSync(schemaSqlPath, 'utf8');
        await pool.query(sql);
        console.log('✅ PostgreSQL schema migrations applied');
    }
}

// Unified query wrapper supporting both PostgreSQL and SQLite
async function query(text, params = []) {
    if (!dbClient) {
        await initDatabase();
    }

    if (isPostgres) {
        // Native PostgreSQL
        const res = await dbClient.query(text, params);
        return {
            rows: res.rows,
            rowCount: res.rowCount
        };
    } else {
        // SQLite: Translate $1, $2 to ?
        let sqliteText = text;
        const paramMatches = text.match(/\$\d+/g);
        if (paramMatches) {
            // Replace $1, $2, etc with ?
            sqliteText = text.replace(/\$\d+/g, '?');
        }

        // Handle boolean comparisons in SQLite (TRUE -> 1, FALSE -> 0)
        sqliteText = sqliteText
            .replace(/\bTRUE\b/gi, '1')
            .replace(/\bFALSE\b/gi, '0');

        const trimmed = sqliteText.trim().toUpperCase();
        try {
            if (trimmed.startsWith('SELECT') || sqliteText.includes('RETURNING')) {
                const stmt = dbClient.prepare(sqliteText);
                const rows = stmt.all(...params);
                return {
                    rows: rows,
                    rowCount: rows.length
                };
            } else {
                const stmt = dbClient.prepare(sqliteText);
                const info = stmt.run(...params);
                return {
                    rows: [],
                    rowCount: info.changes,
                    lastInsertRowid: info.lastInsertRowid
                };
            }
        } catch (err) {
            console.error('Database query error on SQL:', sqliteText, 'Params:', params, 'Error:', err.message);
            throw err;
        }
    }
}

module.exports = {
    initDatabase,
    query,
    get isPostgres() {
        return isPostgres;
    }
};
