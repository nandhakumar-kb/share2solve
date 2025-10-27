import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import pool from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:5174'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // stricter limit for submissions
  message: 'Too many submissions, please try again later.'
});

app.use('/api/', limiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Input validation helpers
const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, 10000); // max 10k chars
};

// Generate unique ID
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

// ==================== PROBLEMS ENDPOINTS ====================

// GET all problems (public - read only)
app.get('/api/problems', async (req, res) => {
  try {
    const { search, status, sortBy = 'newest', limit = 1000 } = req.query;
    
    let query = 'SELECT * FROM problems WHERE 1=1';
    const params = [];
    let paramCount = 1;

    // Search filter
    if (search) {
      query += ` AND (email ILIKE $${paramCount} OR problem ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    // Status filter
    if (status && ['pending', 'resolved'].includes(status)) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    // Sorting
    switch (sortBy) {
      case 'oldest':
        query += ' ORDER BY timestamp ASC';
        break;
      case 'email':
        query += ' ORDER BY email ASC';
        break;
      case 'status':
        query += ' ORDER BY status ASC, timestamp DESC';
        break;
      case 'newest':
      default:
        query += ' ORDER BY timestamp DESC';
    }

    query += ` LIMIT $${paramCount}`;
    params.push(parseInt(limit) || 1000);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching problems:', error);
    res.status(500).json({ error: 'Failed to fetch problems' });
  }
});

// POST new problem (public)
app.post('/api/problems', strictLimiter, async (req, res) => {
  try {
    const { email, problem, timestamp } = req.body;

    // Validation
    if (!email || !problem) {
      return res.status(400).json({ error: 'Email and problem are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const sanitizedEmail = sanitizeInput(email);
    const sanitizedProblem = sanitizeInput(problem);

    if (sanitizedProblem.length < 10) {
      return res.status(400).json({ error: 'Problem description too short (min 10 characters)' });
    }

    if (sanitizedProblem.length > 5000) {
      return res.status(400).json({ error: 'Problem description too long (max 5000 characters)' });
    }

    const id = generateId();
    const ts = timestamp || new Date().toISOString();

    const query = `
      INSERT INTO problems (id, email, problem, timestamp, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await pool.query(query, [id, sanitizedEmail, sanitizedProblem, ts, 'pending']);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating problem:', error);
    res.status(500).json({ error: 'Failed to create problem' });
  }
});

// PATCH problem status (admin only)
app.patch('/api/problems/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminPassword } = req.body;

    // Admin authentication
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!status || !['pending', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const query = 'UPDATE problems SET status = $1 WHERE id = $2 RETURNING *';
    const result = await pool.query(query, [status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating problem:', error);
    res.status(500).json({ error: 'Failed to update problem' });
  }
});

// DELETE problem (admin only)
app.delete('/api/problems/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminPassword } = req.body;

    // Admin authentication
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const query = 'DELETE FROM problems WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    res.json({ message: 'Problem deleted', problem: result.rows[0] });
  } catch (error) {
    console.error('Error deleting problem:', error);
    res.status(500).json({ error: 'Failed to delete problem' });
  }
});

// Admin login verification
app.post('/api/admin/login', async (req, res) => {
  try {
    const { password } = req.body;

    if (password === process.env.ADMIN_PASSWORD) {
      res.json({ success: true, message: 'Authentication successful' });
    } else {
      res.status(401).json({ success: false, error: 'Invalid password' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
