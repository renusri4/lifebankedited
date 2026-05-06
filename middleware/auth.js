// ==========================================================
//  middleware/auth.js — JWT verification middleware
// ==========================================================
const jwt = require('jsonwebtoken');
const { users } = require('../models/db');

/**
 * Verifies the JWT token from the Authorization header.
 * Attaches the user object to req.user on success.
 */
function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = users.find((u) => u.id === decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    // Attach user (without password) to the request
    const { password, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

/**
 * Restricts access to admin-only routes.
 * Must be used AFTER protect middleware.
 */
function adminOnly(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Admins only.',
  });
}

module.exports = { protect, adminOnly };
