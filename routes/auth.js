// ==========================================================
//  routes/auth.js
// ==========================================================
const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);   // POST /api/auth/register
router.post('/login',    login);      // POST /api/auth/login

// Protected routes
router.get('/me', protect, getMe);    // GET  /api/auth/me

module.exports = router;
