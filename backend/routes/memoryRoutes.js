const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Memory = require('../models/memory');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'my_album_memories',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
  }
});

const upload = multer({ storage });

// Get All Memories
router.get('/', protect, async (req, res) => {
  try {
    const memories = await Memory.find({ userId: req.userId }).sort({ memoryDate: -1 });
    res.json(memories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create New Memory
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { title, caption, memoryDate, location, tags, isLocked } = req.body;
    if (!req.file) return res.status(400).json({ message: 'Photo required' });

    const parsedTags = tags ? tags.split(',').map(t => t.trim().toLowerCase()) : [];

    const newMemory = await Memory.create({
      userId: req.userId,
      title,
      caption,
      imageUrl: req.file.path,
      memoryDate,
      location,
      tags: parsedTags,
      isLocked: isLocked === 'true'
    });

    res.status(201).json(newMemory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle Favorite Status
router.patch('/:id/favorite', protect, async (req, res) => {
  try {
    const memory = await Memory.findOne({ _id: req.params.id, userId: req.userId });
    if (!memory) return res.status(404).json({ message: 'Memory not found' });

    memory.isFavorite = !memory.isFavorite;
    await memory.save();
    res.json(memory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Edit Memory Details
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, caption, memoryDate, location, tags, isLocked } = req.body;
    const parsedTags = typeof tags === 'string' ? tags.split(',').map(t => t.trim().toLowerCase()) : tags;

    const memory = await Memory.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { title, caption, memoryDate, location, tags: parsedTags, isLocked },
      { new: true }
    );

    if (!memory) return res.status(404).json({ message: 'Memory not found' });
    res.json(memory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Memory
router.delete('/:id', protect, async (req, res) => {
  try {
    const memory = await Memory.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!memory) return res.status(404).json({ message: 'Memory not found' });
    res.json({ message: 'Memory deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;