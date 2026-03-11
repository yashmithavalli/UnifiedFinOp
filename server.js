/**
 * Unified FinOps Platform — Express Server
 * ==========================================
 * Node.js + MongoDB backend with authentication
 * and data ingestion APIs.
 */

const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { MongoClient, ObjectId } = require('mongodb');
const multer = require('multer');
const csv = require('csv-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'finops';

// ── Middleware ────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'website')));
app.use(session({
  secret: 'finops-platform-secret-key-2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// File uploads
const upload = multer({ dest: path.join(__dirname, 'uploads') });

// ── Database ─────────────────────────────────────────────
let db;

async function connectDB() {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('✓ Connected to MongoDB');

    // Create indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });

    // Seed default policies if empty
    const policyCount = await db.collection('policies').countDocuments();
    if (policyCount === 0) {
      await db.collection('policies').insertMany([
        { name: 'Budget Overrun Alert', desc: 'If spending exceeds 90% of budget → alert', active: true, type: 'alert', threshold: 90 },
        { name: 'Large Purchase Approval', desc: 'If amount > ₹10,00,000 → require approval', active: true, type: 'approval', threshold: 1000000 },
        { name: 'Spending Anomaly Detection', desc: 'If vendor cost increases > 30% → review', active: true, type: 'anomaly', threshold: 30 },
        { name: 'Duplicate Transaction Check', desc: 'Similar transaction in 24h → verify', active: false, type: 'duplicate', threshold: 24 },
        { name: 'Quarterly Budget Freeze', desc: '100% budget used → block transactions', active: false, type: 'freeze', threshold: 100 },
      ]);
      console.log('✓ Seeded default policies');
    }
  } catch (err) {
    console.error('✗ MongoDB connection failed:', err.message);
    console.log('  Make sure MongoDB is running: mongod');
    process.exit(1);
  }
}

// ══════════════════════════════════════════════════════════
// AUTH APIs
// ══════════════════════════════════════════════════════════

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { orgName, userName, email, password, orgType } = req.body;
    if (!orgName || !userName || !email || !password || !orgType) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check existing user
    const exists = await db.collection('users').findOne({ email });
    if (exists) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Generate username
    const suffix = orgType === 'public' ? '_govt' : '_pub';
    const username = orgName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') + suffix;

    // Hash password
    const hash = await bcrypt.hash(password, 12);

    // Create user
    const user = {
      orgName, userName, email, username,
      password: hash,
      orgType,
      role: 'admin',
      createdAt: new Date()
    };
    await db.collection('users').insertOne(user);

    res.json({ success: true, username });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Email or organization already exists' });
    }
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Set session
    req.session.userId = user._id;
    req.session.userName = user.userName;
    req.session.role = user.role;
    req.session.orgName = user.orgName;

    res.json({
      success: true,
      user: { userName: user.userName, email: user.email, role: user.role, orgName: user.orgName }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout
app.get('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Session check
app.get('/api/me', (req, res) => {
  if (req.session.userId) {
    res.json({
      loggedIn: true,
      user: { userName: req.session.userName, role: req.session.role, orgName: req.session.orgName }
    });
  } else {
    res.json({ loggedIn: false });
  }
});

// ══════════════════════════════════════════════════════════
// DATA UPLOAD API
// ══════════════════════════════════════════════════════════

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const results = [];
    const filePath = req.file.path;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Normalize column names
        const normalized = {};
        for (const [key, value] of Object.entries(row)) {
          const k = key.trim().toLowerCase();
          normalized[k] = value.trim();
        }

        // Parse amount
        if (normalized.amount) {
          normalized.amount = parseFloat(normalized.amount.replace(/[$,]/g, '')) || 0;
        }

        // Add metadata
        normalized.uploadedAt = new Date();
        normalized.source = req.file.originalname;

        results.push(normalized);
      })
      .on('end', async () => {
        if (results.length > 0) {
          await db.collection('transactions').insertMany(results);

          // Run policy checks
          const alerts = [];
          for (const txn of results) {
            if (txn.amount > 1000000) {
              alerts.push({
                type: 'warning',
                title: 'Large Purchase Detected',
                desc: `${txn.vendor || 'Unknown'} — ₹${txn.amount.toLocaleString('en-IN')} by ${txn.department || 'Unknown'}`,
                createdAt: new Date()
              });
            }
          }
          if (alerts.length > 0) {
            await db.collection('alerts').insertMany(alerts);
          }
        }

        // Clean up temp file
        fs.unlinkSync(filePath);

        res.json({
          success: true,
          records: results.length,
          alerts: results.filter(r => r.amount > 1000000).length
        });
      })
      .on('error', (err) => {
        fs.unlinkSync(filePath);
        res.status(400).json({ error: 'Failed to parse CSV: ' + err.message });
      });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ══════════════════════════════════════════════════════════
// DATA APIs
// ══════════════════════════════════════════════════════════

// Get transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await db.collection('transactions')
      .find({})
      .sort({ date: -1, uploadedAt: -1 })
      .limit(100)
      .toArray();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get policies
app.get('/api/policies', async (req, res) => {
  try {
    const policies = await db.collection('policies').find({}).toArray();
    res.json(policies);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle policy
app.patch('/api/policies/:id', async (req, res) => {
  try {
    const { active } = req.body;
    await db.collection('policies').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { active } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get alerts
app.get('/api/alerts', async (req, res) => {
  try {
    const alerts = await db.collection('alerts')
      .find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Dashboard stats
app.get('/api/stats', async (req, res) => {
  try {
    const totalTransactions = await db.collection('transactions').countDocuments();
    const pipeline = [
      { $group: { _id: null, totalSpend: { $sum: '$amount' } } }
    ];
    const spendResult = await db.collection('transactions').aggregate(pipeline).toArray();
    const totalSpend = spendResult[0]?.totalSpend || 0;

    const deptCount = (await db.collection('transactions').distinct('department')).length;
    const vendorCount = (await db.collection('transactions').distinct('vendor')).length;

    res.json({
      totalSpend,
      totalTransactions,
      departments: deptCount || 8,
      vendors: vendorCount || 5
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Start Server ─────────────────────────────────────────
async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n  ╔══════════════════════════════════════════╗`);
    console.log(`  ║  Unified FinOps Platform                 ║`);
    console.log(`  ║  Server running at http://localhost:${PORT}  ║`);
    console.log(`  ╚══════════════════════════════════════════╝\n`);
  });
}

start();
