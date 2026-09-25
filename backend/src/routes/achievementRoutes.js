const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievementController');
const authenticate = require('../middleware/authMiddleware');
const { handleCertificateUpload } = require('../middleware/uploadMiddleware');

router.get('/', authenticate, achievementController.getAchievements);
router.get('/:id', authenticate, achievementController.getAchievementById);
router.post('/', authenticate, handleCertificateUpload, achievementController.createAchievement);
router.put('/:id', authenticate, handleCertificateUpload, achievementController.updateAchievement);
router.delete('/:id', authenticate, achievementController.deleteAchievement);

module.exports = router;
