const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  votes: {
    type: Number,
    default: 0
  }
});

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [optionSchema]
});

const quizSchema = new mongoose.Schema({
  // Support for old format (single question)
  question: {
    type: String,
    required: false // Made optional to support new format
  },
  options: [optionSchema], // For backward compatibility
  
  // Support for new format (multiple questions)
  title: {
    type: String,
    required: false
  },
  questions: [questionSchema],
  
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Validation to ensure either old format or new format is used
quizSchema.pre('validate', function() {
  const isOldFormat = this.question && this.options && this.options.length > 0;
  const isNewFormat = this.title && this.questions && this.questions.length > 0;
  
  if (!isOldFormat && !isNewFormat) {
    throw new Error('Quiz must have either question+options (old format) or title+questions (new format)');
  }
  
  if (isOldFormat && isNewFormat) {
    throw new Error('Quiz cannot have both old and new format fields');
  }
});

module.exports = mongoose.model('Quiz', quizSchema);