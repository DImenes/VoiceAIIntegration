# VoiceGPT Setup Guide

VoiceGPT is an intelligent voice assistant app that supports both voice and text conversations using OpenAI's Whisper for speech-to-text and GPT models for AI responses. It's built with React Native and Expo, featuring a modern UI and support for real-time voice interactions.

## Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure API Key**:
   - Set your OpenAI API key as an environment variable:
     ```bash
     export EXPO_PUBLIC_OPENAI_API_KEY="your-openai-api-key-here"
     ```
   - Or create a `.env` file in the project root:
     ```
     EXPO_PUBLIC_OPENAI_API_KEY=your-openai-api-key-here
     ```
   - Get your API key from: https://platform.openai.com/api-keys

3. **Start the Development Server**:
   ```bash
   npm start
   # or
   expo start
   ```

4. **Run on Device/Simulator**:
   ```bash
   npm run ios     # for iOS
   npm run android # for Android
   npm run web     # for web (limited microphone support)
   ```

## API Configuration

### OpenAI API Key Setup
1. Visit https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (starts with `sk-`)
4. Set it as an environment variable or in your `.env` file
5. The app will automatically validate the API key on startup

### Cost Considerations
- **Whisper (Transcription)**: ~$0.006 per minute of audio
- **GPT-4**: ~$0.03 per 1K tokens (higher quality, more expensive)
- **GPT-3.5-turbo**: ~$0.002 per 1K tokens (~750 words)

⚠️ **Note**: The app is currently configured to use `gpt-5` model. Update `config/api.ts` to use a valid model like `gpt-4` or `gpt-3.5-turbo`.

## Features Included

### 🎤 Voice Recording & Playback
- **VoiceRecorder Component**: Record audio with visual feedback, duration tracking, and playback controls
- **Audio Permissions**: Automatic permission handling for iOS and Android
- **Real-time Duration**: Live recording duration display with formatted time
- **Playback Controls**: Play/pause recorded audio before sending

### 🔤 Speech Recognition
- **TranscriptionService**: OpenAI Whisper integration for accurate speech-to-text
- **Audio Validation**: File size and format validation (25MB limit)
- **Multi-language Support**: Configurable language detection
- **Error Handling**: Comprehensive error handling with user feedback

### 🤖 AI Integration
- **ChatGPTService**: Configurable GPT model integration (currently set to gpt-5, needs updating)
- **Conversation Context**: Maintains conversation history (last 10 messages)
- **Custom System Prompts**: Specialized for HOA field inspection violations
- **Token Management**: Usage tracking and cost estimation

### 💬 Modern Chat Interface
- **ConversationDisplay**: Clean message bubbles with user/assistant avatars
- **Input Mode Switching**: Toggle between voice and text input with visual indicators
- **Transcription States**: Real-time transcription progress indicators
- **Audio Playback**: Play back original voice messages within chat
- **Empty States**: Helpful guidance when no messages exist

### 🎨 UI/UX Features
- **Themed Components**: Dark/light mode support with consistent theming
- **Responsive Design**: Optimized for various screen sizes
- **Keyboard Handling**: Smart keyboard avoidance for text input
- **Loading States**: Activity indicators during processing
- **Error Alerts**: User-friendly error messages and recovery options

## Project Structure

