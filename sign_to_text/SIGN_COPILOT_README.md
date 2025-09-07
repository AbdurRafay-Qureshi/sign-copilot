# Sign Copilot Feature

A real-time hand gesture recognition system built with Next.js, TypeScript, and MediaPipe Hands.

## Features

- **Real-time Camera Feed**: Live webcam integration with hand detection
- **Gesture Recognition**: Uses MediaPipe Hands for accurate hand landmark detection
- **Sign Classification**: Basic gesture recognition for common signs (Hello, Yes, No, A, B, Thumbs Up)
- **Tambo Integration**: Includes Tambo tool and interactable component
- **Data Export**: Export recognition results as JSON or TXT files
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Type Safety**: Full TypeScript support with Zod validation

## File Structure

```
src/
├── app/
│   └── sign-copilot/
│       └── page.tsx                 # Main Sign Copilot page
├── components/
│   └── sign/
│       ├── CameraFeed.tsx           # Camera component with MediaPipe integration
│       ├── ErrorCard.tsx            # Error display component
│       └── ResultCard.tsx           # Recognition result display
├── lib/
│   ├── __tests__/
│   │   ├── sign-schema.test.ts      # Zod schema validation tests
│   │   └── classify.test.ts         # Classification function tests
│   ├── sign-schema.ts               # Zod schemas for data validation
│   ├── classify.ts                  # Gesture classification logic
│   ├── download.ts                  # File download utilities
│   └── mediapipe-hands.ts           # MediaPipe Hands integration
└── tambo/
    ├── tools/
    │   └── sign-generator.ts        # Tambo tool for sign generation
    └── components/
        └── sign-copilot.tsx         # Tambo interactable component
```

## Usage

1. **Start the Development Server**:
   ```bash
   npm run dev
   ```

2. **Navigate to Sign Copilot**:
   Visit `http://localhost:3000/sign-copilot`

3. **Use the Application**:
   - Click "Start Recognition" to begin camera detection
   - Perform hand gestures in front of the camera
   - View real-time recognition results
   - Export results as JSON or TXT files

## Supported Gestures

The current implementation recognizes these basic gestures:

- **Hello**: Open palm with all fingers extended
- **Yes**: All fingers extended except thumb
- **No**: Closed fist
- **A**: Fist with thumb extended
- **B**: All fingers extended with thumb tucked
- **Thumbs Up**: Only thumb extended

## Technical Implementation

### MediaPipe Hands Integration

The system uses MediaPipe Hands for hand landmark detection:

```typescript
// Initialize MediaPipe Hands detector
const detector = new MediaPipeHandsDetector();
await detector.initialize();
detector.setOnResults(handleHandDetection);
```

### Gesture Classification

Basic gesture recognition based on hand landmark positions:

```typescript
// Check finger extension based on landmark positions
const indexExtended = indexTip[1] < landmarks[6][1];
const middleExtended = middleTip[1] < landmarks[10][1];
// ... more finger checks
```

### Data Validation

All data is validated using Zod schemas:

```typescript
export const SignResponseSchema = z.object({
  recognized: SignResultSchema,
  alternatives: z.array(SignResultSchema).optional(),
  explanation: z.object({
    meaning: z.string().min(3),
    context: z.array(z.string()).optional(),
    suggestions: z.array(z.string()).optional(),
  }),
});
```

## Testing

Run the test suite:

```bash
npm run test:run
```

Tests cover:
- Zod schema validation
- Gesture classification logic
- Landmark validation
- Error handling

## Dependencies

- **Next.js 15**: React framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Zod**: Data validation
- **MediaPipe Hands**: Hand landmark detection
- **Vitest**: Testing framework
- **Tambo**: AI integration

## Future Enhancements

1. **Machine Learning Model**: Replace basic classification with trained ML model
2. **More Gestures**: Expand gesture vocabulary
3. **Sign Language**: Full sign language recognition
4. **Real-time Translation**: Live sign-to-text translation
5. **Custom Gestures**: User-defined gesture training
6. **Multi-hand Support**: Recognize multiple hands simultaneously

## Security Considerations

- Camera permissions are properly requested
- No data is stored permanently
- All user data is processed locally
- MediaPipe models are loaded from CDN

## Browser Compatibility

- Chrome/Chromium: Full support
- Firefox: Full support
- Safari: Limited support (WebRTC dependent)
- Edge: Full support

## Troubleshooting

### Camera Not Working
- Ensure camera permissions are granted
- Check if camera is being used by another application
- Try refreshing the page

### Recognition Not Working
- Ensure good lighting
- Keep hand clearly visible in frame
- Try different hand positions
- Check browser console for errors

### MediaPipe Loading Issues
- Check internet connection (models load from CDN)
- Try refreshing the page
- Check browser console for errors
