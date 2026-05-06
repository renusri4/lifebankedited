# 🩸 LifeBank — Blood Bank Management System (Node.js Backend)

A complete REST API backend for the LifeBank Blood Bank Management System built with **Node.js + Express**.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the server (production)
npm start

# 3. Start with auto-reload (development)
npm run dev
```

Server runs at: **http://localhost:5000**

---

## 🔑 Demo Credentials

| Role  | Email                  | Password     |
|-------|------------------------|--------------|
| Admin | admin@lifebank.com     | admin123     |
| User  | arjun@example.com      | password123  |
| User  | priya@example.com      | password123  |

> Admin registration also requires `adminPassword: "admin123"` in the request body.

---

## 📁 Project Structure

```
lifebank-backend/
├── server.js                    # Entry point
├── .env                         # Environment variables
├── package.json
├── models/
│   └── db.js                    # In-memory data store + seed data
├── middleware/
│   └── auth.js                  # JWT protect + adminOnly middleware
├── controllers/
│   ├── authController.js        # register, login, getMe
│   ├── donationController.js    # CRUD + status update
│   └── dashboardController.js   # Role-based stats
└── routes/
    ├── auth.js
    ├── donations.js
    └── dashboard.js
```

---

## 🌐 API Reference

All protected routes require the header:
```
Authorization: Bearer <your_jwt_token>
```

---

### 🔐 Auth Routes

#### Register
```
POST /api/auth/register
```
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "yourpassword",
  "role": "user"
}
```
For admin registration, also include:
```json
{ "adminPassword": "admin123" }
```

**Response:**
```json
{
  "success": true,
  "token": "eyJ...",
  "user": { "id": "...", "name": "John Doe", "role": "user" }
}
```

---

#### Login
```
POST /api/auth/login
```
**Body:**
```json
{
  "email": "john@example.com",
  "password": "yourpassword"
}
```

---

#### Get Current User
```
GET /api/auth/me          🔒 Protected
```

---

### 🩸 Donation Routes

#### Get Donations
```
GET /api/donations        🔒 Protected
```
- **Users** see only their own donations
- **Admins** see all donations

**Query Params:**
| Param     | Values                          | Description         |
|-----------|---------------------------------|---------------------|
| status    | pending, approved, rejected     | Filter by status    |
| bloodType | A+, A-, B+, B-, AB+, AB-, O+, O- | Filter by type    |
| page      | number (default: 1)             | Pagination          |
| limit     | number (default: 20)            | Results per page    |

---

#### Get Single Donation
```
GET /api/donations/:id    🔒 Protected
```

---

#### Register Donation (User)
```
POST /api/donations       🔒 Protected
```
**Body:**
```json
{
  "bloodType": "O+",
  "units": 1,
  "date": "2025-05-10",
  "contact": "9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Donation registered successfully. Awaiting admin approval.",
  "donation": { "id": "...", "status": "pending", ... }
}
```

---

#### Update Donation Status (Admin Only)
```
PATCH /api/donations/:id/status    🔒 Admin Only
```
**Body:**
```json
{
  "status": "approved",
  "adminNote": "Verified and approved."
}
```
> `status` must be `"approved"` or `"rejected"`

---

#### Delete Donation
```
DELETE /api/donations/:id    🔒 Protected
```
- Users can only delete their own **pending** donations
- Admins can delete any donation

---

### 📊 Dashboard Routes

#### Get Dashboard Stats
```
GET /api/dashboard        🔒 Protected
```

**User Response:**
```json
{
  "role": "user",
  "stats": {
    "total": 3,
    "approved": 1,
    "pending": 1,
    "rejected": 1,
    "totalUnits": 1
  },
  "recentDonations": [...]
}
```

**Admin Response:**
```json
{
  "role": "admin",
  "stats": {
    "total": 5,
    "approved": 2,
    "pending": 2,
    "rejected": 1,
    "totalUnits": 3,
    "totalDonors": 2
  },
  "inventory": [
    { "bloodType": "A+", "units": 0 },
    { "bloodType": "O+", "units": 1 },
    ...
  ],
  "recentPending": [...]
}
```

---

### ❤️ Health Check
```
GET /api/health
```

---

## ⚙️ Environment Variables (.env)

| Variable        | Default                          | Description              |
|-----------------|----------------------------------|--------------------------|
| PORT            | 5000                             | Server port              |
| JWT_SECRET      | lifebank_super_secret_key_2024   | JWT signing secret       |
| JWT_EXPIRES_IN  | 7d                               | Token expiry             |
| ADMIN_PASSWORD  | admin123                         | Required for admin signup|

---

## 🔄 Connecting the Frontend

In your `lifebank.html`, replace the mock data and state with real API calls:

```javascript
const API = 'http://localhost:5000/api';

// Login
const res = await fetch(`${API}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { token, user } = await res.json();
localStorage.setItem('token', token);

// Get dashboard
const dash = await fetch(`${API}/dashboard`, {
  headers: { Authorization: `Bearer ${token}` }
});

// Register donation
await fetch(`${API}/donations`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({ bloodType, units, date, contact })
});

// Admin: approve donation
await fetch(`${API}/donations/${id}/status`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({ status: 'approved', adminNote: '' })
});
```

---

## 🗄️ Upgrading to a Real Database

The in-memory store (`models/db.js`) can be swapped for MongoDB or MySQL:

**MongoDB with Mongoose:**
```bash
npm install mongoose
```
Replace `models/db.js` with Mongoose schemas for `User` and `Donation`.

**MySQL with Sequelize:**
```bash
npm install sequelize mysql2
```
Replace `models/db.js` with Sequelize models.

---

## 📦 Dependencies

| Package     | Purpose                    |
|-------------|----------------------------|
| express     | Web framework              |
| bcryptjs    | Password hashing           |
| jsonwebtoken| JWT auth tokens            |
| cors        | Cross-origin requests      |
| dotenv      | Environment variables      |
| uuid        | Unique ID generation       |
| nodemon     | Auto-reload in development |
