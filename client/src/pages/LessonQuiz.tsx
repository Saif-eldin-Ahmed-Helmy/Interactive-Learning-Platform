import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Container, Button, Col } from 'react-bootstrap';
import { quizService } from '../services/quizService';
import { toast } from 'react-toastify';
import { Canva, CanvaRef, GameState } from '../components/Canva';

interface Question {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  points: number;
}

interface Quiz {
  _id: string;
  lessonId: string;
  title: string;
  passingScore: number;
  questions: Question[];
}

export const LessonQuiz: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string}>();
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId, returnTo } = location.state || {};

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [timer, setTimer] = useState(15);
  const canvaRef = useRef<CanvaRef>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answerStatus, setAnswerStatus] = useState<"correct" | "wrong" | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [lives, setLives] = useState(3);
  const gameStateRef = useRef<GameState | null>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);

  useEffect(() => {
    if (lessonId) {
      fetchQuiz();
    }
  }, [lessonId]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const data = await quizService.getQuizByLessonId(lessonId!);
      setQuiz(data);
      // Initialize answers array with -1 (unanswered)
      setUserAnswers(new Array(data.questions.length).fill(-1));
    } catch (error: any) {
      console.error('Failed to load quiz:', error);
      toast.error(error.response?.data?.error || 'Failed to load quiz');
      setTimeout(() => {
        navigate(returnTo || `/learn/${courseId}`);
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    gameStateRef.current = {
      shouldShowQuestion: false,
      isWaitingForAnswer: false,
      onQuestionAnswered: (_isCorrect: boolean) => {},
      onObstacleHit: () => {
        let continued = false;
        setLives((prev) => {
          const next = prev - 1;
          continued = next > 0 || next === 0;
          if (!continued) {
            if (gameStateRef.current) {
              gameStateRef.current.isGameOver = true;
            }
            handleGameOver();
          }
          return next;
        });
        return continued;
      },
      questionTimer: 15,
      isGameOver: false,
    };
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (gameStateRef.current) {
        setTimer(Math.max(0, Math.ceil(gameStateRef.current.questionTimer)));
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const checkGameOver = setInterval(() => {
      if (gameStateRef.current?.isGameOver && !showScore) {
        handleGameOver();
        clearInterval(checkGameOver);
      }
    }, 100);

    return () => clearInterval(checkGameOver);
  }, [showScore]);

  useEffect(() => {
    if (quiz && currentQuestionIndex >= quiz.questions.length && !showScore) {
      if (gameStateRef.current) {
        gameStateRef.current.isGameOver = true;
      }
      handleGameOver();
    }
  }, [currentQuestionIndex, quiz, showScore]);

  const handleGameOver = async () => {
    if (submittingQuiz || !quiz || showScore) return;
    
    setShowScore(true);
    setSubmittingQuiz(true);

    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = Math.round((score / totalPoints) * 100);
    const passed = percentage >= quiz.passingScore;

    console.log('=== Quiz Submission Debug ===');
    console.log('Frontend Score:', score);
    console.log('Total Points:', totalPoints);
    console.log('Frontend Percentage:', percentage);
    console.log('Frontend Passed:', passed);
    console.log('User Answers Being Sent:', userAnswers);
    console.log('Quiz Questions:', quiz.questions.map((q, i) => ({
      question: i + 1,
      correctAnswer: q.correctAnswerIndex,
      userAnswer: userAnswers[i]
    })));

    try {
      // Send the actual answers collected during the game
      const result = await quizService.submitQuizAttempt(
        quiz._id,
        userAnswers,
        lessonId!,
        courseId
      );

      console.log('Backend Response:', result);

      if (passed) {
        toast.success(`🎉 Quiz Passed! Score: ${percentage}%`);
        
        setTimeout(() => {
          navigate(returnTo || `/learn/${courseId}`, {
            state: { quizPassed: true, lessonId }
          });
        }, 2000);
      } else {
        toast.error(`Quiz Failed. Score: ${percentage}%. Passing: ${quiz.passingScore}%`);
      }
    } catch (error: any) {
      console.error('Failed to submit quiz:', error);
      toast.error('Failed to save quiz results');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleAnswerOptionClick = (selectedIndex: number) => {
    if (!quiz || showScore || lives <= 0 || selectedOption !== null) return;

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const selectedAnswer = currentQuestion.options[selectedIndex];
    const isCorrect = selectedIndex === currentQuestion.correctAnswerIndex;

    console.log(`Q${currentQuestionIndex + 1}: Selected=${selectedIndex}, Correct=${currentQuestion.correctAnswerIndex}, IsCorrect=${isCorrect}`);

    // Track the user's answer
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = selectedIndex;
    setUserAnswers(newAnswers);

    setSelectedOption(selectedAnswer);
    setAnswerStatus(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      setScore(score + currentQuestion.points);
      canvaRef.current?.jump();

      if (gameStateRef.current) {
        gameStateRef.current.isWaitingForAnswer = false;
        gameStateRef.current.shouldShowQuestion = false;
      }

      setTimeout(() => {
        const nextQuestionIndex = currentQuestionIndex + 1;
        setSelectedOption(null);
        setAnswerStatus(null);
        if (nextQuestionIndex < quiz.questions.length) {
          setCurrentQuestionIndex(nextQuestionIndex);
        } else {
          if (gameStateRef.current) {
            gameStateRef.current.isGameOver = true;
          }
          handleGameOver();
        }
      }, 700);
    } else {
      if (gameStateRef.current) {
        gameStateRef.current.isWaitingForAnswer = false;
        gameStateRef.current.shouldShowQuestion = false;
      }
      setTimeout(() => {
        if (showScore || (gameStateRef.current && gameStateRef.current.isGameOver)) {
          return;
        }
        const nextQuestionIndex = currentQuestionIndex + 1;
        setSelectedOption(null);
        setAnswerStatus(null);
        if (nextQuestionIndex < quiz.questions.length) {
          setCurrentQuestionIndex(nextQuestionIndex);
        } else {
          handleGameOver();
        }
      }, 700);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
    setAnswerStatus(null);
    setShowScore(false);
    setTimer(15);
    setLives(3);
    setSubmittingQuiz(false);
    if (quiz) {
      setUserAnswers(new Array(quiz.questions.length).fill(-1));
    }
    if (gameStateRef.current) {
      gameStateRef.current.isGameOver = false;
      gameStateRef.current.shouldShowQuestion = false;
      gameStateRef.current.isWaitingForAnswer = false;
      gameStateRef.current.questionTimer = 15;
    }
    setGameKey((k) => k + 1);
  };

  const handleQuit = () => {
    navigate(returnTo || `/learn/${courseId}`);
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading quiz...</p>
      </Container>
    );
  }

  if (!quiz) {
    return (
      <Container className="mt-5 text-center">
        <h3>Quiz not found</h3>
        <Button variant="primary" onClick={handleQuit}>
          Go Back
        </Button>
      </Container>
    );
  }

  const shouldShowQuestion =
    (gameStateRef.current?.shouldShowQuestion || selectedOption !== null) &&
    currentQuestionIndex < quiz.questions.length;

  const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
  const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
  const passed = percentage >= quiz.passingScore;

  return (
    <>
      <Container
        fluid
        className="d-flex flex-column mt-3"
        style={{
          height: "calc(55vh - 56px)",
          width: "100%",
          position: "relative",
        }}
      >
        {/* Lives Display */}
        <div
          style={{
            position: "absolute",
            zIndex: 60,
            display: "flex",
            margin: "5px",
            gap: 6,
            alignItems: "flex-start",
            justifyContent: "flex-start",
            userSelect: "none",
          }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                fontSize: 22,
                filter: i < lives ? "none" : "grayscale(100%) opacity(0.4)",
              }}
              aria-hidden
            >
              ❤
            </span>
          ))}
        </div>

        {/* Game Canvas */}
        <Canva key={gameKey} ref={canvaRef} gameStateRef={gameStateRef} />

        {/* Game Over Screen */}
        {showScore ? (
          <div
            className="d-flex flex-column align-items-center justify-content-center"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.8)",
              zIndex: 50,
              textAlign: "center",
              color: "#fff",
              padding: 16,
            }}
          >
            <div style={{ fontSize: 80, marginBottom: 16 }}>
              {passed ? '🎉' : '📚'}
            </div>
            <h2 style={{ fontWeight: 800, marginBottom: 8 }}>
              {passed ? 'Quiz Passed!' : 'Quiz Failed'}
            </h2>
            <h4 style={{ marginBottom: 8 }}>
              Score: {score} / {totalPoints} ({percentage}%)
            </h4>
            <p style={{ marginBottom: 24, opacity: 0.8 }}>
              {passed 
                ? 'Great job! Returning to lesson...' 
                : `You need ${quiz.passingScore}% to pass`}
            </p>
            <div className="d-flex gap-3">
              {!passed && (
                <Button variant="primary" onClick={handleRestart}>
                  Try Again
                </Button>
              )}
              <Button variant="outline-light" onClick={handleQuit}>
                {passed ? 'Continue' : 'Quit'}
              </Button>
            </div>
          </div>
        ) : shouldShowQuestion ? (
          <Container className="mt-5">
            <div className="text-center mb-3">
              <div style={{ opacity: 0.7, fontSize: 14, marginBottom: 6 }}>
                Time: {timer}s
              </div>
              <h3>{quiz.questions[currentQuestionIndex].question}</h3>
            </div>
            <div className="row justify-content-center">
              {quiz.questions[currentQuestionIndex].options.map((option, idx) => {
                const isChosen = selectedOption === option;
                const variant = isChosen
                  ? answerStatus === "correct"
                    ? "success"
                    : "danger"
                  : "light";
                return (
                  <Col key={option} md={5} className="mb-3">
                    <Button
                      className="w-100"
                      variant={variant}
                      onClick={() => handleAnswerOptionClick(idx)}
                      disabled={selectedOption !== null}
                      style={{
                        border:
                          variant === "light"
                            ? "1px solid lightgray"
                            : undefined,
                        backgroundColor:
                          isChosen && answerStatus === "correct"
                            ? "#198754"
                            : isChosen && answerStatus === "wrong"
                            ? "#dc3545"
                            : undefined,
                        color: isChosen && answerStatus ? "#fff" : undefined,
                      }}
                    >
                      {option}
                    </Button>
                  </Col>
                );
              })}
            </div>
          </Container>
        ) : null}
      </Container>
    </>
  );
};
