const express = require('express');
const cors = require('cors');
const pool = require('./db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123'; // Change this in production!
const JWT_SECRET = 'supersecret'; // Use env var in production

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // or higher if needed

// Helper to convert snake_case to camelCase
function toCamel(row) {
  const out = {};
  for (const key in row) {
    out[key.replace(/_([a-z])/g, g => g[1].toUpperCase())] = row[key];
  }
  return out;
}

// Add a new vehicle entry
app.post('/api/vehicle-entry', async (req, res) => {
  const {
    numberPlate,
    driverName,
    passengerCount,
    reason,
    frontImage,
    backImage,
    timestamp
  } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO vehicle_entries
        (number_plate, driver_name, passenger_count, reason, front_image, back_image, timestamp, exited, exit_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false, NULL)
       RETURNING *`,
      [numberPlate, driverName, passengerCount, reason, frontImage, backImage, timestamp]
    );
    res.json({ success: true, entry: toCamel(result.rows[0]) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Mark a car as exited by numberPlate
app.patch('/api/vehicle-exit', async (req, res) => {
  const { numberPlate } = req.body;
  try {
    const result = await pool.query(
      `UPDATE vehicle_entries
       SET exited = true, exit_time = NOW()
       WHERE number_plate = $1 AND exited = false
       RETURNING *`,
      [numberPlate]
    );
    if (result.rows.length > 0) {
      res.json({ success: true, entry: toCamel(result.rows[0]) });
    } else {
      res.status(404).json({ success: false, message: 'Entry not found or already exited.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Get all entries, or only parked cars (not exited) by default
app.get('/api/vehicle-entries', async (req, res) => {
  const showAll = req.query.all === '1';
  try {
    const result = await pool.query(
      showAll
        ? 'SELECT * FROM vehicle_entries ORDER BY id DESC'
        : 'SELECT * FROM vehicle_entries WHERE exited = false ORDER BY id DESC'
    );
    res.json(result.rows.map(toCamel));
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

app.get('/api/vehicle-count', async (req, res) => {
  const { start, end } = req.query;
  try {
    let result;
    if (start && end) {
      result = await pool.query(
        'SELECT COUNT(*) FROM vehicle_entries WHERE timestamp BETWEEN $1 AND $2',
        [start, end]
      );
    } else if (start) {
      result = await pool.query(
        'SELECT COUNT(*) FROM vehicle_entries WHERE DATE(timestamp) = $1',
        [start]
      );
    } else {
      result = await pool.query('SELECT COUNT(*) FROM vehicle_entries');
    }
    res.json({ count: parseInt(result.rows[0].count, 10) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

app.post('/api/admin-login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// User registration
app.post('/api/register', async (req, res) => {
  const { companyName, subdomain, username, password, role } = req.body;
  try {
    // 1. Create company if not exists
    let company = await pool.query('SELECT * FROM companies WHERE subdomain = $1', [subdomain]);
    let companyId;
    if (company.rows.length === 0) {
      const newCompany = await pool.query(
        'INSERT INTO companies (name, subdomain) VALUES ($1, $2) RETURNING *',
        [companyName, subdomain]
      );
      companyId = newCompany.rows[0].id;
    } else {
      companyId = company.rows[0].id;
    }
    // 2. Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    // 3. Create user
    const user = await pool.query(
      'INSERT INTO users (company_id, username, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [companyId, username, passwordHash, role || 'user']
    );
    res.json({ success: true, user: user.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      res.status(400).json({ success: false, message: 'Username or subdomain already exists' });
    } else {
      res.status(500).json({ success: false, message: 'Registration error', error: err.message });
    }
  }
});

// User login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const userRes = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const user = userRes.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    // Get company info
    const companyRes = await pool.query('SELECT * FROM companies WHERE id = $1', [user.company_id]);
    const company = companyRes.rows[0];
    // Create JWT
    const token = jwt.sign({
      userId: user.id,
      companyId: user.company_id,
      role: user.role,
      companySubdomain: company.subdomain
    }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ success: true, token, user: { id: user.id, username: user.username, role: user.role, companyId: user.company_id, companySubdomain: company.subdomain } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login error', error: err.message });
  }
});

// Middleware to protect admin routes
function requireAdminAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ success: false, message: 'No token' });
  try {
    jwt.verify(auth.replace('Bearer ', ''), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the ParkAPP backend API!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 