```
VoiceGPT/
├── app/                          # Expo Router app directory
│   ├── _layout.tsx              # Root layout with navigation
│   ├── (tabs)/                  # Tab navigation group
│   │   ├── _layout.tsx          # Tab bar configuration
│   │   ├── index.tsx            # Main voice chat screen ("Voice Sentinel")
│   │   └── explore.tsx          # Secondary tab (Expo template)
│   └── +not-found.tsx           # 404 page
│
├── components/                   # Reusable UI components
│   ├── VoiceRecorder.tsx        # Voice recording with playback controls
│   ├── ConversationDisplay.tsx  # Chat history with message bubbles
│   ├── TextInput.tsx            # Text message input component
│   ├── InputModeSwitcher.tsx    # Toggle between voice/text input
│   ├── ThemedText.tsx           # Text component with theme support
│   ├── ThemedView.tsx           # View component with theme support
│   └── ui/                      # Platform-specific UI components
│       ├── IconSymbol.tsx       # Cross-platform icon component
│       └── TabBarBackground.tsx # Custom tab bar styling
│
├── services/                    # Business logic and API services
│   ├── ChatGPTService.ts        # OpenAI Chat API integration
│   └── TranscriptionService.ts  # OpenAI Whisper API integration
│
├── config/                      # Configuration files
│   └── api.ts                   # API keys and endpoints
│
├── types/                       # TypeScript type definitions
│   └── voice-chat.ts            # Interface definitions for voice chat
│
├── constants/                   # App constants
│   └── Colors.ts                # Theme color definitions
│
├── hooks/                       # Custom React hooks
│   ├── useColorScheme.ts        # Theme detection hook
│   └── useThemeColor.ts         # Theme color selector hook
│
├── assets/                      # Static assets
│   ├── images/                  # App icons and images
│   └── fonts/                   # Custom fonts
│
├── app.json                     # Expo app configuration
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
└── README-SETUP.md              # This setup guide
```

## Permissions & Platform Configuration

The app requires microphone permissions for voice recording:

### iOS Configuration
- **Permission Description**: "This app needs access to the microphone to record your voice for transcription and AI chat."
- **Auto-request**: Permission is automatically requested when recording starts
- **Configured in**: `app.json` → `expo.ios.infoPlist.NSMicrophoneUsageDescription`

### Android Configuration  
- **Permission**: `android.permission.RECORD_AUDIO`
- **Runtime Handling**: Permission is requested at runtime via expo-av
- **Configured in**: `app.json` → `expo.android.permissions`

### Expo AV Plugin Configuration
- **Plugin**: `expo-av` with microphone permission configuration
- **Permission Message**: "Allow VoiceGPT to access your microphone to record audio for transcription."
- **Auto-configuration**: Handles platform-specific permission setup

## Troubleshooting

### Common Issues

1. **"API configuration error"**
   - Ensure your OpenAI API key is set as an environment variable: `EXPO_PUBLIC_OPENAI_API_KEY`
   - Verify the key starts with `sk-` and is valid
   - Check your OpenAI account has sufficient credits
   - The app validates API configuration on startup

2. **"Failed to start recording"**
   - Grant microphone permissions when prompted
   - Restart the app if permissions were initially denied
   - Check device microphone functionality in other apps
   - Ensure you're testing on a physical device (not simulator for voice)

3. **"Transcription failed"**
   - Verify your OpenAI API key has available credits
   - Check stable internet connection
   - Ensure audio file isn't too large (25MB Whisper API limit)
   - Try recording shorter audio clips (under 1 minute)

4. **"Invalid model 'gpt-5'"**
   - Update `config/api.ts` to use a valid model like `gpt-4` or `gpt-3.5-turbo`
   - The current configuration uses `gpt-5` which doesn't exist

5. **TypeScript/Build errors**
   - Run `npm install` to ensure all dependencies are installed
   - Clear Expo cache: `expo start --clear`
   - Check that all import paths use the `@/` alias correctly

6. **App crashes on startup**
   - Check React Native logs for specific error messages
   - Ensure all required Expo plugins are properly configured
   - Verify `app.json` configuration is valid

### API Rate Limits & Costs
- OpenAI has rate limits based on your account tier
- Free accounts have lower limits (3 requests/minute for GPT-4)
- Monitor usage on your OpenAI dashboard
- Consider implementing retry logic and request queuing for production

### Development Tips
- Use physical device for full microphone testing
- iOS Simulator supports limited audio features
- Android Emulator requires audio input setup
- Web version has limited microphone support

## Customization

### Change AI Model
Edit `config/api.ts` and update the `OPENAI_MODEL` value:
```typescript
export const API_CONFIG = {
  OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
  OPENAI_MODEL: 'gpt-4', // Change from 'gpt-5' to valid model
  // Options: 'gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo'
};
```

### Customize System Prompt
The app currently uses an HOA field inspector prompt. To change it, update `ChatGPTService.ts`:
```typescript
// Current prompt (lines 27-28 in ChatGPTService.ts)
private systemPrompt = `You are an field inspector assistant for HOA community...`;

// Example: Change to general assistant
private systemPrompt = `You are a helpful AI assistant. Provide clear, concise responses.`;
```

