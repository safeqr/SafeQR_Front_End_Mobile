import React, { useState, useEffect, createContext, useContext } from 'react';
import { Text, View, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CameraView, Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

// Create a Context for QR code data
const QRCodeContext = createContext();

const Tab = createBottomTabNavigator();

function QRScannerScreen() {
  const { qrCodes, setQrCodes } = useContext(QRCodeContext); // Access context
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [scannedData, setScannedData] = useState('');

  useEffect(() => {
    const initializeApp = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      setShowSplash(false); // Hide splash screen after initializing
    };

    initializeApp();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true); // Mark as scanned
    const newScannedData = `Type: ${type}\nData: ${data}`;
    setScannedData(newScannedData); // Save scanned data
    setQrCodes([...qrCodes, newScannedData]); // Add scanned data to history
    alert(`Bar code with type ${type} and data ${data} has been scanned!`); // Show an alert
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
      {/* Header banner */}
      <View style={styles.banner}>
        <Text style={styles.headerText}>SafeQR</Text>
      </View>
      {/* Welcome message */}
      <Text style={styles.welcomeText}>Welcome to SafeQR code Scanner</Text>
      {/* Camera view container */}
      <View style={styles.cameraContainer}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned} // Disable scanner if already scanned
          barcodeScannerSettings={{ barcodeTypes: ['qr', 'pdf417'] }} // Scanner settings
          style={styles.camera} // Apply styles
        />
      </View>
      
      {/* Display scanned data */}
      {scannedData !== '' && (
        <View style={styles.dataBox}>
          <Text style={styles.dataText}>{scannedData}</Text>
        </View>
      )}

      {/* Button to scan again */}
      {scanned && (
        <TouchableOpacity style={styles.button} onPress={() => setScanned(false)}>
          <Text style={styles.buttonText}>Tap to Scan Again</Text>
        </TouchableOpacity>
      )}

      {/* Menu (Placeholder for additional menu items) */}
      <View style={styles.menu}>
        {/* Your existing menu items */}
      </View>
    </View>
  );
}

function HistoryScreen() {
  const { qrCodes } = useContext(QRCodeContext); // Access context

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>History Screen</Text>
      <FlatList
        data={qrCodes}
        renderItem={({ item }) => (
          <View style={styles.dataBox}>
            <Text style={styles.dataText}>{item}</Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
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

// Main App component with bottom tab navigation
export default function App() {
  const [qrCodes, setQrCodes] = useState([]); // State to hold QR codes

  return (
    <QRCodeContext.Provider value={{ qrCodes, setQrCodes }}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              let iconName;

              // Set different icons for each tab
              if (route.name === 'QR Scanner') {
                iconName = 'qr-code-outline';
              } else if (route.name === 'History') {
                iconName = 'time-outline';
              } else if (route.name === 'Settings') {
                iconName = 'settings-outline';
              } else if (route.name === 'Profile') {
                iconName = 'person-outline';
              }

              // Return the appropriate icon
              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
          tabBarOptions={{
            activeTintColor: 'tomato', // Active tab color
            inactiveTintColor: 'gray', // Inactive tab color
          }}
        >
          <Tab.Screen name="QR Scanner" component={QRScannerScreen} />
          <Tab.Screen name="History" component={HistoryScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </QRCodeContext.Provider>
  );
}

// StyleSheet for styling components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fa5da2', 
  },
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f0fc", // light purple background
  },
  banner: {
    backgroundColor: "#333", // dark background
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
    color: "white", 
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
  button: {
    backgroundColor: '#333',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
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
