import React, { useState, useEffect } from 'react';

const FloatingHearts = ({ isTriggered, targetScore = 15, onComplete }) => {
  const [hearts, setHearts] = useState([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (isTriggered) {
      // 1. Generate floating hearts particles
      const newHearts = Array.from({ length: 15 }).map((_, i) => ({
        id: i + Date.now(),
        left: `${Math.random() * 80 + 10}%`,
        animationDelay: `${Math.random() * 0.8}s`,
        fontSize: `${Math.random() * 14 + 14}px`,
      }));
      setHearts(newHearts);

      // 2. Animate the score from 0 to targetScore progressively
      setScore(0);
      let currentScore = 0;
      const interval = setInterval(() => {
        const step = Math.max(1, Math.floor(targetScore / 10));
        currentScore += step;
        if (currentScore >= targetScore) {
          currentScore = targetScore;
          clearInterval(interval);
        }
        setScore(currentScore);
      }, 40); // update very fast

      // 3. Clean up after the whole animation (hearts + score hold)
      const timer = setTimeout(() => {
        setHearts([]);
        if (onComplete) onComplete();
      }, 2500);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [isTriggered, onComplete]);

  if (!isTriggered && hearts.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden flex items-center justify-center bg-white/20 backdrop-blur-[1px]">
      {/* Central Big Text Effect with progressive score */}
      <div
        className="absolute flex flex-col items-center animate-fade-in-up z-10"
        style={{ top: '35%', animation: 'float-up 2s ease-out forwards' }}
      >
        <div className="text-pink-500 font-black text-4xl drop-shadow-[0_0_12px_rgba(236,72,153,0.6)] flex items-center mb-1">
          好感度 +<span className="tabular-nums font-mono mx-1 min-w-[3ch]">{score}</span>%
        </div>
        <div className="text-xl animate-heartbeat">💖</div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {hearts.map(heart => (
          <span
            key={heart.id}
            className="absolute bottom-[20%] text-pink-500 opacity-0 animate-float-up drop-shadow-md"
            style={{
              left: heart.left,
              fontSize: heart.fontSize,
              animationDelay: heart.animationDelay
            }}
          >
            ❤️
          </span>
        ))}
      </div>
    </div>
  );
};

export default FloatingHearts;
