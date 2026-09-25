const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Helper to create a sample certificate SVG file for preview
function createSampleCertificate(fileName, recipientName, eventTitle) {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    // Create an SVG-based certificate with elegant styling
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="560" viewBox="0 0 800 560" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f8fafc"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="50%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e3a8a"/>
      <stop offset="100%" stop-color="#3b82f6"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="800" height="560" fill="url(#bgGrad)"/>

  <!-- Ornate Border -->
  <rect x="20" y="20" width="760" height="520" rx="12" fill="none" stroke="url(#borderGrad)" stroke-width="8"/>
  <rect x="32" y="32" width="736" height="496" rx="8" fill="none" stroke="#d97706" stroke-width="2" stroke-dasharray="6,4"/>

  <!-- College Header -->
  <text x="400" y="80" font-family="'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="bold" fill="#1e3a8a" text-anchor="middle" letter-spacing="3">COLLEGE OF ENGINEERING &amp; TECHNOLOGY</text>
  <text x="400" y="105" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" fill="#64748b" text-anchor="middle" letter-spacing="1">DEPARTMENT OF INFORMATION TECHNOLOGY</text>

  <!-- Gold Seal -->
  <circle cx="400" cy="150" r="28" fill="url(#goldGrad)" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))"/>
  <polygon points="400,132 405,145 419,146 408,155 412,168 400,160 388,168 392,155 381,146 395,145" fill="#ffffff"/>

  <!-- Certificate Title -->
  <text x="400" y="215" font-family="'Georgia', serif" font-size="28" font-weight="bold" fill="#0f172a" text-anchor="middle">CERTIFICATE OF RECOGNITION</text>
  <text x="400" y="240" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#64748b" text-anchor="middle">This is proudly presented to</text>

  <!-- Student Name -->
  <text x="400" y="285" font-family="'Georgia', serif" font-size="26" font-weight="bold" fill="#1e40af" text-anchor="middle">${recipientName}</text>
  <line x1="250" y1="298" x2="550" y2="298" stroke="#cbd5e1" stroke-width="1.5"/>

  <!-- Event Description -->
  <text x="400" y="335" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#334155" text-anchor="middle">for exemplary achievement and participation in</text>
  <text x="400" y="365" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="bold" fill="#0f172a" text-anchor="middle">"${eventTitle}"</text>

  <!-- Footer Signatures -->
  <g transform="translate(140, 430)">
    <line x1="0" y1="40" x2="160" y2="40" stroke="#94a3b8" stroke-width="1.5"/>
    <text x="80" y="58" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#334155" text-anchor="middle">Faculty Advisor</text>
    <text x="80" y="74" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b" text-anchor="middle">Dept. of IT</text>
  </g>

  <g transform="translate(500, 430)">
    <line x1="0" y1="40" x2="160" y2="40" stroke="#94a3b8" stroke-width="1.5"/>
    <text x="80" y="58" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#334155" text-anchor="middle">Head of Department</text>
    <text x="80" y="74" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b" text-anchor="middle">Dept. of IT</text>
  </g>

  <text x="400" y="530" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" fill="#94a3b8" text-anchor="middle">Verified on Student Event Tracker Portal &bull; ID: CET-IT-${Date.now().toString().slice(-6)}</text>
