import React, { useState, useEffect, createContext, useContext } from 'react';
import { Text, View, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CameraView, Camera } from 'expo-camera'; // 
import { Ionicons } from '@expo/vector-icons'; // The icons used in the navigation bar
import axios from 'axios'; // Import Axios for HTTP requests for the VT API call


// Create a Context for QR code data
const QRCodeContext = createContext();

const Tab = createBottomTabNavigator();

// Component for QR Scanner Screen
function QRScannerScreen() {
  const { qrCodes, setQrCodes } = useContext(QRCodeContext); // Access context
  const [hasPermission, setHasPermission] = useState(null); // State for camera permission
  const [scanned, setScanned] = useState(false); // State for scanned status
  const [showSplash, setShowSplash] = useState(true); // State for splash screen
  const [scannedData, setScannedData] = useState(''); // State for scanned data
  const [scanResult, setScanResult] = useState(null); // State for VirusTotal scan result

  useEffect(() => {
    const initializeApp = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync(); // Request camera permissions
      setHasPermission(status === 'granted'); // Set permission status
      setShowSplash(false); // Hide splash screen
    };

    initializeApp(); // Initialize app
  }, []);

// Function to handle barcode scanned event
  const handleBarCodeScanned = async ({ type, data }) => {
  setScanned(true); // Mark as scanned

  // Determine the type of data (URL, text, or just numbers)
    let dataType;
    if (/^(http|https):\/\//.test(data)) {
      dataType = 'URL';
    } else if (/^[0-9]+$/.test(data)) {
      dataType = 'Numbers';
    } else {
      dataType = 'Text';
    }

  // Construct the scanned data with the data type
  let newScannedData = `Type: ${dataType}\nData: ${data}`; // Initialize with type and data

    try {
    const scanId = await scanWithVirusTotal(data); // Send data to VirusTotal and get scan ID
    const positive = await getScanResult(scanId); // Get scan result and extract positive score
    newScannedData += `\nScore: ${positive}`; // Append positive score to newScannedData
    } catch (error) {
    console.error('Error handling barcode scan:', error); // Handle error
    }

  setScannedData(newScannedData); // Save scanned data
  setQrCodes([...qrCodes, newScannedData]); // Add scanned data to history
  };

// Function to send data to VirusTotal and get the scan ID
  const scanWithVirusTotal = async (data) => {
  const apiKey = '3566a17933bb36dd97cb35e84d0446e5ab8ad623e6de968d34b655c79485251e'; // Replace with your VirusTotal API key
    const url = 'https://www.virustotal.com/vtapi/v2/url/scan';
    const params = {
      apikey: apiKey,
      url: data
    };

    try {
    const response = await axios.post(url, null, { params }); // Send URL scan request
    return response.data.scan_id; // Return scan ID
    } catch (error) {
    console.error('Error scanning with VirusTotal:', error); // Handle error
    throw error; // Propagate error
    }
  };

// Function to get scan result from VirusTotal and return the positive score
  const getScanResult = async (scanId) => {
  const apiKey = '3566a17933bb36dd97cb35e84d0446e5ab8ad623e6de968d34b655c79485251e'; // Replace with your VirusTotal API key
    const url = 'https://www.virustotal.com/vtapi/v2/url/report';
    const params = {
      apikey: apiKey,
      resource: scanId
    };

    try {
    const response = await axios.get(url, { params }); // Get scan result
    return response.data.positives; // Return positive score
    } catch (error) {
    console.error('Error getting scan result:', error); // Handle error
    throw error; // Propagate error
    }
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
          {scanResult && <Text style={styles.dataText}>{JSON.stringify(scanResult)}</Text>}
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

// Component for History Screen
function HistoryScreen() {
  const { qrCodes } = useContext(QRCodeContext); // Access context

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>History Screen</Text>
      <FlatList
        data={qrCodes} // Data for FlatList
        renderItem={({ item }) => (
          <View style={styles.dataBox}>
            <Text style={styles.dataText}>{item}</Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()} // Key extractor for FlatList
      />
    </View>
  );
}

// Component for Settings Screen
function SettingsScreen() {
  const { setQrCodes } = useContext(QRCodeContext); // Access context

  // Function to clear history
  const clearHistory = () => {
    setQrCodes([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Settings Screen</Text>
      <TouchableOpacity style={styles.button} onPress={clearHistory}>
        <Text style={styles.buttonText}>Clear History</Text>
      </TouchableOpacity>
    </View>
  );
}

// Component for Profile Screen
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
    backgroundColor: '#f8f0fc',
    padding: 20,
  },
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f0fc",
  },
  scanText: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: "#ff69b4",
    marginVertical: 10,
  },
  instructionText: {
    textAlign: "center",
    fontSize: 16,
    color: "#000",
    marginBottom: 20,
  },
  cameraContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    overflow: "hidden",
  },
  camera: {
    width: "80%",
    height: "60%",
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
  welcomeText: {
    textAlign: "center",
    fontSize: 20,
    marginVertical: 10,
    color: "black", 
  },
});
