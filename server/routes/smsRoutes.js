const express = require('express');
const router = express.Router();
const {
  sendSms,
  getSmsLogs,
  exportSmsLogs
} = require('../controllers/smsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/send', sendSms);
router.get('/logs', getSmsLogs);
router.get('/logs/export', exportSmsLogs);

module.exports = router;