</svg>`;

    fs.writeFileSync(filePath, svgContent, 'utf8');
}

async function seed() {
    console.log('🌱 Starting database seeding...');
    await db.initDatabase();

    // 1. Clear existing seed data if needed
    try {
        await db.query('DELETE FROM notifications');
        await db.query('DELETE FROM achievements');
        await db.query('DELETE FROM users');
    } catch (e) {
        console.log('Tables ready for insert.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123!', salt);

    // 2. Insert Users
    const users = [
        {
            name: 'Priya Sharma',
            email: 'student@college.edu',
            password_hash: passwordHash,
            role: 'student',
            department: 'Information Technology',
            year: '3rd Year',
            section: 'A',
            roll_no: '21IT042'
        },
        {
            name: 'Rahul Verma',
            email: 'rahul@college.edu',
            password_hash: passwordHash,
            role: 'student',
            department: 'Information Technology',
            year: '3rd Year',
            section: 'B',
            roll_no: '21IT088'
        },
        {
            name: 'Ananya Iyer',
            email: 'ananya@college.edu',
            password_hash: passwordHash,
            role: 'student',
            department: 'Information Technology',
            year: '4th Year',
            section: 'A',
            roll_no: '20IT015'
        },
        {
            name: 'Karthik Raja',
            email: 'karthik@college.edu',
            password_hash: passwordHash,
            role: 'student',
            department: 'Information Technology',
            year: '2nd Year',
            section: 'C',
            roll_no: '22IT104'
        },
        {
            name: 'Dr. Rajesh Kumar',
            email: 'faculty@college.edu',
            password_hash: passwordHash,
            role: 'faculty',
            department: 'Information Technology',
            year: null,
            section: null,
            roll_no: null
        },
        {
            name: 'Dr. Anand Mohan',
            email: 'hod@college.edu',
            password_hash: passwordHash,
            role: 'hod',
            department: 'Information Technology',
            year: null,
            section: null,
            roll_no: null
        }
    ];

    const insertedUsers = {};

    for (const u of users) {
        const res = await db.query(`
            INSERT INTO users (name, email, password_hash, role, department, year, section, roll_no)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, name, email, role
        `, [u.name, u.email, u.password_hash, u.role, u.department, u.year, u.section, u.roll_no]);

        insertedUsers[u.email] = res.rows[0];
        console.log(`👤 Created user: [${u.role.toUpperCase()}] ${u.name} (${u.email})`);
    }

    const priyaId = insertedUsers['student@college.edu'].id;
    const rahulId = insertedUsers['rahul@college.edu'].id;
    const ananyaId = insertedUsers['ananya@college.edu'].id;
    const karthikId = insertedUsers['karthik@college.edu'].id;
    const facultyId = insertedUsers['faculty@college.edu'].id;
    const hodId = insertedUsers['hod@college.edu'].id;

    // 3. Create Sample Certificate Files
    createSampleCertificate('cert-sih-2026.svg', 'Priya Sharma', 'Smart India Hackathon 2026 - 1st Runner Up');
    createSampleCertificate('cert-aws-workshop.svg', 'Priya Sharma', 'AWS Cloud & GenAI Intensive Hands-on Workshop');
    createSampleCertificate('cert-nptel-cloud.svg', 'Priya Sharma', 'NPTEL Cloud Computing & Distributed Systems');
    createSampleCertificate('cert-ieee-paper.svg', 'Ananya Iyer', 'IEEE International Conference on Edge AI');
    createSampleCertificate('cert-ignite-symposium.svg', 'Rahul Verma', 'National Technical Symposium IGNITE 2026');
    createSampleCertificate('cert-google-challenge.svg', 'Rahul Verma', 'Google Solution Challenge 2026 Finalist');
    createSampleCertificate('cert-cyber-bootcamp.svg', 'Karthik Raja', 'Cybersecurity & Ethical Hacking Bootcamp');
    createSampleCertificate('cert-web-sprint.svg', 'Ananya Iyer', 'State Level Web Development Sprint');

    // 4. Insert Achievements
    const achievements = [
        {
            user_id: priyaId,
            title: 'Smart India Hackathon 2026 - 1st Runner Up',
            category: 'Hackathon',
            event_type: 'National',
            status: 'win',
            event_date: '2026-08-15',
            description: 'Developed an automated offline-first disaster response coordination app for NDRF problem statement. Won cash prize of ₹75,000.',
            certificate_url: '/uploads/cert-sih-2026.svg',
            approval_status: 'approved',
            reviewed_by: facultyId,
            review_comment: 'Outstanding achievement! Excellent representation of the IT department at the national level.'
        },
        {
            user_id: priyaId,
            title: 'NPTEL Cloud Computing & Distributed Systems',
            category: 'NPTEL Course',
            event_type: 'National',
            status: 'win',
            event_date: '2026-07-20',
            description: '12-week course completed with Elite + Silver medal, scoring in the top 5% of all candidates nationwide.',
            certificate_url: '/uploads/cert-nptel-cloud.svg',
            approval_status: 'approved',
            reviewed_by: facultyId,
            review_comment: 'Verified NPTEL roll number and grade sheet. Excellent score.'
        },
        {
            user_id: priyaId,
            title: 'AWS Cloud & GenAI Hands-on Workshop',
            category: 'Workshop',
            event_type: 'Inter-College',
            status: 'participated',
            event_date: '2026-09-02',
            description: '3-day technical workshop on deploying serverless LLM applications using AWS Bedrock and Lambda.',
            certificate_url: '/uploads/cert-aws-workshop.svg',
            approval_status: 'pending',
            reviewed_by: null,
            review_comment: null
        },
        {
            user_id: ananyaId,
            title: 'IEEE International Conference on Edge AI - Best Paper',
            category: 'Paper Presentation',
            event_type: 'International',
            status: 'win',
            event_date: '2026-06-18',
            description: 'Presented research on "Low-Latency Fault Tolerant Micro-Inference on IoT Devices". Received the Best Student Paper award.',
            certificate_url: '/uploads/cert-ieee-paper.svg',
            approval_status: 'approved',
            reviewed_by: hodId,
            review_comment: 'Approved at department level. Eligible for college research incentive grant.'
        },
        {
            user_id: ananyaId,
            title: 'State Level Web Development Sprint',
            category: 'Symposium',
            event_type: 'Inter-College',
            status: 'win',
            event_date: '2026-05-12',
            description: 'Built a real-time hospital resource tracker within 6 hours. Secured 1st place among 35 teams.',
            certificate_url: '/uploads/cert-web-sprint.svg',
            approval_status: 'approved',
            reviewed_by: facultyId,
            review_comment: 'Great work representing the college.'
        },
        {
            user_id: rahulId,
            title: 'Google Solution Challenge 2026 - Campus Finalist',
            category: 'Hackathon',
            event_type: 'International',
            status: 'participated',
            event_date: '2026-08-28',
            description: 'Created a carbon footprint tracker for local campus cafeterias using Flutter and Firebase.',
            certificate_url: '/uploads/cert-google-challenge.svg',
            approval_status: 'pending',
            reviewed_by: null,
            review_comment: null
        },
        {
            user_id: rahulId,
            title: 'National Technical Symposium IGNITE 2026 - Code Blitz',
            category: 'Symposium',
            event_type: 'National',
            status: 'win',
            event_date: '2026-04-10',
            description: 'Speed coding competition involving competitive programming algorithms. Won 1st place.',
            certificate_url: '/uploads/cert-ignite-symposium.svg',
            approval_status: 'approved',
            reviewed_by: facultyId,
            review_comment: 'Verified certificate from organizer portal.'
        },
        {
            user_id: karthikId,
            title: 'Hands-on Cybersecurity & Penetration Testing Bootcamp',
            category: 'Workshop',
            event_type: 'Intra-College',
            status: 'participated',
            event_date: '2026-09-10',
            description: 'Introductory 2-day workshop on Wireshark, Nmap, and OWASP Top 10 vulnerabilities.',
            certificate_url: '/uploads/cert-cyber-bootcamp.svg',
            approval_status: 'rejected',
            reviewed_by: facultyId,
            review_comment: 'The uploaded certificate image has blurred attendance details. Please scan and re-upload a clear copy.'
        }
    ];

    for (const ach of achievements) {
        await db.query(`
            INSERT INTO achievements (
                user_id, title, category, event_type, status, event_date,
                description, certificate_url, approval_status, reviewed_by, review_comment
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
            ach.user_id,
            ach.title,
            ach.category,
            ach.event_type,
            ach.status,
            ach.event_date,
            ach.description,
            ach.certificate_url,
            ach.approval_status,
            ach.reviewed_by,
            ach.review_comment
        ]);
    }
    console.log(`🏆 Seeded ${achievements.length} achievements across various categories and statuses.`);

    // 5. Notifications
    const notifications = [
        {
            user_id: priyaId,
            message: '🎉 Congratulations! Your achievement "Smart India Hackathon 2026 - 1st Runner Up" was APPROVED by FACULTY Dr. Rajesh Kumar.'
        },
        {
            user_id: priyaId,
            message: 'Your achievement "AWS Cloud & GenAI Hands-on Workshop" was submitted and is pending faculty review.'
        },
        {
            user_id: karthikId,
            message: '⚠️ Action required: Your achievement "Hands-on Cybersecurity & Penetration Testing Bootcamp" was REJECTED. Remarks: "The uploaded certificate image has blurred attendance details. Please scan and re-upload a clear copy."'
        },
        {
            user_id: ananyaId,
            message: '🎖️ High Honors! Your paper presentation "IEEE International Conference on Edge AI" was APPROVED by HOD Dr. Anand Mohan.'
        }
    ];

    for (const n of notifications) {
        await db.query('INSERT INTO notifications (user_id, message) VALUES ($1, $2)', [n.user_id, n.message]);
    }

    console.log('🔔 Notifications seeded.');
    console.log('✅ Database seeding finished successfully!');
}

if (require.main === module) {
    seed()
        .then(() => process.exit(0))
        .catch(err => {
            console.error('Seeding error:', err);
            process.exit(1);
        });
}

module.exports = seed;
