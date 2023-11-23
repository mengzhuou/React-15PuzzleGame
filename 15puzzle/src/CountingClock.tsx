import React, { useState, useEffect } from 'react';

interface CountingClockProps {
  gameOver: boolean;
  onTimerUpdate: (timerValue: number) => void;
  paused: boolean;
}

const CountingClock: React.FC<CountingClockProps> = ({ gameOver, onTimerUpdate, paused  }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (!gameOver && !paused) {
      intervalId = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds + 1);
      }, 1000); 
    }

    return () => clearInterval(intervalId);
  }, [gameOver, paused]);

  useEffect(() => {
    onTimerUpdate(seconds);
  }, [onTimerUpdate, seconds]);

  return (
    <div>
      Time: {seconds} s
    </div>
  );
};

export default CountingClock;
