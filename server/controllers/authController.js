const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Settings = require('../models/Settings');

/**
 * Generate JWT token signed with user ID
 */
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'otess_data_super_secret_jwt_key_2026_change_in_production',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

/**
 * @desc    Login Admin User
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    // Check if user exists in database (select password explicitly)
    let user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    // Default auto-seed admin if database is completely empty on first launch
    const totalUsers = await User.countDocuments();
    if (totalUsers === 0 && email.toLowerCase() === 'admin@otessdata.com') {
      user = await User.create({
        name: 'OTESS DATA Admin',
        email: 'admin@otessdata.com',
        password: password.length >= 6 ? password : 'adminpassword123',
        companyName: 'OTESS DATA'
      });
      // Re-fetch with password selected
      user = await User.findOne({ email: 'admin@otessdata.com' }).select('+password');
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    // Verify password match
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        companyName: user.companyName,
        logoUrl: user.logoUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Current User Profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Profile & Company Info
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, companyName, logoUrl } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (name) user.name = name;
    if (companyName) user.companyName = companyName;
    if (logoUrl !== undefined) user.logoUrl = logoUrl;

    await user.save();

    // Also sync Settings document company name if updated
    if (companyName) {
      await Settings.findOneAndUpdate({}, { companyName }, { upsert: true });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change Password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot Password Token Request
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No user registered with that email.' });
    }

    // Generate random reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes expiry

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset token generated.',
      resetToken: resetToken // In production, this token would be sent via email
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword
};
