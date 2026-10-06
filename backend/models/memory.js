const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  caption: { type: String, required: true },
  imageUrl: { type: String, required: true },
  memoryDate: { type: Date, required: true },
  location: { type: String, default: '' },
  isFavorite: { type: Boolean, default: false },
  tags: [{ type: String }],
  isLocked: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Memory', memorySchema);