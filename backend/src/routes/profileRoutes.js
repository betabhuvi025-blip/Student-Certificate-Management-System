const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

router.get('/me', authenticate, (req, res) => {
    req.params.id = req.user.id;
    profileController.getProfile(req, res);
});

router.put('/me', authenticate, profileController.updateProfile);
router.get('/students', authenticate, authorize(['faculty', 'hod']), profileController.getAllStudents);
router.get('/:id', authenticate, profileController.getProfile);

module.exports = router;
