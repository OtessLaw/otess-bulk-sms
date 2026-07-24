const express = require('express');
const router = express.Router();
const {
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/login', authLimiter, loginUser);
router.post('/forgot-password', authLimiter, forgotPassword);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
