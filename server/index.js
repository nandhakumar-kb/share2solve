import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import connectDB from './db.js';
import Problem from './models/Problem.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

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

// ==================== PROBLEMS ENDPOINTS ====================

// GET all problems (public - read only)
app.get('/api/problems', async (req, res) => {
  try {
    const { search, status, sortBy = 'newest', limit = 1000 } = req.query;
    
    // Build query object
    const query = {};

    // Search filter (case-insensitive)
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { problem: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status && ['pending', 'resolved'].includes(status)) {
      query.status = status;
    }

    // Build sort object
    let sort = {};
    switch (sortBy) {
      case 'oldest':
        sort = { timestamp: 1 };
        break;
      case 'email':
        sort = { email: 1 };
        break;
      case 'status':
        sort = { status: 1, timestamp: -1 };
        break;
      case 'newest':
      default:
        sort = { timestamp: -1 };
    }

    const problems = await Problem.find(query)
      .sort(sort)
      .limit(parseInt(limit) || 1000)
      .lean(); // Returns plain JavaScript objects

    res.json(problems);
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

    // Create new problem document
    const newProblem = new Problem({
      email: sanitizedEmail,
      problem: sanitizedProblem,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      status: 'pending'
    });

    const savedProblem = await newProblem.save();
    res.status(201).json(savedProblem);
  } catch (error) {
    console.error('Error creating problem:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    
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

    const updatedProblem = await Problem.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedProblem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    res.json(updatedProblem);
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

    const deletedProblem = await Problem.findByIdAndDelete(id);

    if (!deletedProblem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    res.json({ message: 'Problem deleted', problem: deletedProblem });
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
