# SafeQR Code Scanner

SafeQR is a React Native application that allows users to scan QR codes using their mobile device's camera. The app provides a user-friendly interface with a bottom navigation bar for easy access to different sections such as QR Scanner, History, Settings, and Profile.

## Features

- **QR Code Scanning**: Scan QR codes and display the scanned data.
- **History**: (Placeholder) View the history of scanned QR codes.
- **Settings**: (Placeholder) Adjust application settings.
- **Profile**: (Placeholder) View and edit user profile.

## Screenshots

![QR Scanner Screen](./screenshots/qr_scanner_screen.png)
![Bottom Navigation](./screenshots/bottom_navigation.png)

## Installation

1. **Clone the Repository**:
   ```sh
   git clone https://github.com/safeqr/SafeQR_Front_End_Mobile.git
   cd SafeQR_Front_End_Mobile
   ```

2. **Install Dependencies**:
   Ensure you have `node` and `npm` installed, then run:
   ```sh
   npm install
   ```

3. **Install Expo CLI** (if not already installed):
   ```sh
   npm install -g expo-cli
   ```

4. **Start the Application**:
   ```sh
   npx expo start
   ```

5. **Run on Device**:
   - For iOS, use the Expo Go app.
   - For Android, use the Expo Go app or an emulator.

## Usage

1. Open the app on your device.
2. Navigate to the **QR Scanner** tab.
3. Point your camera at a QR code.
4. The app will scan and display the QR code data below the camera view.
5. Use the bottom navigation to explore other sections (History, Settings, Profile).

## Project Structure


```
.//OTHER Node_modules
├── App.tsx
├── package.json
├── tsconfig.json
├── assets
│   └── ...
├── components
│   ├── CameraView.tsx
│   └── CustomTabBar.tsx
├── screens
│   ├── QRScannerScreen.tsx
│   ├── HistoryScreen.tsx
│   ├── SettingsScreen.tsx
│   └── ProfileScreen.tsx
├── navigation
│   └── AppNavigator.tsx
└── types.ts

```

## Dependencies

- **react**: 18.0.0
- **react-native**: 0.68.0
- **expo**: 45.0.0
- **@react-navigation/native**: 6.0.0
- **@react-navigation/bottom-tabs**: 6.0.0
- **expo-camera**: 12.0.0
- **expo-constants**: 13.0.0
- **expo-permissions**: 13.0.0
- **@expo/vector-icons**: 13.0.0
- **typescript**: 4.3.5

```

