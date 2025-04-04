import { useEffect, useRef, useState } from "react";

interface StopwatchProps {
  isGestureActive: boolean;
  gestureName: string;
}

export default function Stopwatch({ isGestureActive, gestureName }: StopwatchProps) {
  // Stopwatch states
  const [isStopwatchRunning, setIsStopwatchRunning] = useState<boolean>(false);
  const [stopwatchTime, setStopwatchTime] = useState<number>(0);
  const stopwatchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Countdown states
  const [isCountdownActive, setIsCountdownActive] = useState<boolean>(false);
  const [countdownValue, setCountdownValue] = useState<number>(3);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle stopwatch logic based on gesture
  useEffect(() => {
    // Start countdown when isGestureActive becomes true
    if (isGestureActive && !isStopwatchRunning && !isCountdownActive) {
      startCountdown();
    } 
    // Stop stopwatch when isGestureActive becomes false
    else if (!isGestureActive && isStopwatchRunning) {
      stopStopwatch();
    }
  }, [isGestureActive, isStopwatchRunning, isCountdownActive]);

  // Clean up intervals on component unmount
  useEffect(() => {
    return () => {
      if (stopwatchIntervalRef.current) {
        clearInterval(stopwatchIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  // Countdown functions
  const startCountdown = () => {
    setIsCountdownActive(true);
    setCountdownValue(3);
    
    countdownIntervalRef.current = setInterval(() => {
      setCountdownValue((prevValue) => {
        if (prevValue <= 1) {
          clearInterval(countdownIntervalRef.current!);
          setIsCountdownActive(false);
          startStopwatch();
          return 0;
        }
        return prevValue - 1;
      });
    }, 1000);
  };

  // Stopwatch functions
  const startStopwatch = () => {
    if (isStopwatchRunning) return;
    
    setIsStopwatchRunning(true);
    const startTime = Date.now() - stopwatchTime;
    
    stopwatchIntervalRef.current = setInterval(() => {
      setStopwatchTime(Date.now() - startTime);
    }, 10);
  };

  const stopStopwatch = () => {
    if (stopwatchIntervalRef.current) {
      clearInterval(stopwatchIntervalRef.current);
      stopwatchIntervalRef.current = null;
    }
    setIsStopwatchRunning(false);
  };

  const resetStopwatch = () => {
    stopStopwatch();
    setStopwatchTime(0);
  };

  // Format the stopwatch time
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = Math.floor((time % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-6 py-3 rounded-lg flex flex-col items-center">
      {isCountdownActive ? (
        <div className="text-6xl font-bold mb-2 animate-pulse">{countdownValue}</div>
      ) : (
        <div className="text-2xl font-mono mb-2">{formatTime(stopwatchTime)}</div>
      )}
      <div className="flex gap-2">
        {!isStopwatchRunning && !isCountdownActive ? (
          <button 
            onClick={startCountdown}
            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
          >
            Start
          </button>
        ) : (
          <button 
            onClick={stopStopwatch}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
          >
            Stop
          </button>
        )}
        <button 
          onClick={resetStopwatch}
          className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
        >
          Reset
        </button>
      </div>
      <div className="text-xs mt-2 opacity-75">
        {isStopwatchRunning ? "Running" : isCountdownActive ? "Countdown..." : "Stopped"} • Show "Pointing_Up" gesture to start
      </div>
    </div>
  );
} 