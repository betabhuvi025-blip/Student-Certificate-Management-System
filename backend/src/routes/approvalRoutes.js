const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approvalController');
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

router.use(authenticate);
router.use(authorize(['faculty', 'hod']));

router.get('/pending', approvalController.getPendingApprovals);
router.post('/:id/review', approvalController.reviewAchievement);

module.exports = router;
