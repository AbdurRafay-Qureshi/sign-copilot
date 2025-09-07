import { describe, it, expect } from 'vitest';
import { classifyGesture, validateLandmarks } from '../classify';

describe('classifyGesture', () => {
  it('should return a classification for valid landmarks', () => {
    const landmarks = Array.from({ length: 21 }, (_, i) => [i * 10, i * 5, i * 0.1]);
    const result = classifyGesture(landmarks);
    
    expect(result).toHaveProperty('label');
    expect(result).toHaveProperty('confidence');
    expect(typeof result.label).toBe('string');
    expect(typeof result.confidence).toBe('number');
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  it('should handle empty landmarks array', () => {
    const result = classifyGesture([]);
    expect(result.label).toBe('Unknown');
    expect(result.confidence).toBe(0.0);
  });

  it('should handle null/undefined landmarks', () => {
    const result = classifyGesture(null as any);
    expect(result.label).toBe('Unknown');
    expect(result.confidence).toBe(0.0);
  });

  it('should return different classifications based on landmark count', () => {
    const highCountLandmarks = Array.from({ length: 25 }, (_, i) => [i * 10, i * 5, i * 0.1]);
    const mediumCountLandmarks = Array.from({ length: 15 }, (_, i) => [i * 10, i * 5, i * 0.1]);
    const lowCountLandmarks = Array.from({ length: 5 }, (_, i) => [i * 10, i * 5, i * 0.1]);

    const highResult = classifyGesture(highCountLandmarks);
    const mediumResult = classifyGesture(mediumCountLandmarks);
    const lowResult = classifyGesture(lowCountLandmarks);

    // All should return valid results
    expect(highResult.label).toBeTruthy();
    expect(mediumResult.label).toBeTruthy();
    expect(lowResult.label).toBeTruthy();
  });
});

describe('validateLandmarks', () => {
  it('should validate correct landmark format', () => {
    const validLandmarks = [
      [100, 200, 0.1],
      [150, 250, 0.2],
      [200, 300, 0.3]
    ];

    const result = validateLandmarks(validLandmarks);
    expect(result).toEqual(validLandmarks);
  });

  it('should reject non-array input', () => {
    const result = validateLandmarks('not an array');
    expect(result).toBeNull();
  });

  it('should reject array with non-array elements', () => {
    const invalidLandmarks = [
      [100, 200, 0.1],
      'not a landmark',
      [200, 300, 0.3]
    ];

    const result = validateLandmarks(invalidLandmarks);
    expect(result).toBeNull();
  });

  it('should reject landmarks with insufficient coordinates', () => {
    const invalidLandmarks = [
      [100, 200], // Only 2 coordinates, need at least 2
      [150, 250, 0.2]
    ];

    const result = validateLandmarks(invalidLandmarks);
    expect(result).toBeNull();
  });

  it('should reject landmarks with non-numeric coordinates', () => {
    const invalidLandmarks = [
      [100, 200, 0.1],
      ['150', 250, 0.2], // String instead of number
      [200, 300, 0.3]
    ];

    const result = validateLandmarks(invalidLandmarks);
    expect(result).toBeNull();
  });

  it('should handle empty array', () => {
    const result = validateLandmarks([]);
    expect(result).toBeNull();
  });
});
