const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getChartData
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/charts', getChartData);

module.exports = router;
