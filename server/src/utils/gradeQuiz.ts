import { QuizQuestion } from '../types';

export function gradeQuiz(questions: QuizQuestion[], answers: unknown, passingScore: number) {
  if (!Array.isArray(answers) || answers.length !== questions.length || questions.length === 0) {
    throw new Error('one answer is required for each quiz question');
  }
  let score = 0;
  let totalPoints = 0;
  questions.forEach((question, index) => {
    const answer = answers[index];
    if (!Number.isInteger(answer) || answer < -1 || answer >= question.options.length) {
      throw new Error('invalid answer index');
    }
    if (!Number.isFinite(question.points) || question.points < 0) throw new Error('invalid quiz points');
    totalPoints += question.points;
    if (answer === question.correctAnswerIndex) score += question.points;
  });
  if (totalPoints <= 0) throw new Error('quiz must contain scored questions');
  const percentage = Math.round(score / totalPoints * 100);
  return { score, totalPoints, percentage, passed: score / totalPoints * 100 >= passingScore };
}
