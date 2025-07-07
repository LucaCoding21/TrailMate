export default {
  expo: {
    name: "TrailMate",
    slug: "TrailMate",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "trailmate",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      FIREBASE_API_KEY: "AIzaSyATyzXsWD3vn6BBlw6pCPMSFijFg6EOKWE",
      FIREBASE_AUTH_DOMAIN: "trailmate-77722.firebaseapp.com",
      FIREBASE_PROJECT_ID: "trailmate-77722",
      FIREBASE_STORAGE_BUCKET: "trailmate-77722.firebasestorage.app",
      FIREBASE_MESSAGING_SENDER_ID: "1079521714687",
      FIREBASE_APP_ID: "1:1079521714687:web:f0313e79b2512645ae47ca",
      FIREBASE_MEASUREMENT_ID: "G-NH66P7RD2D",
    },
  },
}; 