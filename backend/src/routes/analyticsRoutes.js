const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

router.use(authenticate);

router.get('/student', analyticsController.getStudentAnalytics);
router.get('/department', authorize(['faculty', 'hod']), analyticsController.getDepartmentAnalytics);
router.get('/leaderboard', analyticsController.getLeaderboard);

module.exports = router;
