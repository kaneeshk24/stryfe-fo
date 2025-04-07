import { useEffect, useRef, useState } from "react";

interface StopwatchProps {
  isGestureActive: boolean;
  gestureName: string;
}

export default function Stopwatch({ isGestureActive, gestureName }: StopwatchProps) {
  // Stopwatch states
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const stopwatchIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const isRunningRef = useRef(false);

  // Countdown states
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [countdownValue, setCountdownValue] = useState(3);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Gesture control flags
  const gestureHandledRef = useRef(false);
  const startedByGestureRef = useRef(false);
  const countdownStartedByGestureRef = useRef(false);

  // Monitor gesture and control logic
  useEffect(() => {
    if (isGestureActive && gestureName === "Pointing_Up" && !isStopwatchRunning && !isCountdownActive && !gestureHandledRef.current) {
      gestureHandledRef.current = true;
      startedByGestureRef.current = true;
      countdownStartedByGestureRef.current = true;
      startCountdown();
    } else if (!isGestureActive && gestureName === "Open_Palm") {
      if (isStopwatchRunning && startedByGestureRef.current) {
        stopStopwatch();
      }
      gestureHandledRef.current = false;
    }
  }, [isGestureActive, isStopwatchRunning, isCountdownActive, gestureName]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  // Countdown logic
  const startCountdown = () => {
    if (isCountdownActive) return;

    setIsCountdownActive(true);
    setCountdownValue(3);

    countdownIntervalRef.current = setInterval(() => {
      setCountdownValue(prev => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current!);
          countdownIntervalRef.current = null;
          setIsCountdownActive(false);
          startStopwatch();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setIsCountdownActive(false);
    setCountdownValue(3);
    countdownStartedByGestureRef.current = false;
  };

  // Stopwatch logic
  const startStopwatch = () => {
    if (isRunningRef.current) return;

    setIsStopwatchRunning(true);
    isRunningRef.current = true;
    startTimeRef.current = Date.now() - stopwatchTime;

    stopwatchIntervalRef.current = setInterval(() => {
      if (!isRunningRef.current) return;
      const elapsed = Date.now() - startTimeRef.current;
      setStopwatchTime(elapsed);
    }, 50);
  };

  const stopStopwatch = () => {
    isRunningRef.current = false;
    const finalTime = Date.now() - startTimeRef.current;
    setStopwatchTime(finalTime);

    if (stopwatchIntervalRef.current) {
      clearInterval(stopwatchIntervalRef.current);
      stopwatchIntervalRef.current = null;
    }

    setIsStopwatchRunning(false);
  };

  const resetStopwatch = () => {
    stopStopwatch();
    cancelCountdown();
    setStopwatchTime(0);
    startTimeRef.current = 0;
    isRunningRef.current = false;
    startedByGestureRef.current = false;
    gestureHandledRef.current = false;
  };

  // Time formatting
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
            onClick={() => {
              startedByGestureRef.current = false;
              startCountdown();
            }}
            disabled={isGestureActive}
            className={`px-3 py-1 rounded transition-colors ${
              isGestureActive
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
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
        {isGestureActive && <span className="text-green-300">Gesture detected: {gestureName} • </span>}
        {isStopwatchRunning ? "Running" : isCountdownActive ? "Countdown..." : "Stopped"} • Show "Pointing_Up" gesture to start
      </div>
    </div>
  );
}