import { FilesetResolver, GestureRecognizer } from "@mediapipe/tasks-vision";
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";
import Stopwatch from "./Stopwatch";

interface HandTrackingProps {
  width: number;
  height: number;
}

export default function HandTracking({ width, height }: HandTrackingProps) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [recognizer, setRecognizer] = useState<GestureRecognizer>();
  const [result, setResult] = useState<string>("");
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [stopwatchActive, setStopwatchActive] = useState<boolean>(false);

  useEffect(() => {
    const initializeRecognizer = async () => {
      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      
      const gestureRecognizer = await GestureRecognizer.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
        },
        runningMode: "VIDEO",
      });

      setRecognizer(gestureRecognizer);
    };

    initializeRecognizer();
  }, []);

  useEffect(() => {
    if (!recognizer || !webcamRef.current?.video || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const processFrame = async () => {
      if (!webcamRef.current?.video || !isStarted) return;

      const video = webcamRef.current.video;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(video, 0, 0, width, height);

      const startTimeMs = performance.now();
      const results = recognizer.recognizeForVideo(video, startTimeMs);

      if (results.landmarks) {
        for (const landmarks of results.landmarks) {
          drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
            color: '#00FF00',
            lineWidth: 2
          });
          drawLandmarks(ctx, landmarks, {
            color: '#FF0000',
            lineWidth: 1,
            radius: 3
          });
        }
      }

      if (results.gestures.length > 0) {
        const gesture = results.gestures[0][0].categoryName;
        setResult(gesture);
        
        // Start stopwatch when Pointing_Up is detected
        if (gesture === "Pointing_Up" && !stopwatchActive) {
          setStopwatchActive(true);
        }
        
        // Stop stopwatch when Open_Palm is detected
        if (gesture === "Open_Palm" && stopwatchActive) {
          setStopwatchActive(false);
        }
      } else {
        setResult("");
      }

      requestAnimationFrame(processFrame);
    };

    processFrame();
  }, [recognizer, isStarted, width, height, stopwatchActive]);

  return (
    <div className="relative">
      <Webcam
        ref={webcamRef}
        audio={false}
        width={width}
        height={height}
        className="hidden"
      />
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-lg shadow-lg"
      />
      {!isStarted && (
        <button
          onClick={() => setIsStarted(true)}
          className="absolute top-4 left-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Start Tracking
        </button>
      )}
      {isStarted && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
          {result ? `Detected Gesture: ${result}` : 'No gesture detected'}
        </div>
      )}
      
      {isStarted && (
        <Stopwatch 
          isGestureActive={stopwatchActive} 
          gestureName={result} 
        />
      )}
    </div>
  );
}