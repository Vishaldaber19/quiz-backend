const express = require('express');
const Quiz = require('../models/Quiz');
const Vote = require('../models/Vote');
const router = express.Router();

router.get('/current', async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ isActive: true }).sort({ createdAt: -1 });
    if (!quiz) {
      return res.status(404).json({ message: 'No active quiz found' });
    }
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/results/:quizId', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    await Quiz.updateMany({}, { isActive: false });
    
    let quizData = { isActive: true };
    
    // Check if it's old format (single question) or new format (multiple questions)
    if (req.body.question && req.body.options) {
      // Old format for backward compatibility
      quizData.question = req.body.question;
      quizData.options = req.body.options.map(option => ({
        text: option,
        votes: 0
      }));
    } else if (req.body.title && req.body.questions) {
      // New format for multiple questions
      quizData.title = req.body.title;
      quizData.questions = req.body.questions.map(q => ({
        question: q.question,
        options: q.options.map(option => ({
          text: option,
          votes: 0
        }))
      }));
    } else {
      return res.status(400).json({ 
        message: 'Invalid request format. Expected either {question, options} or {title, questions}' 
      });
    }
    
    const quiz = new Quiz(quizData);
    const savedQuiz = await quiz.save();
    res.status(201).json(savedQuiz);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;