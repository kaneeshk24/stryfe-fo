import { FilesetResolver, GestureRecognizer } from "@mediapipe/tasks-vision";
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";

const WIDTH = 640;
const HEIGHT = 360;

interface Coordinate {
  x: number;
  y: number;
}

export default function Video() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [recognizer, setRecognizer] = useState<GestureRecognizer>();
  const [result, setResult] = useState<string>("");
  const [isStarted, setIsStarted] = useState<boolean>(false);

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
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      ctx.drawImage(video, 0, 0, WIDTH, HEIGHT);

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
        setResult(results.gestures[0][0].categoryName);
      } else {
        setResult("");
      }

      requestAnimationFrame(processFrame);
    };

    processFrame();
  }, [recognizer, isStarted]);

  const startTracking = () => {
    setIsStarted(true);
  };

  return (
    <div className="relative">
      <Webcam
        ref={webcamRef}
        audio={false}
        width={WIDTH}
        height={HEIGHT}
        className="hidden"
      />
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        className="rounded-lg shadow-lg"
      />
      {!isStarted && (
        <button
          onClick={startTracking}
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
    </div>
  );
}