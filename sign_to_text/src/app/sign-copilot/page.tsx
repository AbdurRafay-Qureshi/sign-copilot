"use client";

import { useState, useCallback } from "react";
import ErrorCard from "@/components/sign/ErrorCard";
import CameraFeed from "@/components/sign/CameraFeed";
import SignCopilotComponent from "@/tambo/components/sign-copilot";
import { generateSign } from "@/tambo/tools/sign-generator";
import { SignResponse } from "@/lib/sign-schema";
import { clearGestureHistory, getCurrentGestureState } from "@/lib/classify";

export default function SignCopilotPage() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<SignResponse | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [landmarks, setLandmarks] = useState<number[][]>([]);

  const handleLandmarksDetected = useCallback(async (detectedLandmarks: number[][]) => {
    if (!isActive || loading) return;
    
    // Only process if we have valid landmarks
    if (!detectedLandmarks || detectedLandmarks.length === 0) {
      return;
    }
    
    setLandmarks(detectedLandmarks);
    
    try {
      setLoading(true);
      setErr(null);
      
      const result = await generateSign({ landmarks: detectedLandmarks });
      setData(result);
    } catch (error) {
      console.error("Error processing landmarks:", error);
      setErr(error instanceof Error ? error.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  }, [isActive, loading]);

  const handleStartRecognition = () => {
    setIsActive(true);
    setErr(null);
    setData(null);
  };

  const handleStopRecognition = () => {
    setIsActive(false);
    setLoading(false);
    clearGestureHistory(); // Clear gesture history when stopping
  };

  const handleResetRecognition = () => {
    clearGestureHistory();
    setData(null);
    setErr(null);
  };

  const handleManualTest = async () => {
    setErr(null);
    setLoading(true);
    setData(null);

    try {
      // Generate mock landmarks for testing
      const mockLandmarks = Array.from({ length: 21 }, (_, i) => [
        Math.random() * 640,
        Math.random() * 480,
        Math.random() * 0.1
      ]);
      
      const result = await generateSign({ landmarks: mockLandmarks });
      setData(result);
    } catch (error) {
      console.error("Error in manual test:", error);
      setErr(error instanceof Error ? error.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleMockGesture = (gestureType: string) => async () => {
    setErr(null);
    setLoading(true);
    setData(null);

    try {
      // Generate mock landmarks based on gesture type
      let mockLandmarks: number[][];
      
      switch (gestureType) {
        case 'fist':
          mockLandmarks = Array.from({ length: 21 }, (_, i) => [
            0.5 + Math.random() * 0.1, // All fingers close together
            0.5 + Math.random() * 0.1,
            Math.random() * 0.1
          ]);
          break;
        case 'open':
          mockLandmarks = Array.from({ length: 21 }, (_, i) => {
            const spread = i > 4 ? (i - 4) * 0.1 : 0; // Spread fingers
            return [
              0.3 + spread + Math.random() * 0.05,
              0.3 + Math.random() * 0.1,
              Math.random() * 0.1
            ];
          });
          break;
        case 'point':
          mockLandmarks = Array.from({ length: 21 }, (_, i) => {
            if (i === 8) { // Index finger tip
              return [0.6, 0.3, 0.1]; // Extended
            }
            return [0.5, 0.5, 0.1]; // Other fingers closed
          });
          break;
        default:
          mockLandmarks = Array.from({ length: 21 }, (_, i) => [
            Math.random() * 0.5 + 0.25,
            Math.random() * 0.5 + 0.25,
            Math.random() * 0.1
          ]);
      }
      
      const result = await generateSign({ landmarks: mockLandmarks });
      setData(result);
    } catch (error) {
      console.error("Error in mock gesture:", error);
      setErr(error instanceof Error ? error.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign Copilot</h1>
        <p className="text-gray-600">
          Perform hand signs in front of your camera to get real-time recognition and explanations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camera Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Camera Feed</h2>
          <CameraFeed
            onLandmarksDetected={handleLandmarksDetected}
            isActive={isActive}
            className="aspect-video"
          />
          
          <div className="flex flex-wrap gap-3">
            {!isActive ? (
              <button
                onClick={handleStartRecognition}
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Start Recognition
              </button>
            ) : (
              <button
                onClick={handleStopRecognition}
                className="px-6 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
              >
                Stop Recognition
              </button>
            )}
            
            <button
              onClick={handleManualTest}
              disabled={loading}
              className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Testing..." : "Test Recognition"}
            </button>
            
            <button
              onClick={handleResetRecognition}
              className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Reset Recognition
            </button>
          </div>

          {/* Mock Gesture Buttons for when MediaPipe fails */}
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Try Mock Gestures (when hand detection is disabled):</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleMockGesture('fist')}
                disabled={loading}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Closed Fist
              </button>
              <button
                onClick={handleMockGesture('open')}
                disabled={loading}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Open Hand
              </button>
              <button
                onClick={handleMockGesture('point')}
                disabled={loading}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Pointing
              </button>
            </div>
          </div>

          {loading && (
            <div className="text-center py-4">
              <div className="inline-flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">Recognizing sign...</span>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recognition Results</h2>
          
          {err && <ErrorCard message={err} />}
          
          {data && <SignCopilotComponent data={data} />}
          
          {!data && !err && !loading && (
            <div className="rounded-2xl border p-8 text-center text-gray-500">
              <div className="text-4xl mb-4">👋</div>
              <p className="text-lg font-medium mb-2">Ready to recognize signs</p>
              <p className="text-sm">
                Start the camera and perform a hand sign, or use the test button to see a demo
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Status and Debug Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium mb-2">Recognition Status</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Camera Status:</span>
            <span className={isActive ? "text-green-600" : "text-gray-500"}>
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Hand Detection:</span>
            <span className={landmarks.length > 0 ? "text-green-600" : "text-gray-500"}>
              {landmarks.length > 0 ? `${landmarks.length} landmarks` : "No hand detected"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Recognition Status:</span>
            <span className={loading ? "text-yellow-600" : data ? "text-green-600" : "text-gray-500"}>
              {loading ? "Processing..." : data ? `Recognized: ${data.recognized.label}` : "Waiting for gesture"}
            </span>
          </div>
          {data && (
            <div className="flex justify-between">
              <span>Confidence:</span>
              <span className={data.recognized.confidence > 0.8 ? "text-green-600" : data.recognized.confidence > 0.6 ? "text-yellow-600" : "text-red-600"}>
                {(data.recognized.confidence * 100).toFixed(1)}%
              </span>
            </div>
          )}
          {isActive && !data && (
            <div className="flex justify-between">
              <span>Detection Status:</span>
              <span className="text-blue-600">
                {(() => {
                  const gestureState = getCurrentGestureState();
                  if (gestureState) {
                    return `Detecting ${gestureState.label}... (${gestureState.count}/3)`;
                  }
                  return "Waiting for gesture...";
                })()}
              </span>
            </div>
          )}
        </div>
        <div className="mt-3 text-xs text-gray-600">
          <p>💡 <strong>How it works:</strong> Hold your gesture steady for 1-2 seconds. The system will detect, confirm (3 times), then display the result.</p>
          <p>🎯 <strong>For best results:</strong> Keep your hand clearly visible and hold gestures steady without moving.</p>
          <p>🔄 Use "Reset Recognition" to clear detection state and start fresh.</p>
        </div>
      </div>
    </main>
  );
}
