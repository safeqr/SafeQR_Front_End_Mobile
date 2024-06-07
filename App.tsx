import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CameraView, Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

function QRScannerScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [scannedData, setScannedData] = useState('');

  useEffect(() => {
    const initializeApp = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      setShowSplash(false);
    };

    initializeApp();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setScannedData(`Type: ${type}\nData: ${data}`);
    alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  };

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <ActivityIndicator size="large" color="#ff69b4" />
      </View>
    );
  }

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.headerText}>SafeQR</Text>
      </View>
      <Text style={styles.welcomeText}>Welcome to SafeQR code Scanner</Text>
      <View style={styles.cameraContainer}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr', 'pdf417'] }}
          style={styles.camera}
        />
      </View>
      {scannedData !== '' && (
        <View style={styles.dataBox}>
          <Text style={styles.dataText}>{scannedData}</Text>
        </View>
      )}
      {scanned && (
        <Button title={"Tap to Scan Again"} onPress={() => setScanned(false)} />
      )}
      <View style={styles.menu}>
        {/* Your existing menu items */}
      </View>
    </View>
  );
}

function HistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>History Screen</Text>
    </View>
  );
}

function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Settings Screen</Text>
    </View>
  );
}

function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Profile Screen</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === 'QR Scanner') {
              iconName = 'qr-code-outline';
            } else if (route.name === 'History') {
              iconName = 'time-outline';
            } else if (route.name === 'Settings') {
              iconName = 'settings-outline';
            } else if (route.name === 'Profile') {
              iconName = 'person-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
        tabBarOptions={{
          activeTintColor: 'tomato',
          inactiveTintColor: 'gray',
        }}
      >
        <Tab.Screen name="QR Scanner" component={QRScannerScreen} />
        <Tab.Screen name="History" component={HistoryScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f0fc", // light purple background
  },
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f0fc", // light purple background
  },
  banner: {
    backgroundColor: "#ff69b4", // pink background
    paddingVertical: 10,
    alignItems: "center",
  },
  headerText: {
    color: "white",
    fontSize: 24,
  },
  welcomeText: {
    textAlign: "center",
    fontSize: 20,
    marginVertical: 10, // Adjusted margin
    color: "#ff69b4", // pink color
  },
  cameraContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    width: 300,
    height: 300,
  },
  dataBox: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  dataText: {
    fontSize: 16,
    color: "#000",
  },
  menu: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#ff69b4", // pink background
    paddingVertical: 10,
  },
});
