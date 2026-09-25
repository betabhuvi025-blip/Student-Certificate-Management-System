const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'student_event_tracker_jwt_secret_dev_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'student_event_tracker_refresh_secret_dev_2026';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

const generateTokens = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });

    return { accessToken, refreshToken };
};

const register = async (req, res) => {
    try {
        const { name, email, password, role = 'student', department = 'Information Technology', year, section, roll_no } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please provide a valid email address.' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
        }

        const validRoles = ['student', 'faculty', 'hod'];
        const normalizedRole = role.toLowerCase();
        if (!validRoles.includes(normalizedRole)) {
            return res.status(400).json({ message: 'Invalid role. Must be student, faculty, or hod.' });
        }

        // Check if user already exists
        const existing = await db.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ message: 'An account with this email already exists.' });
        }

        // Hash password with minimum 10 salt rounds
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Insert new user
        const insertSql = `
            INSERT INTO users (name, email, password_hash, role, department, year, section, roll_no)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, name, email, role, department, year, section, roll_no, created_at
        `;
        const result = await db.query(insertSql, [
            name.trim(),
            email.trim().toLowerCase(),
            password_hash,
            normalizedRole,
            department || 'Information Technology',
            year || null,
            section || null,
            roll_no ? roll_no.trim().toUpperCase() : null
        ]);

        const newUser = result.rows[0];
        const { accessToken, refreshToken } = generateTokens(newUser);

        // Add welcome notification
        await db.query(
            'INSERT INTO notifications (user_id, message) VALUES ($1, $2)',
            [newUser.id, `Welcome to the Student Event Tracker, ${newUser.name}! Your account is active.`]
        );

        return res.status(201).json({
            message: 'Registration successful.',
            token: accessToken,
            refreshToken,
            user: newUser
        });
    } catch (err) {
        console.error('Registration error:', err);
        return res.status(500).json({ message: 'Internal server error during registration.' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const userResult = await db.query(
            'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
            [email.trim()]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Strip password hash from response
        const safeUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            year: user.year,
            section: user.section,
            roll_no: user.roll_no,
            created_at: user.created_at
        };

        const { accessToken, refreshToken } = generateTokens(safeUser);

        return res.json({
            message: 'Login successful.',
            token: accessToken,
            refreshToken,
            user: safeUser
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Internal server error during login.' });
    }
};

const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token is required.' });
        }

        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
        const result = await db.query('SELECT id, name, email, role, department, year, section, roll_no FROM users WHERE id = $1', [decoded.id]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'User not found.' });
        }

        const user = result.rows[0];
        const tokens = generateTokens(user);

        return res.json({
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user
        });
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired refresh token.' });
    }
};

const getMe = async (req, res) => {
    return res.json({ user: req.user });
};

module.exports = {
    register,
    login,
    refreshToken,
    getMe
};
