const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const memoryRoutes = require('./routes/memoryRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/memories', memoryRoutes);

const PORT = process.env.PORT || 5000;

// 1. Express server ko sabse pehle listen karayein 0.0.0.0 host binding ke sath
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// 2. Connect MongoDB separately
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch(err => console.error('MongoDB connection failed:', err.message));
} else {
  console.error('MONGO_URI is missing in Environment Variables!');
}