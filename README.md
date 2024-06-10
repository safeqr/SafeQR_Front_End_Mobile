# SafeQR Code Scanner

SafeQR is a React Native application that allows users to scan QR codes using their mobile device's camera. The app provides a user-friendly interface with a bottom navigation bar for easy access to different sections such as QR Scanner, History, Settings, and Profile.

## Features

- **QR Code Scanning**: Scan QR codes and display the scanned data.
- **History**: (Placeholder) View the history of scanned QR codes.
- **Settings**: (Placeholder) Adjust application settings.
- **Profile**: (Placeholder) View and edit user profile.


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


3. **Start the Application**:
   ```sh
   npx expo start
   ```

   
3. **Install Expo CLI** (if step 3 causes expo error):
   ```sh
   npm install -g expo-cli
   ```

5. **Run on Device**:
   - For iOS, use the Expo Go app.
   - For Android, use the Expo Go app or an emulator.

## Usage

1. Open the app on your device.
2. Navigate to the **QR Scanner** tab.
3. Point your camera at a QR code.
4. The app will scan and display the QR code data below the camera view.
5. Use the bottom navigation to explore other sections (History,QR Scanner, Settings).

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
│   └── SettingsScreen.tsx
├── navigation
│   └── AppNavigator.tsx
└── types.ts

```

## Dependencies

The following dependencies are required to run this project:

- `expo-camera`: For camera access and barcode scanning.
- `@react-navigation/native`: For navigation.
- `@react-navigation/stack`: For stack navigation.
- `@react-navigation/bottom-tabs`: For bottom tab navigation.
- `react-native-screens`: Required by React Navigation.
- `react-native-safe-area-context`: Required by React Navigation.
- `axios`: For making HTTP requests to VirusTotal API.
- `@expo/vector-icons`: For icons used in the tab bar and camera view.

### Installation

To install the dependencies, run the following command:

```bash
npm install


