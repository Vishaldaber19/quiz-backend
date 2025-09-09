const express = require('express');
const Quiz = require('../models/Quiz');
const Vote = require('../models/Vote');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { quizId, userId, questionIndex, optionIndex } = req.body;
    
    // Basic validation
    if (!quizId || !userId || optionIndex === undefined) {
      return res.status(400).json({ 
        message: 'Missing required fields: quizId, userId, optionIndex' 
      });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz || !quiz.isActive) {
      return res.status(404).json({ message: 'Quiz not found or inactive' });
    }

    // Determine if this is old format or new format
    const isOldFormat = quiz.question && quiz.options && quiz.options.length > 0;
    let targetOptions;
    let actualQuestionIndex = questionIndex !== undefined ? questionIndex : 0;

    if (isOldFormat) {
      // Old format - single question
      targetOptions = quiz.options;
      actualQuestionIndex = 0;
    } else {
      // New format - multiple questions
      if (!quiz.questions || actualQuestionIndex >= quiz.questions.length) {
        return res.status(400).json({ message: 'Invalid question index' });
      }
      targetOptions = quiz.questions[actualQuestionIndex].options;
    }

    if (optionIndex >= targetOptions.length) {
      return res.status(400).json({ message: 'Invalid option index' });
    }

    const existingVote = await Vote.findOne({ 
      quizId, 
      userId, 
      questionIndex: actualQuestionIndex 
    });
    
    if (existingVote) {
      // Remove old vote count
      targetOptions[existingVote.optionIndex].votes--;
      // Update existing vote
      existingVote.optionIndex = optionIndex;
      existingVote.optionText = targetOptions[optionIndex].text;
      await existingVote.save();
    } else {
      // Create new vote
      const vote = new Vote({
        quizId,
        userId,
        questionIndex: actualQuestionIndex,
        optionIndex,
        optionText: targetOptions[optionIndex].text
      });
      await vote.save();
    }

    // Add new vote count
    targetOptions[optionIndex].votes++;
    await quiz.save();

    const io = req.app.get('io');
    
    if (isOldFormat) {
      // For old format, emit the options directly
      io.emit('voteUpdate', {
        quizId: quiz._id,
        options: quiz.options
      });
    } else {
      // For new format, emit all questions for complete update
      io.emit('voteUpdate', {
        quizId: quiz._id,
        questions: quiz.questions
      });
    }

    res.json({ 
      message: 'Vote recorded successfully',
      quiz: quiz
    });
  } catch (error) {
    console.error('Vote submission error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: `You have already voted for this question` });
    }
    res.status(500).json({ message: error.message, stack: error.stack });
  }
});

router.get('/:quizId/results', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if it's old format or new format
    const isOldFormat = quiz.question && quiz.options;
    
    if (isOldFormat) {
      // Old format response
      const totalVotes = quiz.options.reduce((sum, option) => sum + option.votes, 0);
      
      const results = {
        quizId: quiz._id,
        question: quiz.question,
        options: quiz.options,
        totalVotes
      };
      res.json(results);
    } else {
      // New format response
      const results = {
        quizId: quiz._id,
        title: quiz.title,
        questions: quiz.questions.map(q => ({
          question: q.question,
          options: q.options,
          totalVotes: q.options.reduce((sum, option) => sum + option.votes, 0)
        }))
      };
      res.json(results);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clean up route for development - removes all votes
router.delete('/cleanup', async (req, res) => {
  try {
    const result = await Vote.deleteMany({});
    res.json({ 
      message: `Deleted ${result.deletedCount} votes`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;