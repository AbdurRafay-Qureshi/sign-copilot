import { z } from "zod";

export const SignResultSchema = z.object({
  label: z.string().min(1), // e.g. "Hello", "Yes", "A"
  confidence: z.number().min(0).max(1),
  timestamp: z.string().optional(), // ISO timestamp
});

export const SignResponseSchema = z.object({
  recognized: SignResultSchema,
  alternatives: z.array(SignResultSchema).optional(), // top-k predictions
  explanation: z.object({
    meaning: z.string().min(3),
    context: z.array(z.string()).optional(), // where this sign is used
    suggestions: z.array(z.string()).optional(), // e.g. "Try clearer hand position"
  }),
});

export type SignResponse = z.infer<typeof SignResponseSchema>;
export type SignResult = z.infer<typeof SignResultSchema>;
