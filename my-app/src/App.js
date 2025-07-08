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
      setRoadPosition(prev => (prev + GAME_SPEED) % 60);
      
      if (timestamp - lastObstacleTime.current > 2000) {
        const newObstacle = {
          id: Date.now(),
          x: Math.floor(Math.random() * (ROAD_WIDTH - CAR_WIDTH)),
          y: -OBSTACLE_HEIGHT
        };
        setObstacles(prev => [...prev, newObstacle]);
        lastObstacleTime.current = timestamp;
      }
      
      setObstacles(prev => 
        prev.map(obstacle => ({
          ...obstacle,
          y: obstacle.y + GAME_SPEED
        })).filter(obstacle => obstacle.y < 600)
      );
      
      const carRect = {
        x: carPosition,
        y: 500,
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
    <div className="app container-fluid d-flex flex-column align-items-center justify-content-center vh-100 bg-light">
      <h1 className="text-center mb-4 text-primary">React Car Game</h1>
      
      {!gameStarted ? (
        <div className="start-screen card p-4 text-center">
          <h2 className="mb-3">Welcome!</h2>
          <p className="mb-4">Use arrow keys to move left and right</p>
          <button 
            onClick={startGame} 
            className="btn btn-primary btn-lg"
          >
            Start Game
          </button>
        </div>
      ) : gameOver ? (
        <div className="game-over-screen card p-4 text-center">
          <h2 className="text-danger mb-3">Game Over!</h2>
          <p className="h5">Your score: <span className="text-success">{score}</span></p>
          <p className="h5">High score: <span className="text-info">{highScore}</span></p>
          <button 
            onClick={startGame} 
            className="btn btn-success btn-lg mt-3"
          >
            Play Again
          </button>
        </div>
      ) : (
        <div className="game-container d-flex flex-column align-items-center">
          <div className="score-display h4 mb-3 p-2 bg-dark text-white rounded">
            Score: <span className="text-warning">{score}</span>
          </div>
          <div 
            ref={gameAreaRef} 
            className="game-area position-relative bg-dark border border-4 border-secondary rounded"
            style={{ width: `${ROAD_WIDTH}px`, height: '600px' }}
          >
            <div 
              className="road position-absolute w-100 h-100"
              style={{ backgroundPositionY: `${roadPosition}px` }}
            ></div>
            
            <div 
              className="car position-absolute bg-danger rounded"
              style={{ 
                left: `${carPosition}px`,
                bottom: '20px',
                width: `${CAR_WIDTH}px`,
                height: `${CAR_HEIGHT}px`
              }}
            ></div>
            
            {obstacles.map(obstacle => (
              <div 
                key={obstacle.id}
                className="obstacle position-absolute bg-primary rounded"
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