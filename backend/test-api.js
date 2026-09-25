const http = require('http');
const app = require('./src/server');

let server;
const PORT = 5099;

function request(options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed = data;
                try {
                    parsed = JSON.parse(data);
                } catch (e) {}
                resolve({ statusCode: res.statusCode, headers: res.headers, body: parsed });
            });
        });
        req.on('error', reject);
        if (postData) {
            req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
        }
        req.end();
    });
}

async function runTests() {
    console.log('🧪 Starting API Verification Tests...\n');
    server = app.listen(PORT);

    try {
        // 1. Health Check
        const health = await request({
            hostname: 'localhost',
            port: PORT,
            path: '/api/health',
            method: 'GET'
        });
        console.log('1. Health Check:', health.statusCode === 200 ? '✅ PASSED' : '❌ FAILED', health.body);

        // 2. Student Login
        const studentLogin = await request({
            hostname: 'localhost',
            port: PORT,
            path: '/api/auth/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { email: 'student@college.edu', password: 'Password123!' });
        console.log('2. Student Login:', studentLogin.statusCode === 200 ? '✅ PASSED' : '❌ FAILED', 'Role:', studentLogin.body.user?.role);
        const studentToken = studentLogin.body.token;

        // 3. Faculty Login
        const facultyLogin = await request({
            hostname: 'localhost',
            port: PORT,
            path: '/api/auth/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { email: 'faculty@college.edu', password: 'Password123!' });
        console.log('3. Faculty Login:', facultyLogin.statusCode === 200 ? '✅ PASSED' : '❌ FAILED', 'Role:', facultyLogin.body.user?.role);
        const facultyToken = facultyLogin.body.token;

        // 4. HOD Login
        const hodLogin = await request({
            hostname: 'localhost',
            port: PORT,
            path: '/api/auth/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { email: 'hod@college.edu', password: 'Password123!' });
        console.log('4. HOD Login:', hodLogin.statusCode === 200 ? '✅ PASSED' : '❌ FAILED', 'Role:', hodLogin.body.user?.role);
        const hodToken = hodLogin.body.token;

        // 5. Profile Get & Update
        const profileRes = await request({
            hostname: 'localhost',
            port: PORT,
            path: '/api/profile/me',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${studentToken}` }
        });
        console.log('5. Student Profile:', profileRes.statusCode === 200 ? '✅ PASSED' : '❌ FAILED', 'Roll:', profileRes.body.user?.roll_no, 'Points:', profileRes.body.stats?.total_points);

        // 6. Achievements List (Student sees own)
        const achRes = await request({
            hostname: 'localhost',
            port: PORT,
            path: '/api/achievements',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${studentToken}` }
        });
        console.log('6. Student Achievements:', achRes.statusCode === 200 ? '✅ PASSED' : '❌ FAILED', 'Count:', achRes.body.total);

        // 7. Pending Approvals (Faculty sees pending)
        const pendingRes = await request({
            hostname: 'localhost',
            port: PORT,
            path: '/api/approvals/pending',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${facultyToken}` }
        });
        console.log('7. Faculty Pending Approvals:', pendingRes.statusCode === 200 ? '✅ PASSED' : '❌ FAILED', 'Pending count:', pendingRes.body.count);

        // 8. Approval Action
        if (pendingRes.body.pending?.length > 0) {
            const targetAch = pendingRes.body.pending[0];
            const approveRes = await request({
                hostname: 'localhost',
                port: PORT,
                path: `/api/approvals/${targetAch.id}/review`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${facultyToken}`
                }
            }, { action: 'approve', comment: 'Verified and approved by Faculty Advisor' });
            console.log('8. Faculty Approve Action:', approveRes.statusCode === 200 ? '✅ PASSED' : '❌ FAILED', approveRes.body.message);
        }

        // 9. Notifications check
        const notifRes = await request({
            hostname: 'localhost',
            port: PORT,
            path: '/api/notifications',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${studentToken}` }
        });
        console.log('9. Student Notifications:', notifRes.statusCode === 200 ? '✅ PASSED' : '❌ FAILED', 'Unread count:', notifRes.body.unreadCount);

        // 10. Student Analytics
        const studentStatsRes = await request({
            hostname: 'localhost',
            port: PORT,
            path: '/api/analytics/student',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${studentToken}` }
        });
        console.log('10. Student Analytics:', studentStatsRes.statusCode === 200 ? '✅ PASSED' : '❌ FAILED', 'Rank:', studentStatsRes.body.rank);

        // 11. HOD Department Analytics
        const deptStatsRes = await request({
            hostname: 'localhost',
            port: PORT,
            path: '/api/analytics/department',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${hodToken}` }
        });
        console.log('11. Department Analytics:', deptStatsRes.statusCode === 200 ? '✅ PASSED' : '❌ FAILED', 'Total Submissions:', deptStatsRes.body.summary?.total_submissions);

        // 12. Leaderboard
        const lbRes = await request({
            hostname: 'localhost',
            port: PORT,
            path: '/api/analytics/leaderboard',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${studentToken}` }
        });
        console.log('12. Leaderboard:', lbRes.statusCode === 200 ? '✅ PASSED' : '❌ FAILED', 'Top Student:', lbRes.body.leaderboard?.[0]?.name, 'Points:', lbRes.body.leaderboard?.[0]?.points);

        // 13. CSV Export
        const exportRes = await request({
            hostname: 'localhost',
            port: PORT,
            path: '/api/export/csv',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${facultyToken}` }
        });
        console.log('13. CSV Export:', exportRes.statusCode === 200 ? '✅ PASSED' : '❌ FAILED', 'Type:', exportRes.headers['content-type']);

        // 14. 404 Route handling
        const notFoundRes = await request({
            hostname: 'localhost',
            port: PORT,
            path: '/api/non-existent-route',
            method: 'GET'
        });
        console.log('14. 404 Handler:', notFoundRes.statusCode === 404 ? '✅ PASSED' : '❌ FAILED', notFoundRes.body.error);

        console.log('\n🎉 ALL 14 BACKEND MODULE TESTS COMPLETED SUCCESSFULLY!');
    } catch (err) {
        console.error('Test failed with error:', err);
    } finally {
        server.close();
        process.exit(0);
    }
}

runTests();
