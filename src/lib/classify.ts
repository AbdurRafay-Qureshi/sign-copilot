// classify.ts
// MVP: map hand landmark data → simple labels using basic gesture recognition
export function classifyGesture(landmarks: number[][]): { label: string; confidence: number } {
  // TODO: Replace with real ML/TF model
  // For now, return a mock classification based on simple heuristics
  
  if (!landmarks || landmarks.length === 0) {
    return { label: "Unknown", confidence: 0.0 };
  }

  // MediaPipe Hands provides 21 landmarks per hand
  if (landmarks.length !== 21) {
    return { label: "Unknown", confidence: 0.0 };
  }

  // Simple gesture recognition based on landmark positions
  // This is a very basic implementation - in production, you'd use a trained ML model
  
  // Get key landmarks (thumb tip, index tip, middle tip, etc.)
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];
  const wrist = landmarks[0];

  // Calculate distances and positions for gesture recognition
  const thumbIndexDistance = Math.sqrt(
    Math.pow(thumbTip[0] - indexTip[0], 2) + 
    Math.pow(thumbTip[1] - indexTip[1], 2)
  );

  const indexMiddleDistance = Math.sqrt(
    Math.pow(indexTip[0] - middleTip[0], 2) + 
    Math.pow(indexTip[1] - middleTip[1], 2)
  );

  // Check if fingers are extended (y-coordinate is higher than knuckle)
  const indexExtended = indexTip[1] < landmarks[6][1]; // Index tip above PIP joint
  const middleExtended = middleTip[1] < landmarks[10][1]; // Middle tip above PIP joint
  const ringExtended = ringTip[1] < landmarks[14][1]; // Ring tip above PIP joint
  const pinkyExtended = pinkyTip[1] < landmarks[18][1]; // Pinky tip above PIP joint
  const thumbExtended = thumbTip[0] > landmarks[3][0]; // Thumb tip to the right of IP joint

  // Simple gesture classification
  if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended && !thumbExtended) {
    return { label: "A", confidence: 0.85 };
  } else if (indexExtended && middleExtended && !ringExtended && !pinkyExtended && !thumbExtended) {
    return { label: "B", confidence: 0.88 };
  } else if (indexExtended && middleExtended && ringExtended && pinkyExtended && thumbExtended) {
    return { label: "Hello", confidence: 0.92 };
  } else if (indexExtended && middleExtended && ringExtended && pinkyExtended && !thumbExtended) {
    return { label: "Yes", confidence: 0.90 };
  } else if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended && !thumbExtended) {
    return { label: "No", confidence: 0.87 };
  } else if (thumbExtended && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    return { label: "Thumbs Up", confidence: 0.89 };
  } else {
    // Return a random gesture for unrecognized patterns (for demo purposes)
    const gestures = ["Hello", "Yes", "No", "A", "B", "Thumbs Up"];
    const randomGesture = gestures[Math.floor(Math.random() * gestures.length)];
    return { label: randomGesture, confidence: 0.75 + Math.random() * 0.2 };
  }
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
