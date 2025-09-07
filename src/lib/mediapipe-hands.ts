// MediaPipe Hands integration for gesture detection
import { Hands, Results } from '@mediapipe/hands';

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface HandDetectionResult {
  landmarks: HandLandmark[];
  handedness: 'Left' | 'Right';
  confidence: number;
}

export class MediaPipeHandsDetector {
  private hands: Hands | null = null;
  private isInitialized = false;
  private onResultsCallback?: (results: HandDetectionResult[]) => void;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });

      this.hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.hands.onResults((results: Results) => {
        this.handleResults(results);
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize MediaPipe Hands:', error);
      throw new Error('MediaPipe Hands initialization failed');
    }
  }

  private handleResults(results: Results): void {
    if (!this.onResultsCallback) return;

    const handResults: HandDetectionResult[] = [];

    if (results.multiHandLandmarks && results.multiHandedness) {
      for (let i = 0; i < results.multiHandLandmarks.length; i++) {
        const landmarks = results.multiHandLandmarks[i];
        const handedness = results.multiHandedness[i];
        
        handResults.push({
          landmarks: landmarks.map(landmark => ({
            x: landmark.x,
            y: landmark.y,
            z: landmark.z
          })),
          handedness: handedness.label as 'Left' | 'Right',
          confidence: handedness.score
        });
      }
    }

    this.onResultsCallback(handResults);
  }

  setOnResults(callback: (results: HandDetectionResult[]) => void): void {
    this.onResultsCallback = callback;
  }

  async processFrame(videoElement: HTMLVideoElement): Promise<void> {
    if (!this.hands || !this.isInitialized) {
      throw new Error('MediaPipe Hands not initialized');
    }

    await this.hands.send({ image: videoElement });
  }

  cleanup(): void {
    if (this.hands) {
      this.hands.close();
      this.hands = null;
    }
    this.isInitialized = false;
    this.onResultsCallback = undefined;
  }
}

// Utility function to convert MediaPipe landmarks to our format
export function convertLandmarksToArray(landmarks: HandLandmark[]): number[][] {
  return landmarks.map(landmark => [landmark.x, landmark.y, landmark.z]);
}

// Utility function to get the dominant hand (highest confidence)
export function getDominantHand(results: HandDetectionResult[]): HandDetectionResult | null {
  if (results.length === 0) return null;
  
  return results.reduce((dominant, current) => 
    current.confidence > dominant.confidence ? current : dominant
  );
}
