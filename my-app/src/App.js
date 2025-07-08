import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const App = () => {
  // Game constants
  const ROAD_WIDTH = 300;
  const CAR_WIDTH = 50;
  const CAR_HEIGHT = 80;
  const OBSTACLE_HEIGHT = 60;
  const GAME_SPEED = 5;

  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [carPosition, setCarPosition] = useState(ROAD_WIDTH / 2 - CAR_WIDTH / 2);
  const [obstacles, setObstacles] = useState([]);
  const [roadPosition, setRoadPosition] = useState(0);
  
  const gameAreaRef = useRef(null);
  const animationFrameId = useRef(null);
  const lastObstacleTime = useRef(0);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameStarted || gameOver) return;
      
      const moveAmount = 20;
      if (e.key === 'ArrowLeft') {
        setCarPosition(prev => Math.max(0, prev - moveAmount));
      } else if (e.key === 'ArrowRight') {
        setCarPosition(prev => Math.min(ROAD_WIDTH - CAR_WIDTH, prev + moveAmount));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, gameOver]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = (timestamp) => {
      // Move road (creates illusion of car moving forward)
      setRoadPosition(prev => (prev + GAME_SPEED) % 60);
      
      // Generate new obstacles
      if (timestamp - lastObstacleTime.current > 2000) { // Every 2 seconds
        const newObstacle = {
          id: Date.now(),
          x: Math.floor(Math.random() * (ROAD_WIDTH - CAR_WIDTH)),
          y: -OBSTACLE_HEIGHT
        };
        setObstacles(prev => [...prev, newObstacle]);
        lastObstacleTime.current = timestamp;
      }
      
      // Move obstacles
      setObstacles(prev => 
        prev.map(obstacle => ({
          ...obstacle,
          y: obstacle.y + GAME_SPEED
        })).filter(obstacle => obstacle.y < 600) // Remove obstacles that are off screen
      );
      
      // Check for collisions
      const carRect = {
        x: carPosition,
        y: 500, // Fixed vertical position for the car
        width: CAR_WIDTH,
        height: CAR_HEIGHT
      };
      
      const collision = obstacles.some(obstacle => {
        const obstacleRect = {
          x: obstacle.x,
          y: obstacle.y,
          width: CAR_WIDTH,
          height: OBSTACLE_HEIGHT
        };
        
        return (
          carRect.x < obstacleRect.x + obstacleRect.width &&
          carRect.x + carRect.width > obstacleRect.x &&
          carRect.y < obstacleRect.y + obstacleRect.height &&
          carRect.y + carRect.height > obstacleRect.y
        );
      });
      
      if (collision) {
        setGameOver(true);
        setHighScore(prev => Math.max(prev, score));
        return;
      }
      
      // Increase score
      setScore(prev => prev + 1);
      
      animationFrameId.current = requestAnimationFrame(gameLoop);
    };
    
    animationFrameId.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [gameStarted, gameOver, carPosition, obstacles]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setCarPosition(ROAD_WIDTH / 2 - CAR_WIDTH / 2);
    setObstacles([]);
    lastObstacleTime.current = 0;
  };

  return (
    <div className="app">
      <h1>React Car Game</h1>
      
      {!gameStarted ? (
        <div className="start-screen">
          <p>Use arrow keys to move left and right</p>
          <button onClick={startGame}>Start Game</button>
        </div>
      ) : gameOver ? (
        <div className="game-over-screen">
          <h2>Game Over!</h2>
          <p>Your score: {score}</p>
          <p>High score: {highScore}</p>
          <button onClick={startGame}>Play Again</button>
        </div>
      ) : (
        <div className="game-container">
          <div className="score-display">Score: {score}</div>
          <div 
            ref={gameAreaRef} 
            className="game-area"
            style={{ width: `${ROAD_WIDTH}px` }}
          >
            {/* Road with moving stripes */}
            <div 
              className="road" 
              style={{ backgroundPositionY: `${roadPosition}px` }}
            ></div>
            
            {/* Player car */}
            <div 
              className="car" 
              style={{ 
                left: `${carPosition}px`,
                width: `${CAR_WIDTH}px`,
                height: `${CAR_HEIGHT}px`
              }}
            ></div>
            
            {/* Obstacles */}
            {obstacles.map(obstacle => (
              <div 
                key={obstacle.id}
                className="obstacle"
                style={{
                  left: `${obstacle.x}px`,
                  top: `${obstacle.y}px`,
                  width: `${CAR_WIDTH}px`,
                  height: `${OBSTACLE_HEIGHT}px`
                }}
              ></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;