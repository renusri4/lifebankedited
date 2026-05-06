// ==========================================================
//  controllers/dashboardController.js
// ==========================================================
const { donations, users } = require('../models/db');

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// ── GET /api/dashboard ─────────────────────────────────────
// Returns dashboard stats based on role
exports.getDashboard = (req, res) => {
  try {
    if (req.user.role === 'admin') {
      return adminDashboard(req, res);
    }
    return userDashboard(req, res);
  } catch (err) {
    console.error('Dashboard error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Admin: full system stats
function adminDashboard(req, res) {
  const total     = donations.length;
  const approved  = donations.filter((d) => d.status === 'approved').length;
  const pending   = donations.filter((d) => d.status === 'pending').length;
  const rejected  = donations.filter((d) => d.status === 'rejected').length;
  const totalUnits = donations
    .filter((d) => d.status === 'approved')
    .reduce((sum, d) => sum + d.units, 0);
  const totalDonors = users.filter((u) => u.role === 'user').length;

  // Blood type inventory (approved donations only)
  const inventory = BLOOD_TYPES.map((bt) => ({
    bloodType: bt,
    units: donations
      .filter((d) => d.bloodType === bt && d.status === 'approved')
      .reduce((sum, d) => sum + d.units, 0),
  }));

  // Recent pending requests (latest 5)
  const recentPending = donations
    .filter((d) => d.status === 'pending')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return res.status(200).json({
    success: true,
    role: 'admin',
    stats: { total, approved, pending, rejected, totalUnits, totalDonors },
    inventory,
    recentPending,
  });
}

// User: personal stats only
function userDashboard(req, res) {
  const myDonations = donations.filter((d) => d.userId === req.user.id);
  const total    = myDonations.length;
  const approved = myDonations.filter((d) => d.status === 'approved').length;
  const pending  = myDonations.filter((d) => d.status === 'pending').length;
  const rejected = myDonations.filter((d) => d.status === 'rejected').length;
  const totalUnits = myDonations
    .filter((d) => d.status === 'approved')
    .reduce((sum, d) => sum + d.units, 0);

  const recent = myDonations
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return res.status(200).json({
    success: true,
    role: 'user',
    stats: { total, approved, pending, rejected, totalUnits },
    recentDonations: recent,
  });
}
