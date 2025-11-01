import {
  useRef,
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import Player from "./player";
import Background from "./background";
import ObsController from "./obs_controller";
import obs1 from "../assets/obs1.png";
import obs2 from "../assets/obs2.png";
import obs3 from "../assets/obs3.png";
import obs4 from "../assets/obs4.png";
import obs5 from "../assets/obs5.png";
import obs6 from "../assets/obs6.png";
import { Button } from "react-bootstrap";

function ismobileDevice() {
  return /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth <= 700;
}
export const isMobile = ismobileDevice();

export interface CanvaRef {
  jump: () => void;
}

export interface GameState {
  shouldShowQuestion: boolean;
  isWaitingForAnswer: boolean;
  onQuestionAnswered: (isCorrect: boolean) => void;
  onObstacleHit?: () => boolean;
  questionTimer: number;
  isGameOver: boolean;
}

interface CanvaProps {
  gameStateRef: React.MutableRefObject<GameState | null>;
}

export const Canva = forwardRef<CanvaRef, CanvaProps>((props, ref) => {
  const GAME_WIDTH = isMobile ? 320 : 512 / 1.8;
  const GAME_HEIGHT = isMobile ? 120 : 120 / 2.4;
  const PLAYER_HEIGHT = isMobile ? 315 / 9 : 315 / 18;
  const PLAYER_WIDTH = isMobile ? 350 / 9 : 350 / 18;
  const JUMP_HEIGHT = 11;
  const GROUND_HEIGHT = isMobile ? 265 / 1.8 : 265 / 5;
  const GROUND_WIDTH = isMobile ? 1024 / 1.8 : 1024 / 4;
  const GROUND_AND_OBSTACELS_SPEED = 0.4;
  const GAME_SPEED = 0.9;

  const Obs_config = [
    { width: 4, height: 4, imageSrc: obs1 },
    { width: 5, height: 5, imageSrc: obs2 },
    { width: 5, height: 3, imageSrc: obs3 },
    { width: 5, height: 4, imageSrc: obs4 },
    { width: 4, height: 4, imageSrc: obs5 },
    { width: 3, height: 4, imageSrc: obs6 },
  ];

  const [canvasHeight, setCanvasHeight] = useState(0);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [playerInstance, setPlayerInstance] = useState<Player | null>(null);
  const [GroundInstance, setGroundInstance] = useState<Background | null>(null);
  const [ObsControllerInstance, setObsControllerInstance] =
    useState<ObsController | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [questionTimeLeft, setQuestionTimeLeft] = useState<number | null>(null);

  const prevTimeRef = useRef(0);
  const isGameOverRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeSinceLastCheck = useRef(0);
  const questionCooldown = 100; 
  const invulnerableUntilRef = useRef<number>(0);
  const flashUntilRef = useRef<number>(0);

  const setCanvasSize = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const screenHeight = container.clientHeight;
    const screenWidth = container.clientWidth;

    if (screenWidth === 0 || screenHeight === 0) {
      return; 
    }

    const scaleRatio = Math.min(
      screenWidth / GAME_WIDTH,
      screenHeight / GAME_HEIGHT
    );

    setCanvasHeight(GAME_HEIGHT * scaleRatio);
    setCanvasWidth(GAME_WIDTH * scaleRatio);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const playerWidthInGame = PLAYER_WIDTH * scaleRatio;
        const playerHeightInGame = PLAYER_HEIGHT * scaleRatio;
        const jumpHeightInGame = JUMP_HEIGHT * scaleRatio;
        const groundWidthInGame = GROUND_WIDTH * scaleRatio;
        const groundHeightInGame = GROUND_HEIGHT * scaleRatio;

        setGroundInstance(
          new Background(
            ctx,
            groundWidthInGame,
            groundHeightInGame,
            GROUND_AND_OBSTACELS_SPEED,
            scaleRatio
          )
        );
        setPlayerInstance(
          new Player(
            ctx,
            playerWidthInGame,
            playerHeightInGame,
            jumpHeightInGame,
            scaleRatio
          )
        );

        const obstacleImages = Obs_config.map((obs) => {
          const image = new Image();
          image.src = obs.imageSrc;
          return {
            image: image,
            width: obs.width * scaleRatio,
            height: obs.height * scaleRatio,
          };
        });

        const obsController = new ObsController(
          ctx,
          obstacleImages,
          scaleRatio,
          GROUND_AND_OBSTACELS_SPEED
        );
        setObsControllerInstance(obsController);
      }
    }
  }, [GAME_WIDTH, PLAYER_WIDTH, PLAYER_HEIGHT, JUMP_HEIGHT]);

  useEffect(() => {
    if (containerRef.current) setCanvasSize();
    window.addEventListener("resize", setCanvasSize);
    return () => window.removeEventListener("resize", setCanvasSize);
  }, [setCanvasSize, containerRef.current]); 

  useEffect(() => {
    if (!hasStarted) return;

    let animationFrameId: number;
    const gameLoop = (currentTime: number) => {
      if (prevTimeRef.current === 0) {
        prevTimeRef.current = currentTime;
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }

      const deltaTime = currentTime - prevTimeRef.current;
      prevTimeRef.current = currentTime;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");

      if (ctx && playerInstance && GroundInstance && ObsControllerInstance) {
        if (
          !isGameOverRef.current &&
          Date.now() > invulnerableUntilRef.current &&
          ObsControllerInstance.isCollidingWith(playerInstance)
        ) {
          const handled = props.gameStateRef.current?.onObstacleHit
            ? props.gameStateRef.current.onObstacleHit()
            : false;
          if (handled) {
            invulnerableUntilRef.current = Date.now() + 1000;
            flashUntilRef.current = Date.now() + 200;
          } else {
            isGameOverRef.current = true;
            if (props.gameStateRef.current) {
              props.gameStateRef.current.isGameOver = true;
            }
          }
        }

        if (!isGameOverRef.current && playerInstance && canvas) {
          timeSinceLastCheck.current += deltaTime;
          
          if (timeSinceLastCheck.current >= questionCooldown) {
            if (isMobile)
            var threshold = canvas.width * 0.3;
            else
            var threshold = canvas.width * 0.1; 
            
            const nearObstacle = ObsControllerInstance.isObsNearToPlayer(playerInstance, threshold);
            
            if (nearObstacle && props.gameStateRef.current) {
              if (!props.gameStateRef.current.shouldShowQuestion && 
                  !props.gameStateRef.current.isWaitingForAnswer) {
                nearObstacle.hasTriggeredQuestion = true;
                
                props.gameStateRef.current.shouldShowQuestion = true;
                props.gameStateRef.current.isWaitingForAnswer = true;
                props.gameStateRef.current.questionTimer = 15;
                
                const intervalId = setInterval(() => {
                  if (props.gameStateRef.current) {
                    props.gameStateRef.current.questionTimer -= 0.1;
                    
                    if (props.gameStateRef.current.questionTimer <= 0) {
                      isGameOverRef.current = true;
                      props.gameStateRef.current.isGameOver = true;
                      props.gameStateRef.current.isWaitingForAnswer = false;
                      clearInterval(intervalId);
                    } else if (!props.gameStateRef.current.isWaitingForAnswer) {
                      clearInterval(intervalId);
                    }
                  }
                }, 100);
              }
            }
            
            timeSinceLastCheck.current = 0;
          }
        }
        if (!isGameOverRef.current && 
            (!props.gameStateRef.current || !props.gameStateRef.current.isWaitingForAnswer)) {
          GroundInstance.update(deltaTime, GAME_SPEED);
          ObsControllerInstance.update(deltaTime, GAME_SPEED);
          playerInstance.update(deltaTime, GAME_SPEED);
        }
        
        if (!isGameOverRef.current) {
          if (canvas) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
          GroundInstance.draw();
          ObsControllerInstance.draw();
          playerInstance.draw();
          if (Date.now() < flashUntilRef.current && canvas) {
            ctx.save();
            ctx.fillStyle = "rgba(255,255,255,0.6)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
          }
        }
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => cancelAnimationFrame(animationFrameId);
  }, [playerInstance, GroundInstance, ObsControllerInstance, questionCooldown, hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    const id = setInterval(() => {
      const time = props.gameStateRef.current?.isWaitingForAnswer
        ? props.gameStateRef.current?.questionTimer
        : null;
      setQuestionTimeLeft(time ?? null);
    }, 100);
    return () => clearInterval(id);
  }, [hasStarted, props.gameStateRef]);

  const handleStart = useCallback(() => {
    isGameOverRef.current = false;
    prevTimeRef.current = 0;
    timeSinceLastCheck.current = 0;
    if (props.gameStateRef.current) {
      props.gameStateRef.current.isGameOver = false;
      props.gameStateRef.current.shouldShowQuestion = false;
      props.gameStateRef.current.isWaitingForAnswer = false;
      props.gameStateRef.current.questionTimer = 0;
    }
    setHasStarted(true);
  }, [props.gameStateRef]);

  useImperativeHandle(ref, () => ({
    jump: () => {
      if (playerInstance) {
        playerInstance.jump();
      }
    },
  }));

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "auto",
        flexGrow: 1,
      }}
    >
      {!hasStarted && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.4)",
            zIndex: 2,
            gap: 16,
            flexDirection: "column",
          }}
        >
          <Button
            variant="primary"
            onClick={handleStart}
          >
            Start Game
          </Button>
          </div>
      )}

      {/* Timer badge */}
      {hasStarted && questionTimeLeft !== null && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 3,
            background: "rgba(17,24,39,0.8)",
            color: "#F9FAFB",
            border: "1px solid rgba(255,255,255,0.15)",
            padding: "6px 10px",
            borderRadius: 9999,
            fontVariantNumeric: "tabular-nums",
            fontSize: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            backdropFilter: "blur(4px)",
          }}
        >
          {Math.max(0, Math.ceil(questionTimeLeft))}s
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
      ></canvas>
    </div>
  );
});
