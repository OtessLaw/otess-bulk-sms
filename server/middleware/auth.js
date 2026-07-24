const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware: protect
 * Verifies JWT token from authorization header (Format: 'Bearer <token>')
 * Attaches authenticated user object to req.user
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from Bearer header
      token = req.headers.authorization.split(' ')[1];

      // Verify JWT signature
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'otess_data_super_secret_jwt_key_2026_change_in_production'
      );

      // Fetch user from DB excluding password field
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User account no longer exists.' });
      }

      return next();
    } catch (error) {
      console.error('[Auth Middleware Error]:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token validation failed.' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, missing JWT access token.' });
  }
};

module.exports = { protect };
