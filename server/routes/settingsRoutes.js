const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
  testArkeselConnection
} = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getSettings);
router.put('/', updateSettings);
router.post('/test-connection', testArkeselConnection);

module.exports = router;
