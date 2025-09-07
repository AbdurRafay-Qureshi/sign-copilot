"use client";

import { useState, useCallback } from "react";
import ErrorCard from "@/components/sign/ErrorCard";
import CameraFeed from "@/components/sign/CameraFeed";
import SignCopilotComponent from "@/tambo/components/sign-copilot";
import { generateSign } from "@/tambo/tools/sign-generator";
import { SignResponse } from "@/lib/sign-schema";

export default function SignCopilotPage() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<SignResponse | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [landmarks, setLandmarks] = useState<number[][]>([]);

  const handleLandmarksDetected = useCallback(async (detectedLandmarks: number[][]) => {
    if (!isActive || loading) return;
    
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

      {/* Debug Info */}
      {landmarks.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Debug Info</h3>
          <p className="text-sm text-gray-600">
            Landmarks detected: {landmarks.length} points
          </p>
        </div>
      )}
    </main>
  );
}
