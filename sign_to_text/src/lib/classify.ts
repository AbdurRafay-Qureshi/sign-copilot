// classify.ts
// Improved gesture recognition with better logic and validation

// Gesture recognition state management
let gestureHistory: { label: string; confidence: number; timestamp: number }[] = [];
let currentGesture: { label: string; confidence: number; count: number; firstSeen: number } | null = null;
let lastGestureChange = 0;

const HISTORY_SIZE = 10; // Keep more history for better analysis
const MIN_CONFIDENCE_THRESHOLD = 0.7; // Higher threshold for initial detection
const CONFIRMATION_COUNT = 3; // How many times gesture must be seen to confirm
const CONFIRMATION_TIME = 1500; // Max time to confirm a gesture (ms)
const STABILITY_TIME = 2000; // How long to keep showing confirmed gesture (ms)

export function classifyGesture(landmarks: number[][]): { label: string; confidence: number } {
  // Validate input
  if (!landmarks || landmarks.length === 0) {
    return { label: "No Hand Detected", confidence: 0.0 };
  }

  // MediaPipe Hands provides 21 landmarks per hand
  if (landmarks.length !== 21) {
    return { label: "Invalid Landmarks", confidence: 0.0 };
  }

  // Validate landmark data quality
  const isValidLandmark = (landmark: number[]) => 
    Array.isArray(landmark) && 
    landmark.length >= 3 && 
    landmark.every(coord => typeof coord === 'number' && !isNaN(coord) && isFinite(coord));

  if (!landmarks.every(isValidLandmark)) {
    return { label: "Invalid Data", confidence: 0.0 };
  }

  // Get key landmarks with proper validation
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];
  const wrist = landmarks[0];

  // Calculate finger extension more accurately
  // A finger is extended if the tip is significantly higher (lower y value) than the PIP joint
  const fingerExtensionThreshold = 0.02; // Adjust this threshold as needed
  
  const indexExtended = (landmarks[6][1] - indexTip[1]) > fingerExtensionThreshold;
  const middleExtended = (landmarks[10][1] - middleTip[1]) > fingerExtensionThreshold;
  const ringExtended = (landmarks[14][1] - ringTip[1]) > fingerExtensionThreshold;
  const pinkyExtended = (landmarks[18][1] - pinkyTip[1]) > fingerExtensionThreshold;
  
  // Thumb extension: check if thumb tip is significantly to the right of the thumb IP joint
  const thumbExtended = (thumbTip[0] - landmarks[3][0]) > fingerExtensionThreshold;

  // Calculate hand openness (how spread out the fingers are)
  const fingerSpread = Math.sqrt(
    Math.pow(indexTip[0] - pinkyTip[0], 2) + 
    Math.pow(indexTip[1] - pinkyTip[1], 2)
  );

  // Calculate hand size for normalization
  const handSize = Math.sqrt(
    Math.pow(thumbTip[0] - pinkyTip[0], 2) + 
    Math.pow(thumbTip[1] - pinkyTip[1], 2)
  );

  // Normalize spread by hand size
  const normalizedSpread = handSize > 0 ? fingerSpread / handSize : 0;

  // More accurate gesture classification with better thresholds
  const extendedFingers = [indexExtended, middleExtended, ringExtended, pinkyExtended].filter(Boolean).length;
  const allFingersExtended = indexExtended && middleExtended && ringExtended && pinkyExtended;
  const noFingersExtended = !indexExtended && !middleExtended && !ringExtended && !pinkyExtended;

  // Calculate additional features for better recognition
  const thumbIndexDistance = Math.sqrt(
    Math.pow(thumbTip[0] - indexTip[0], 2) + 
    Math.pow(thumbTip[1] - indexTip[1], 2)
  );

  const handOpenness = normalizedSpread;
  const fingerCurvature = Math.abs(indexTip[1] - landmarks[6][1]) + Math.abs(middleTip[1] - landmarks[10][1]);

  // Improved gesture recognition with more specific conditions
  if (noFingersExtended && !thumbExtended) {
    return { label: "Closed Fist", confidence: 0.95 };
  } 
  else if (allFingersExtended && thumbExtended && handOpenness > 0.6) {
    return { label: "Open Hand", confidence: 0.92 };
  } 
  else if (allFingersExtended && !thumbExtended && handOpenness > 0.5) {
    return { label: "Stop Sign", confidence: 0.90 };
  } 
  else if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended && !thumbExtended) {
    return { label: "Pointing", confidence: 0.88 };
  } 
  else if (indexExtended && middleExtended && !ringExtended && !pinkyExtended && !thumbExtended) {
    return { label: "Peace Sign", confidence: 0.87 };
  } 
  else if (thumbExtended && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    return { label: "Thumbs Up", confidence: 0.93 };
  } 
  else if (thumbExtended && indexExtended && !middleExtended && !ringExtended && !pinkyExtended && thumbIndexDistance < 0.1) {
    return { label: "OK Sign", confidence: 0.89 };
  } 
  else if (handOpenness > 0.7 && allFingersExtended && fingerCurvature > 0.1) {
    return { label: "Wave", confidence: 0.82 };
  }
  else if (extendedFingers >= 3 && handOpenness > 0.4) {
    return { label: "Open Hand", confidence: 0.80 };
  }
  else if (extendedFingers === 2 && (indexExtended && middleExtended)) {
    return { label: "Peace Sign", confidence: 0.85 };
  }
  else if (extendedFingers === 1 && indexExtended) {
    return { label: "Pointing", confidence: 0.83 };
  }
  else {
    // For unrecognized patterns, return a low confidence "Unknown"
    return { label: "Unknown Gesture", confidence: 0.25 };
  }

  // Add to history
  gestureHistory.push({ label, confidence, timestamp: Date.now() });
  
  // Keep only recent gestures
  if (gestureHistory.length > HISTORY_SIZE) {
    gestureHistory = gestureHistory.slice(-HISTORY_SIZE);
  }

  const now = Date.now();

  // Step 1: DETECTION - Check if we have a high-confidence gesture
  if (confidence >= MIN_CONFIDENCE_THRESHOLD && label !== "Unknown Gesture") {
    
    // If this is the same gesture we're currently tracking, increment count
    if (currentGesture && currentGesture.label === label) {
      currentGesture.count++;
      currentGesture.confidence = Math.max(currentGesture.confidence, confidence);
    } 
    // If this is a new gesture, start tracking it
    else if (!currentGesture || currentGesture.label !== label) {
      currentGesture = {
        label,
        confidence,
        count: 1,
        firstSeen: now
      };
      lastGestureChange = now;
    }
  }

  // Step 2: CONFIRMATION - Check if current gesture is confirmed
  if (currentGesture) {
    const timeSinceFirstSeen = now - currentGesture.firstSeen;
    const timeSinceLastChange = now - lastGestureChange;

    // If we've seen this gesture enough times and it's been stable, confirm it
    if (currentGesture.count >= CONFIRMATION_COUNT && timeSinceFirstSeen <= CONFIRMATION_TIME) {
      // Gesture is confirmed! Return it with high confidence
      return {
        label: currentGesture.label,
        confidence: Math.min(currentGesture.confidence + 0.1, 1.0)
      };
    }

    // If too much time has passed without confirmation, reset
    if (timeSinceFirstSeen > CONFIRMATION_TIME) {
      currentGesture = null;
    }

    // If gesture changed recently, don't show anything yet (waiting for confirmation)
    if (timeSinceLastChange < 500) { // 500ms grace period
      return { label: "Detecting...", confidence: 0.5 };
    }
  }

  // Step 3: DISPLAY - Show current state
  if (currentGesture) {
    // Show the gesture we're trying to confirm
    return {
      label: `Detecting ${currentGesture.label}...`,
      confidence: currentGesture.confidence * (currentGesture.count / CONFIRMATION_COUNT)
    };
  }

  // No gesture being tracked, show waiting state
  return { label: "Waiting for gesture...", confidence: 0.0 };
}

// Helper function to validate landmark data
export function validateLandmarks(landmarks: any): number[][] | null {
  if (!Array.isArray(landmarks)) return null;
  
  return landmarks.every((landmark: any) => 
    Array.isArray(landmark) && 
    landmark.length >= 2 && 
    landmark.every((coord: any) => typeof coord === 'number')
  ) ? landmarks as number[][] : null;
}

// Helper function to clear gesture history (useful for resetting state)
export function clearGestureHistory(): void {
  gestureHistory = [];
  currentGesture = null;
  lastGestureChange = 0;
}

// Helper function to get current gesture history (for debugging)
export function getGestureHistory(): { label: string; confidence: number; timestamp: number }[] {
  return [...gestureHistory];
}

// Helper function to get current gesture state (for debugging)
export function getCurrentGestureState(): { label: string; confidence: number; count: number; firstSeen: number } | null {
  return currentGesture ? { ...currentGesture } : null;
}
