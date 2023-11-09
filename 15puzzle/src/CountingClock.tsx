import React, { useState, useEffect } from 'react';

interface CountingClockProps {
  gameOver: boolean; // Define the type for the gameOver prop
}

const CountingClock: React.FC<CountingClockProps> = ({ gameOver }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (!gameOver) {
      intervalId = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds + 1);
      }, 1000); // Increment seconds every 1 second
    }

    return () => clearInterval(intervalId);
  }, [gameOver]);

  return (
    <div className="counting-clock">
      <p>Time: {seconds} s</p>
    </div>
  );
};

export default CountingClock;
