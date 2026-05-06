// ==========================================================
//  controllers/donationController.js
// ==========================================================
const { v4: uuidv4 } = require('uuid');
const { donations, users } = require('../models/db');

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// ── GET /api/donations ─────────────────────────────────────
// User: returns only their own donations
// Admin: returns all donations (with optional ?status= filter)
exports.getDonations = (req, res) => {
  try {
    const { status, bloodType, page = 1, limit = 20 } = req.query;

    let result = [...donations];

    // Non-admin users can only see their own donations
    if (req.user.role !== 'admin') {
      result = result.filter((d) => d.userId === req.user.id);
    }

    // Optional filters
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      result = result.filter((d) => d.status === status);
    }
    if (bloodType && BLOOD_TYPES.includes(bloodType)) {
      result = result.filter((d) => d.bloodType === bloodType);
    }

    // Sort: newest first
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const total = result.length;
    const skip = (Number(page) - 1) * Number(limit);
    const paginated = result.slice(skip, skip + Number(limit));

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      donations: paginated,
    });
  } catch (err) {
    console.error('getDonations error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── GET /api/donations/:id ─────────────────────────────────
exports.getDonationById = (req, res) => {
  try {
    const donation = donations.find((d) => d.id === req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found.' });
    }

    // Users can only view their own donations
    if (req.user.role !== 'admin' && donation.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    return res.status(200).json({ success: true, donation });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── POST /api/donations ────────────────────────────────────
exports.createDonation = (req, res) => {
  try {
    const { bloodType, units, date, contact } = req.body;

    // Validation
    if (!bloodType || !units || !date || !contact) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    if (!BLOOD_TYPES.includes(bloodType)) {
      return res.status(400).json({ success: false, message: 'Invalid blood type.' });
    }
    if (![1, 2, 3].includes(Number(units))) {
      return res.status(400).json({ success: false, message: 'Units must be 1, 2 or 3.' });
    }
    if (!/^\d{10}$/.test(contact)) {
      return res.status(400).json({ success: false, message: 'Contact must be a 10-digit number.' });
    }

    const newDonation = {
      id: uuidv4(),
      userId: req.user.id,
      donorName: req.user.name,
      bloodType,
      units: Number(units),
      date,
      contact,
      status: 'pending',
      adminNote: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    donations.push(newDonation);

    return res.status(201).json({
      success: true,
      message: 'Donation registered successfully. Awaiting admin approval.',
      donation: newDonation,
    });
  } catch (err) {
    console.error('createDonation error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── PATCH /api/donations/:id/status ───────────────────────
// Admin only: approve or reject a donation request
exports.updateDonationStatus = (req, res) => {
  try {
    const { status, adminNote } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected.' });
    }

    const index = donations.findIndex((d) => d.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Donation not found.' });
    }

    if (donations[index].status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot update a donation that is already ${donations[index].status}.`,
      });
    }

    donations[index].status = status;
    donations[index].adminNote = adminNote || '';
    donations[index].updatedAt = new Date().toISOString();

    return res.status(200).json({
      success: true,
      message: `Donation ${status} successfully.`,
      donation: donations[index],
    });
  } catch (err) {
    console.error('updateDonationStatus error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── DELETE /api/donations/:id ──────────────────────────────
// User can delete their own pending donation
exports.deleteDonation = (req, res) => {
  try {
    const index = donations.findIndex((d) => d.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Donation not found.' });
    }

    const donation = donations[index];

    // Permission check
    if (req.user.role !== 'admin' && donation.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Only pending donations can be deleted by users
    if (req.user.role !== 'admin' && donation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending donations can be deleted.',
      });
    }

    donations.splice(index, 1);
    return res.status(200).json({ success: true, message: 'Donation deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};
