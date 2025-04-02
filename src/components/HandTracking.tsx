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
  // Reference the HMTL Video to recognize it into prediction
  const webcamRef = useRef<Webcam>(null);

  // To help draw the hand
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Recognize variable from the mediapipe task-vision library
  const [recognizer, setRecognizer] = useState<GestureRecognizer>();

  // Will saving the prediction result as a state
  const [result, setResult] = useState<string>("");
  
  // This is optional just to make sure it is already clicked to start
  const [isStarted, setIsStarted] = useState<boolean>(false);
}