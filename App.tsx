import React, { useState, useEffect, createContext, useContext } from 'react';
import { Text, View, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CameraView, Camera } from 'expo-camera'; // The icons used in the navigation bar
import { Ionicons } from '@expo/vector-icons'; // Import Axios for HTTP requests for the VT API call
import axios from 'axios';
// Create a Context for QR code data
const QRCodeContext = createContext(null);

const Tab = createBottomTabNavigator();

// Component for QR Scanner Screen
const QRScannerScreen: React.FC = () => {
  const { qrCodes, setQrCodes } = useContext(QRCodeContext); // Access context
  const [hasPermission, setHasPermission] = useState<boolean | null>(null); // State for camera permission
  const [scanned, setScanned] = useState<boolean>(false); // State for scanned status
  const [showSplash, setShowSplash] = useState<boolean>(true); // State for splash screen
  const [scannedData, setScannedData] = useState<string>(''); // State for scanned data
  const [scanResult, setScanResult] = useState<any>(null); // State for VirusTotal scan result


  useEffect(() => {
    const initializeApp = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync(); // Request camera permissions
      setHasPermission(status === 'granted'); // Set permission status
      setShowSplash(false); // Hide splash screen
    };

    initializeApp(); // Initialize app
  }, []);



  // Function to handle barcode scanned event
  const handleQRCodeSanned = async ({ type, data }: { type: string; data: string }) => {
    setScanned(true);// Mark as scanned

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
  const scanWithVirusTotal = async (data: any) => {
    const apiKey = '3566a17933bb36dd97cb35e84d0446e5ab8ad623e6de968d34b655c79485251e'; // 4/min , 500/day
    const url = 'https://www.virustotal.com/vtapi/v2/url/scan';
    const params = {
      apikey: apiKey,
      url: data
    };

    // The axios to handle URL stuff
    try {
      const response = await axios.post(url, null, { params });
      return response.data.scan_id; // Return scanID
    } catch (error) {
      console.error('Error scanning with VirusTotal:', error);
      throw error;
    }
  };

  // Get the full list of scanned result based on scanID from
  // response above, Only want response.data.positive
  const getScanResult = async (scanId: Int32Array) => {
    const apiKey = '3566a17933bb36dd97cb35e84d0446e5ab8ad623e6de968d34b655c79485251e';
    const url = 'https://www.virustotal.com/vtapi/v2/url/report';
    const params = {
      apikey: apiKey,
      resource: scanId
    };

    // The axios to handle URL stuff
    try {
      const response = await axios.get(url, { params });
      return response.data.positives;  // Reture the value of positive:
    } catch (error) {
      console.error('Error getting scan result:', error);
      throw error;
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
          onBarcodeScanned={scanned ? undefined : handleQRCodeSanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr', 'pdf417'] }}
          style={styles.camera}
        />
      </View>

      {/* Display scanned data */}
      {scannedData !== '' && (
        <View style={styles.dataBox}>
          <Text style={styles.dataText}>{scannedData}</Text>
          {scanResult && <Text style={styles.dataText}>{JSON.stringify(scanResult)}</Text>}
        </View>
      )}
    </View>
  );
};


// Component for History Screen
function HistoryScreen() {
  const { qrCodes } = useContext(QRCodeContext);

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

  const clearHistory = () => {setQrCodes([]);}; // To clear History

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

// Custom Tab Bar Component
const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined
          ? options.tabBarLabel
          : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        // Set different icons for each tab
        const iconName = route.name === 'QR Scanner' ? 'camera' 
        : route.name === 'History' ? 'time' 
        : route.name === 'Settings' ? 'settings' : 'person';

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
          >
            <Ionicons name={iconName} size={24} color={isFocused ? '#673ab7' : '#222'} />
            <Text style={{ color: isFocused ? '#673ab7' : '#222' }}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
      <View style={styles.floatingButton}>
        <TouchableOpacity onPress={() => {navigation.navigate('QR Scanner');}}>
          <Ionicons name="camera" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};








// Main App component with bottom tab navigation
export default function App() {
  const [qrCodes, setQrCodes] = useState([]); // State to hold QR codes

  return (
    <QRCodeContext.Provider value={{ qrCodes, setQrCodes }}>
      <NavigationContainer>
        <Tab.Navigator tabBar={props => <CustomTabBar {...props} />}>
          <Tab.Screen name="History" component={HistoryScreen} />
          <Tab.Screen name="QR Scanner" component={QRScannerScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </QRCodeContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f0fc',
    padding: 20,
  },
  banner:{},
  headerText:{},
  
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
    width: '100%',
    height: '100%',
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
  tabBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 5,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    left: '50%', // Position from the left
    marginLeft: -30, // Half of the button width to center it
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#673ab7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },



});
