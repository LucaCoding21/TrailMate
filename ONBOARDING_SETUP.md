# TrailMate Onboarding Setup Guide

## Overview

TrailMate now includes a complete 4-screen onboarding flow with Firebase Google Authentication. This guide will help you set up the required Firebase configuration and environment variables.

## Prerequisites

- Node.js and npm/yarn installed
- Expo CLI installed
- Firebase project created
- Google Cloud Console access

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Enable Authentication in the Firebase console
4. Add Google as a sign-in provider

### 2. Get Firebase Configuration

1. In Firebase Console, go to Project Settings
2. Scroll down to "Your apps" section
3. Add a new app (Web app)
4. Copy the configuration object

### 3. Configure Google OAuth

1. In Firebase Console, go to Authentication > Sign-in method
2. Enable Google provider
3. Add your app's domain to authorized domains
4. Note the Web client ID

## Environment Variables

### 1. Create .env file

Copy `env.example` to `.env` and fill in your values:

```bash
cp env.example .env
```

### 2. Add Firebase Configuration

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Google OAuth Configuration
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
EXPO_PUBLIC_GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### 3. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to APIs & Services > Credentials
4. Create OAuth 2.0 Client ID for Web application
5. Add authorized redirect URIs:
   - `https://auth.expo.io/@your-expo-username/trailmate`
   - `trailmate://`

## App Configuration

### 1. Update app.json

Add the following to your `app.json`:

```json
{
  "expo": {
    "scheme": "trailmate",
    "android": {
      "package": "com.yourcompany.trailmate"
    },
    "ios": {
      "bundleIdentifier": "com.yourcompany.trailmate"
    }
  }
}
```

### 2. Install Dependencies

All required dependencies are already installed:

```bash
npm install
```

## Testing the Onboarding Flow

### 1. Start the Development Server

```bash
npm start
```

### 2. Test on Device/Simulator

- The app will start with the onboarding flow
- Test each screen: Welcome → How It Works → Location Permission → Notification Permission
- Test Google sign-in (requires real device for OAuth)
- Verify navigation to HomeScreen after successful authentication

## Onboarding Flow Details

### Screen 1: Welcome

- TrailMate branding with car icon
- "Get Started" button to proceed
- "Skip" option in top-right

### Screen 2: How It Works

- 3-step process explanation
- Progress dots showing step 2 of 4
- "Next" button to continue

### Screen 3: Location Permission

- Requests GPS access
- Explains location usage
- "Not now" option to skip
- Error handling for denied permissions

### Screen 4: Notification Permission

- Requests notification access
- Google sign-in button
- Progress dots showing step 4 of 4
- Handles authentication errors

## Troubleshooting

### Common Issues

1. **Firebase not initialized**

   - Check environment variables are set correctly
   - Verify Firebase project configuration

2. **Google sign-in fails**

   - Ensure OAuth client ID is correct
   - Check redirect URIs in Google Cloud Console
   - Test on physical device (OAuth doesn't work in simulator)

3. **Permissions denied**

   - App handles permission denials gracefully
   - Users can skip permissions and still use the app

4. **Navigation issues**
   - Verify all navigation dependencies are installed
   - Check TypeScript types for navigation

### Debug Mode

Enable debug logging by adding to your environment:

```env
EXPO_PUBLIC_DEBUG=true
```

## Security Notes

- Never commit `.env` file to version control
- Use Firebase Security Rules for data protection
- Implement proper error handling for production
- Consider implementing app signing for production builds

## Next Steps

After setting up the onboarding flow:

1. Test the complete flow on multiple devices
2. Implement the rescue request functionality
3. Add real-time features with Firebase Firestore
4. Implement push notifications for rescue updates
5. Add offline support for critical features
