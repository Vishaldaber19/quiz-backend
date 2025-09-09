const mongoose = require('mongoose');
const Quiz = require('./models/Quiz');
require('dotenv').config();

const seedQuiz = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Quiz.deleteMany({});
    console.log('Cleared existing quizzes');

    const sampleQuiz = new Quiz({
      question: 'What is your favorite programming language?',
      options: [
        { text: 'JavaScript', votes: 0 },
        { text: 'Python', votes: 0 },
        { text: 'Java', votes: 0 },
        { text: 'TypeScript', votes: 0 }
      ],
      isActive: true
    });

    await sampleQuiz.save();
    console.log('Sample quiz created:', sampleQuiz.question);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding quiz:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedQuiz();
}