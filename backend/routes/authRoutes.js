const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Check filename casing (User.js)

const router = express.Router();

// Sirf inhi valid real emails ko register/login karne ki permission hai
const ALLOWED_EMAILS = [
  'shuklaanshika115@gmail.com',
  'anshikarameshshukla1336@gmail.com'
];

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email ? email.toLowerCase().trim() : '';

    if (!ALLOWED_EMAILS.includes(normalizedEmail)) {
      return res.status(403).json({ 
        message: 'Access Denied: Is email ko Memory Vault access karne ki permission nahi hai.' 
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists. Please sign in.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Pass username explicitly to prevent null index collision error
    await User.create({ 
      email: normalizedEmail, 
      username: normalizedEmail, 
      password: hashedPassword 
    });

    res.status(201).json({ message: 'Account created successfully! You can now sign in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email ? email.toLowerCase().trim() : '';

    if (!ALLOWED_EMAILS.includes(normalizedEmail)) {
      return res.status(403).json({ 
        message: 'Access Denied: Unauthorized email address.' 
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ message: 'Invalid email or password.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password.' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, email: user.email });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;