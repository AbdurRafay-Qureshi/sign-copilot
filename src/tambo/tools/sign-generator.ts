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
    
    // Generate mock explanation based on the classification
    const explanations: Record<string, { meaning: string; context?: string[]; suggestions?: string[] }> = {
      "Hello": {
        meaning: "A friendly greeting gesture",
        context: ["Everyday conversation", "Meeting new people"],
        suggestions: ["Use open palm", "Make sure hand is clearly visible"]
      },
      "Yes": {
        meaning: "Affirmative response",
        context: ["Answering questions", "Agreement"],
        suggestions: ["Nod while signing", "Use clear up-and-down motion"]
      },
      "No": {
        meaning: "Negative response",
        context: ["Answering questions", "Disagreement"],
        suggestions: ["Shake head while signing", "Use clear side-to-side motion"]
      },
      "A": {
        meaning: "The letter A in sign language",
        context: ["Spelling", "Alphabet"],
        suggestions: ["Make fist with thumb extended", "Keep hand steady"]
      },
      "B": {
        meaning: "The letter B in sign language",
        context: ["Spelling", "Alphabet"],
        suggestions: ["Extend all fingers", "Keep thumb tucked"]
      },
      "Thumbs Up": {
        meaning: "Positive approval or agreement",
        context: ["Approval", "Encouragement", "Good job"],
        suggestions: ["Keep thumb straight up", "Make sure thumb is clearly visible"]
      },
      "Unknown": {
        meaning: "Gesture not recognized",
        context: ["Try again"],
        suggestions: ["Ensure hand is clearly visible", "Try a different angle", "Check lighting"]
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
