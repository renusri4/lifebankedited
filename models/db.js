// ==========================================================
//  db.js — In-memory data store (replace with MongoDB/MySQL)
// ==========================================================
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// ── USERS ──────────────────────────────────────────────────
const users = [
  {
    id: uuidv4(),
    name: 'Admin User',
    email: 'admin@lifebank.com',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    createdAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Arjun Kumar',
    email: 'arjun@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'user',
    createdAt: new Date('2024-02-10').toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Priya Nair',
    email: 'priya@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'user',
    createdAt: new Date('2024-03-05').toISOString(),
  },
];

// ── DONATIONS ──────────────────────────────────────────────
const donations = [
  {
    id: uuidv4(),
    userId: users[1].id,
    donorName: 'Arjun Kumar',
    bloodType: 'O+',
    units: 1,
    date: '2025-04-10',
    contact: '9876543210',
    status: 'approved',
    adminNote: '',
    createdAt: new Date('2025-04-10').toISOString(),
    updatedAt: new Date('2025-04-11').toISOString(),
  },
  {
    id: uuidv4(),
    userId: users[2].id,
    donorName: 'Priya Nair',
    bloodType: 'A-',
    units: 2,
    date: '2025-04-15',
    contact: '9123456780',
    status: 'approved',
    adminNote: '',
    createdAt: new Date('2025-04-15').toISOString(),
    updatedAt: new Date('2025-04-16').toISOString(),
  },
  {
    id: uuidv4(),
    userId: users[1].id,
    donorName: 'Arjun Kumar',
    bloodType: 'B+',
    units: 1,
    date: '2025-04-20',
    contact: '9876543210',
    status: 'pending',
    adminNote: '',
    createdAt: new Date('2025-04-20').toISOString(),
    updatedAt: new Date('2025-04-20').toISOString(),
  },
  {
    id: uuidv4(),
    userId: users[2].id,
    donorName: 'Priya Nair',
    bloodType: 'AB+',
    units: 1,
    date: '2025-04-28',
    contact: '9123456780',
    status: 'pending',
    adminNote: '',
    createdAt: new Date('2025-04-28').toISOString(),
    updatedAt: new Date('2025-04-28').toISOString(),
  },
  {
    id: uuidv4(),
    userId: users[1].id,
    donorName: 'Arjun Kumar',
    bloodType: 'O-',
    units: 2,
    date: '2025-05-01',
    contact: '9876543210',
    status: 'rejected',
    adminNote: 'Donor did not meet eligibility criteria.',
    createdAt: new Date('2025-05-01').toISOString(),
    updatedAt: new Date('2025-05-02').toISOString(),
  },
];

module.exports = { users, donations };