Or set it dynamically in your component:
```typescript
chatGPTService.current.setSystemPrompt("You are a helpful cooking assistant...");
```

### Audio Recording Quality
Modify recording quality in `VoiceRecorder.tsx` (line 58-60):
```typescript
// Current: High quality
const { recording: newRecording } = await Audio.Recording.createAsync(
  Audio.RecordingOptionsPresets.HIGH_QUALITY
);

// Options:
Audio.RecordingOptionsPresets.LOW_QUALITY    // Smaller files, faster upload
Audio.RecordingOptionsPresets.MEDIUM_QUALITY // Balanced
Audio.RecordingOptionsPresets.HIGH_QUALITY   // Best quality, larger files
```

### App Name and Branding
Update the app title in `app/(tabs)/index.tsx` (line 205):
```typescript
<ThemedText type="title">Voice Sentinel</ThemedText> // Change this
```

And in `app.json`:
```json
{
  "expo": {
    "name": "VoiceGPT",        // App display name
    "slug": "VoiceGPT",        // URL slug
    // ...
  }
}
```

### Theme and Colors
Modify colors in `constants/Colors.ts` and component styles throughout the app.

## Dependencies Overview

The project uses these key dependencies:

### Core Framework
- **expo**: ~53.0.22 - React Native development framework
- **react**: 19.0.0 - React framework  
- **react-native**: 0.79.6 - Native mobile development
- **expo-router**: ~5.1.5 - File-based navigation

### Audio & Media
- **expo-av**: ~15.1.7 - Audio recording and playback
- **expo-media-library**: ~17.1.7 - Media file management

### HTTP & API
- **axios**: ^1.11.0 - HTTP client for API calls

### UI & Navigation
- **@react-navigation/bottom-tabs**: ^7.3.10 - Tab navigation
- **@expo/vector-icons**: ^14.1.0 - Icon library
- **react-native-svg**: 15.11.2 - SVG support

### Development
- **typescript**: ~5.8.3 - Type safety
- **eslint**: ^9.25.0 - Code linting

## Production Considerations

### Security
- **API Key Management**: 
  - Use `expo-secure-store` for production API key storage
  - Never commit API keys to version control
  - Consider server-side proxy for API calls
- **Environment Variables**: Use EAS Build secrets for production builds

### Performance
- **Audio Compression**: Implement client-side audio compression before upload
- **Request Batching**: Batch multiple requests to reduce API calls
- **Caching**: Cache conversation history locally using AsyncStorage
- **Error Boundaries**: Implement React error boundaries for crash recovery

### Monitoring & Analytics
- **Crash Reporting**: Integrate Sentry or Bugsnag for error tracking
- **Analytics**: Add user interaction analytics
- **Performance Monitoring**: Monitor API response times and audio processing

### User Experience
- **Offline Support**: Cache conversations and queue requests when offline
- **User Authentication**: Add user accounts for persistent conversation history
- **Backup/Sync**: Cloud synchronization of user data

### Deployment
- **EAS Build**: Use Expo Application Services for production builds
- **App Store Optimization**: Optimize app store listings and screenshots
- **Beta Testing**: Use Expo's internal distribution for testing

## Future Enhancement Ideas

### Core Features
1. **Text-to-Speech**: Add voice responses from ChatGPT using speech synthesis
2. **Voice Activity Detection**: Auto-start/stop recording based on speech detection
3. **Multiple Languages**: Support for different languages in both speech and text
4. **Conversation Export**: Save/share conversations as text or audio files
5. **Custom Voice Commands**: Add app-specific voice commands and shortcuts

### Advanced Features
6. **Voice Cloning**: Custom voice synthesis for responses
7. **Real-time Streaming**: Stream audio for faster response times
8. **Multi-turn Context**: Maintain longer conversation context
9. **Conversation Templates**: Pre-built conversation starters
10. **Voice Profiles**: Multiple voice personas for different use cases

### HOA-Specific Features (Current Focus)
11. **Photo Integration**: Attach photos to violation reports
12. **GPS Location**: Automatic location detection for violations
13. **Report Templates**: Standardized violation report formats
14. **Database Integration**: Connect to HOA management systems
15. **Signature Capture**: Digital signatures for violation notices
