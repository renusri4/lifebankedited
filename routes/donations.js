// ==========================================================
//  routes/donations.js
// ==========================================================
const express = require('express');
const router = express.Router();
const {
  getDonations,
  getDonationById,
  createDonation,
  updateDonationStatus,
  deleteDonation,
} = require('../controllers/donationController');
const { protect, adminOnly } = require('../middleware/auth');

// All donation routes require authentication
router.use(protect);

// GET  /api/donations        — user sees own; admin sees all
router.get('/', getDonations);

// GET  /api/donations/:id    — single donation detail
router.get('/:id', getDonationById);

// POST /api/donations        — user registers a new donation
router.post('/', createDonation);

// PATCH /api/donations/:id/status — ADMIN: approve or reject
router.patch('/:id/status', adminOnly, updateDonationStatus);

// DELETE /api/donations/:id  — delete a pending donation
router.delete('/:id', deleteDonation);

module.exports = router;
