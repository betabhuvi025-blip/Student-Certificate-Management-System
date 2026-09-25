const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const authenticate = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/csv', exportController.exportCSV);

module.exports = router;
