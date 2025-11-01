import { Container, Row, Col, Button } from "react-bootstrap";
import { Canva, CanvaRef, GameState } from "../components/Canva";
import { useState, useRef, useEffect } from "react";

export const QuizPage = () => {
  const questions = [
    {
      question: "What is 2 + 2?",
      options: ["3", "4", "5", "6"],
      answer: "4",
    },
    {
      question: "What is the capital of France?",
      options: ["Paris", "London", "Berlin", "Madrid"],
      answer: "Paris",
    },
    {
      question: "What is the largest planet in our solar system?",
      options: ["Earth", "Mars", "Jupiter", "Saturn"],
      answer: "Jupiter",
    },
    {
      question: "Who is the best teamate?",
      options: ["saif", "maaly", "nora", "Marco"],
      answer: "Marco",
    },
  ];
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [timer, setTimer] = useState(15);
  const canvaRef = useRef<CanvaRef>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answerStatus, setAnswerStatus] = useState<"correct" | "wrong" | null>(
    null
  );
  const [gameKey, setGameKey] = useState(0);
  const [lives, setLives] = useState(3);

  const gameStateRef = useRef<GameState | null>(null);

  useEffect(() => {
    gameStateRef.current = {
      shouldShowQuestion: false,
      isWaitingForAnswer: false,
      onQuestionAnswered: (_isCorrect: boolean) => {
      },
      onObstacleHit: () => {
        let continued = false;
        setLives((prev) => {
          const next = prev - 1;
          continued = next > 0 || next === 0;
          if (!continued) {
            if (gameStateRef.current) {
              gameStateRef.current.isGameOver = true;
            }
            setShowScore(true);
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
      if (gameStateRef.current?.isGameOver) {
        setShowScore(true);
        clearInterval(checkGameOver);
      }
    }, 100);

    return () => clearInterval(checkGameOver);
  }, []);

  useEffect(() => {
    if (currentQuestionIndex >= questions.length) {
      if (gameStateRef.current) {
        gameStateRef.current.isGameOver = true;
      }
      setShowScore(true);
    }
  }, [currentQuestionIndex, questions.length]);

  const handleAnswerOptionClick = (selected: string) => {
    if (showScore || lives <= 0) return;
    if (selectedOption !== null) return;
    setSelectedOption(selected);
    setAnswerStatus(
      selected === questions[currentQuestionIndex].answer ? "correct" : "wrong"
    );

    if (selected === questions[currentQuestionIndex].answer) {
      setScore(score + 1);
      canvaRef.current?.jump();

      if (gameStateRef.current) {
        gameStateRef.current.isWaitingForAnswer = false;
        gameStateRef.current.shouldShowQuestion = false;
      }
      setTimeout(() => {
        const nextQuestionIndex = currentQuestionIndex + 1;
        setSelectedOption(null);
        setAnswerStatus(null);
        if (nextQuestionIndex < questions.length) {
          setCurrentQuestionIndex(nextQuestionIndex);
        } else {
          if (gameStateRef.current) {
            gameStateRef.current.isGameOver = true;
          }
          setShowScore(true);
        }
      }, 700);
    } else {
      if (gameStateRef.current) {
        gameStateRef.current.isWaitingForAnswer = false;
        gameStateRef.current.shouldShowQuestion = false;
      }
      setTimeout(() => {
        if (
          showScore ||
          (gameStateRef.current && gameStateRef.current.isGameOver)
        ) {
          return;
        }
        const nextQuestionIndex = currentQuestionIndex + 1;
        setSelectedOption(null);
        setAnswerStatus(null);
        if (nextQuestionIndex < questions.length) {
          setCurrentQuestionIndex(nextQuestionIndex);
        } else {
          setShowScore(true);
        }
      }, 700);
      return;
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
    if (gameStateRef.current) {
      gameStateRef.current.isGameOver = false;
      gameStateRef.current.shouldShowQuestion = false;
      gameStateRef.current.isWaitingForAnswer = false;
      gameStateRef.current.questionTimer = 15;
    }

    setGameKey((k) => k + 1);
  };

  const shouldShowQuestion =
    (gameStateRef.current?.shouldShowQuestion || selectedOption !== null) &&
    currentQuestionIndex < questions.length;

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
        <Canva key={gameKey} ref={canvaRef} gameStateRef={gameStateRef} />
        {showScore ? (
          <div
            className="d-flex flex-column align-items-center justify-content-center"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              zIndex: 50,
              textAlign: "center",
              color: "#fff",
              padding: 16,
            }}
          >
            <h2 style={{ fontWeight: 800, marginBottom: 8 }}>Game Over</h2>
            <h4 style={{ marginBottom: 16 }}>
              Score: {score} / {questions.length}
            </h4>
            <Button variant="primary" onClick={handleRestart}>
              Restart
            </Button>
          </div>
        ) : shouldShowQuestion ? (
          <Container className="mt-5">
            <Row className="justify-content-center text-center mb-3">
              <Col md={8}>
                <div style={{ opacity: 0.7, fontSize: 14, marginBottom: 6 }}>
                  Time: {timer}s
                </div>
                <h3>{questions[currentQuestionIndex].question}</h3>
              </Col>
            </Row>
            <Row className="justify-content-center">
              {questions[currentQuestionIndex].options.map((option) => {
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
                      onClick={() => handleAnswerOptionClick(option)}
                      disabled={selectedOption !== null}
                      style={{
                        border:
                          variant === "light"
                            ? "1px solid lightgray"
                            : undefined,
                        backgroundColor:
                          isChosen && answerStatus === "correct"
                            ? "#198754" // Bootstrap success
                            : isChosen && answerStatus === "wrong"
                            ? "#dc3545" // Bootstrap danger
                            : undefined,
                        color: isChosen && answerStatus ? "#fff" : undefined,
                      }}
                    >
                      {option}
                    </Button>
                  </Col>
                );
              })}
            </Row>
          </Container>
        ) : (
          <Container className="mt-5 text-center"></Container>
        )}
      </Container>
    </>
  );
};
