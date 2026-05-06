// ==========================================================
//  controllers/authController.js
// ==========================================================
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { users } = require('../models/db');

/**
 * Generate a signed JWT for a given user id and role.
 */
function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
}

// ── POST /api/auth/register ────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }

    if (role === 'admin') {
      // Admin registration requires the admin password
      const { adminPassword } = req.body;
      if (adminPassword !== process.env.ADMIN_PASSWORD) {
        return res.status(403).json({ success: false, message: 'Invalid admin password.' });
      }
    }

    // Check duplicate email
    const existing = users.find((u) => u.email === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email is already registered.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      id: uuidv4(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    const token = signToken(newUser);
    const { password: _, ...safeUser } = newUser;

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

// ── POST /api/auth/login ───────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = users.find((u) => u.email === email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = signToken(user);
    const { password: _, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// ── GET /api/auth/me ───────────────────────────────────────
exports.getMe = (req, res) => {
  return res.status(200).json({ success: true, user: req.user });
};
