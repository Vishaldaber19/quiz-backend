const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  questionIndex: {
    type: Number,
    required: false, // Optional for backward compatibility
    default: 0
  },
  optionIndex: {
    type: Number,
    required: true
  },
  optionText: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Single index that handles both old and new format
// questionIndex defaults to 0 for old format, so this works for both
voteSchema.index({ quizId: 1, userId: 1, questionIndex: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);