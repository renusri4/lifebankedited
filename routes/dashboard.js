// ==========================================================
//  routes/dashboard.js
// ==========================================================
const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

// GET /api/dashboard — role-based stats
router.get('/', protect, getDashboard);

module.exports = router;
