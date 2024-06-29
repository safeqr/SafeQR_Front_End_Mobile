
# SafeQR Code Scanner

SafeQR Code Scanner is a React Native application that allows users to scan QR codes securely. The app includes features such as scanning QR codes using the camera or image gallery, checking the security of URLs via VirusTotal, bookmarking scanned QR codes, and viewing detailed scan results.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [File Structure](#file-structure)
  - [Components](#components)
  - [Navigation](#navigation)
  - [Screens](#screens)
- [Dependencies](#dependencies)
- [Contributing](#contributing)
- [License](#license)

## Features

- Scan QR codes using the device camera
- Scan QR codes from the image gallery
- Check the security of scanned URLs via VirusTotal
- Bookmark and manage scanned QR codes
- View detailed scan results and security headers

## Installation

1. **Clone the Repository**:
   ```sh
   git clone https://github.com/yourusername/safeqr.git
   cd safeqr
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
   cd to project directory **SafeQR**
   ```shell
   npx expo start
   ```

5. **Run on Device**:
   - For iOS, use the Expo Go app.
   - For Android, use the Expo Go app or an emulator.
   - For Windows/MacOS Install Android studio and stat the [[Android Emulator]] **first**. Once Expo and Emulater has started, press a on the terminal to connect expo to emulator

## Usage

1. Open the app on your device.
2. Use the camera to scan a QR code or select an image from your gallery.
3. View the scan results and security details.
4. Bookmark important QR codes for later reference.

## File Structure

The project structure is organized as follows:

```
safeqr-code-scanner/
├── assets/
│   └── ScanIcon3.png
├── components/
│   ├── ScannedDataBox.tsx
│   └── CustomTabBar.tsx
├── navigation/
│   ├── AppNavigator.tsx
│   └── BottomTabNavigator.tsx
├── screens/
│   ├── HistoryScreen.tsx
│   ├── QRScannerScreen.tsx
│   └── SettingsScreen.tsx
├── types/
│   └── index.ts
├── App.tsx
├── README.md
└── package.json
```

### Components

Reusable components used throughout the application.

- `ScannedDataBox.tsx`: Displays detailed information about the scanned QR code.
- `CustomTabBar.tsx`: Custom tab bar for navigation.

### Navigation

Handles the navigation structure of the application.

- `AppNavigator.tsx`: Main navigator that includes the bottom tab navigator.
- `BottomTabNavigator.tsx`: Defines the bottom tab navigation.

### Screens

Individual screens used in the application.

- `HistoryScreen.tsx`: Displays the history of scanned QR codes and bookmarks.
- `QRScannerScreen.tsx`: Main screen for scanning QR codes using the camera.
- `SettingsScreen.tsx`: Displays app settings and additional information.

## Dependencies

The project relies on the following major dependencies:

- `react-native`: For building native apps using React.
- `expo-camera`: For camera access and barcode scanning.
- `react-native-qrcode-svg`: For generating QR codes.
- `axios`: For making HTTP requests to the VirusTotal API.
- `@react-navigation/native`: For navigation within the app.
- `@expo/vector-icons`: For using vector icons in the app.
- `expo-image-picker`: For selecting images from the device gallery.
- `react-native-reanimated`: For animations and gesture handling.


### Installation of dependencies

To install the dependencies, run the following command(it will auto read package.json):

```bash
npm install
```