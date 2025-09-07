import { describe, it, expect } from 'vitest';
import { SignResultSchema, SignResponseSchema } from '../sign-schema';

describe('SignResultSchema', () => {
  it('should validate a valid sign result', () => {
    const validResult = {
      label: 'Hello',
      confidence: 0.95,
      timestamp: '2024-01-01T12:00:00Z'
    };

    const result = SignResultSchema.safeParse(validResult);
    expect(result.success).toBe(true);
  });

  it('should validate without optional timestamp', () => {
    const validResult = {
      label: 'Yes',
      confidence: 0.88
    };

    const result = SignResultSchema.safeParse(validResult);
    expect(result.success).toBe(true);
  });

  it('should reject empty label', () => {
    const invalidResult = {
      label: '',
      confidence: 0.95
    };

    const result = SignResultSchema.safeParse(invalidResult);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('String must contain at least 1 character(s)');
    }
  });

  it('should reject confidence outside 0-1 range', () => {
    const invalidResult = {
      label: 'Hello',
      confidence: 1.5
    };

    const result = SignResultSchema.safeParse(invalidResult);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('Number must be less than or equal to 1');
    }
  });

  it('should reject negative confidence', () => {
    const invalidResult = {
      label: 'Hello',
      confidence: -0.1
    };

    const result = SignResultSchema.safeParse(invalidResult);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('Number must be greater than or equal to 0');
    }
  });
});

describe('SignResponseSchema', () => {
  it('should validate a complete sign response', () => {
    const validResponse = {
      recognized: {
        label: 'Hello',
        confidence: 0.95,
        timestamp: '2024-01-01T12:00:00Z'
      },
      alternatives: [
        {
          label: 'Hi',
          confidence: 0.85,
          timestamp: '2024-01-01T12:00:00Z'
        }
      ],
      explanation: {
        meaning: 'A friendly greeting gesture',
        context: ['Everyday conversation', 'Meeting new people'],
        suggestions: ['Use open palm', 'Make sure hand is clearly visible']
      }
    };

    const result = SignResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
  });

  it('should validate minimal sign response', () => {
    const minimalResponse = {
      recognized: {
        label: 'Yes',
        confidence: 0.88
      },
      explanation: {
        meaning: 'Affirmative response'
      }
    };

    const result = SignResponseSchema.safeParse(minimalResponse);
    expect(result.success).toBe(true);
  });

  it('should reject response without recognized field', () => {
    const invalidResponse = {
      explanation: {
        meaning: 'Some meaning'
      }
    };

    const result = SignResponseSchema.safeParse(invalidResponse);
    expect(result.success).toBe(false);
  });

  it('should reject response without explanation', () => {
    const invalidResponse = {
      recognized: {
        label: 'Hello',
        confidence: 0.95
      }
    };

    const result = SignResponseSchema.safeParse(invalidResponse);
    expect(result.success).toBe(false);
  });

  it('should reject explanation with meaning less than 3 characters', () => {
    const invalidResponse = {
      recognized: {
        label: 'Hello',
        confidence: 0.95
      },
      explanation: {
        meaning: 'Hi'
      }
    };

    const result = SignResponseSchema.safeParse(invalidResponse);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('String must contain at least 3 character(s)');
    }
  });
});
