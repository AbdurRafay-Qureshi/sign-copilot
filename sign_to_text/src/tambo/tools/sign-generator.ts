import { SignResponseSchema } from "@/lib/sign-schema";
import { classifyGesture } from "@/lib/classify";

export type SignGeneratorInput = { landmarks: number[][] };

export const SIGN_SYSTEM_PROMPT = `
You are an expert sign language interpreter.
Return ONLY JSON conforming to SignResponseSchema.
Keys: recognized{label,confidence}, explanation{meaning,context?,suggestions?}.
`;

export const SIGN_USER_PROMPT = (landmarks: number[][]) => `
Landmarks: ${JSON.stringify(landmarks)}
`;

export async function generateSign(input: SignGeneratorInput) {
  try {
    // For MVP, use the simple classifier
    const classification = classifyGesture(input.landmarks);
    
    // Generate explanation based on the classification
    const explanations: Record<string, { meaning: string; context?: string[]; suggestions?: string[] }> = {
      "Closed Fist": {
        meaning: "A closed fist gesture, often used to show determination or agreement",
        context: ["Agreement", "Determination", "Solidarity"],
        suggestions: ["Keep fingers tightly closed", "Ensure thumb is visible", "Hold steady"]
      },
      "Open Hand": {
        meaning: "An open palm gesture, commonly used for greeting or stopping",
        context: ["Greeting", "Stop signal", "Openness"],
        suggestions: ["Spread fingers naturally", "Keep palm flat", "Make sure all fingers are visible"]
      },
      "Stop Sign": {
        meaning: "A stop or halt gesture with open palm facing forward",
        context: ["Traffic control", "Stop signal", "Attention"],
        suggestions: ["Palm facing forward", "Fingers together", "Arm extended"]
      },
      "Pointing": {
        meaning: "A pointing gesture with index finger extended",
        context: ["Direction", "Attention", "Indication"],
        suggestions: ["Extend index finger clearly", "Keep other fingers closed", "Point directly at target"]
      },
      "Peace Sign": {
        meaning: "A peace sign with index and middle fingers extended",
        context: ["Peace", "Victory", "Photo pose"],
        suggestions: ["Extend index and middle fingers", "Keep other fingers closed", "Form a V shape"]
      },
      "Thumbs Up": {
        meaning: "A positive approval gesture with thumb extended upward",
        context: ["Approval", "Good job", "Encouragement"],
        suggestions: ["Keep thumb straight up", "Close other fingers", "Make sure thumb is clearly visible"]
      },
      "OK Sign": {
        meaning: "An OK gesture forming a circle with thumb and index finger",
        context: ["Approval", "Everything is fine", "Agreement"],
        suggestions: ["Form a circle with thumb and index", "Keep other fingers extended", "Make the circle clearly visible"]
      },
      "Wave": {
        meaning: "A waving gesture with open hand moving side to side",
        context: ["Greeting", "Goodbye", "Attention"],
        suggestions: ["Move hand side to side", "Keep fingers together", "Use a gentle motion"]
      },
      "No Hand Detected": {
        meaning: "No hand was detected in the camera view",
        context: ["Camera setup", "Hand positioning"],
        suggestions: ["Ensure your hand is in the camera frame", "Check lighting", "Move closer to the camera"]
      },
      "Invalid Landmarks": {
        meaning: "The hand detection data appears to be invalid",
        context: ["Technical issue", "Data processing"],
        suggestions: ["Try moving your hand", "Check camera connection", "Refresh the page"]
      },
      "Invalid Data": {
        meaning: "The hand landmark data contains invalid values",
        context: ["Data quality", "Processing error"],
        suggestions: ["Ensure good lighting", "Keep hand steady", "Try a different position"]
      },
      "Unknown Gesture": {
        meaning: "The hand gesture was not recognized by the system",
        context: ["Recognition limits", "New gesture"],
        suggestions: ["Try a more common gesture", "Ensure clear hand positioning", "Check lighting conditions"]
      }
    };

    const explanation = explanations[classification.label] || explanations["Unknown"];

    const mockResponse = {
      recognized: {
        label: classification.label,
        confidence: classification.confidence,
        timestamp: new Date().toISOString()
      },
      alternatives: [
        { label: "Unknown", confidence: 0.1, timestamp: new Date().toISOString() }
      ],
      explanation
    };

    // Validate the response with Zod
    const parsed = SignResponseSchema.safeParse(mockResponse);
    if (!parsed.success) {
      const msg = parsed.error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join("; ");
      throw new Error(`Invalid output: ${msg}`);
    }
    
    return parsed.data;
  } catch (error) {
    console.error("Error generating sign:", error);
    throw new Error(`Sign generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
