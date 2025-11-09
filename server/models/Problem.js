import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format']
  },
  problem: {
    type: String,
    required: [true, 'Problem description is required'],
    trim: true,
    minlength: [10, 'Problem description must be at least 10 characters'],
    maxlength: [5000, 'Problem description cannot exceed 5000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'resolved'],
    default: 'pending'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'problems'
});

// Indexes for better query performance
problemSchema.index({ status: 1, timestamp: -1 });
problemSchema.index({ email: 1 });
problemSchema.index({ timestamp: -1 });

const Problem = mongoose.model('Problem', problemSchema);

export default Problem;
