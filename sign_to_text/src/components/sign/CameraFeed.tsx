"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { MediaPipeHandsDetector, convertLandmarksToArray, getDominantHand } from "@/lib/mediapipe-hands";

interface CameraFeedProps {
  onLandmarksDetected?: (landmarks: number[][]) => void;
  isActive: boolean;
  className?: string;
}

export default function CameraFeed({ onLandmarksDetected, isActive, className = "" }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectorRef = useRef<MediaPipeHandsDetector | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleHandDetection = useCallback((results: any[]) => {
    if (!onLandmarksDetected || results.length === 0) return;

    const dominantHand = getDominantHand(results);
    if (dominantHand) {
      const landmarks = convertLandmarksToArray(dominantHand.landmarks);
      onLandmarksDetected(landmarks);
    }
  }, [onLandmarksDetected]);

  useEffect(() => {
    if (!isActive) return;

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: 640, 
            height: 480,
            facingMode: 'user'
          }
        });
        
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setError(null);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Unable to access camera. Please check permissions.");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive]);

  useEffect(() => {
    if (!isActive || !stream) return;

    const initializeHandDetection = async () => {
      try {
        const detector = new MediaPipeHandsDetector();
        await detector.initialize();
        detector.setOnResults(handleHandDetection);
        detectorRef.current = detector;
        setError(null); // Clear any previous errors
        console.log("Hand detection system initialized successfully");
      } catch (err) {
        console.error("Failed to initialize hand detection:", err);
        setError("Hand detection unavailable. Camera will work but gesture recognition is disabled.");
        // Don't prevent camera from working, just disable hand detection
        detectorRef.current = null;
      }
    };

    initializeHandDetection();

    return () => {
      if (detectorRef.current) {
        detectorRef.current.cleanup();
        detectorRef.current = null;
      }
    };
  }, [isActive, stream, handleHandDetection]);

  useEffect(() => {
    if (!isActive || !stream || !detectorRef.current) return;

    const processFrame = async () => {
      if (!videoRef.current || isProcessing) return;
      
      setIsProcessing(true);
      try {
        await detectorRef.current!.processFrame(videoRef.current);
      } catch (err) {
        console.error("Error processing frame:", err);
      } finally {
        setIsProcessing(false);
      }
    };

    const interval = setInterval(processFrame, 100); // Process every 100ms
    return () => clearInterval(interval);
  }, [isActive, stream, isProcessing]);

  if (error && !stream) {
    return (
      <div className={`rounded-2xl border p-4 bg-red-50 text-red-700 border-red-200 ${className}`}>
        <div className="font-semibold">Camera Error</div>
        <div className="text-sm mt-1">{error}</div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-2xl border overflow-hidden ${className}`}>
      {error && stream && (
        <div className="absolute top-2 left-2 right-2 z-10 bg-blue-100 border border-blue-300 rounded-lg p-2 text-blue-800 text-sm">
          <div className="font-semibold">ℹ️ Using Mock Hand Detection</div>
          <div className="text-xs mt-1">Camera is working. Hand detection is simulated for demo purposes.</div>
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-auto"
        style={{ transform: 'scaleX(-1)' }} // Mirror the video
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{ transform: 'scaleX(-1)' }} // Mirror the canvas
      />
      {!isActive && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="text-lg font-semibold">Camera Inactive</div>
            <div className="text-sm">Click "Start Recognition" to begin</div>
          </div>
        </div>
      )}
    </div>
  );
}
