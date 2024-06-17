import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Button, Alert } from 'react-native';
import { Camera, CameraView, scanFromURLAsync } from 'expo-camera';
import { QRCodeContext } from '../types';
import axios from 'axios'; // For URL calls
import { Ionicons } from '@expo/vector-icons'; // For icons
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

//-----------------FUNCTIONS DECLARED HERE------------------//
// Function to determine the type of data
const determineDataType = (data: string): string => {
  if (/^(http|https):\/\//.test(data)) {
    return 'URL';
  } else if (/^[0-9]+$/.test(data)) {
    return 'Number';
  } else if (/^mailto:/.test(data)) {
    return 'Email';
  } else if (/^tel:/.test(data)) {
    return 'Phone Number';
  } else if (/^smsto:/.test(data)) {
    return 'SMS';
  } else {
    return 'Text';
  }
};

// Function to handle VirusTotal scanning
const processWithVirusTotal = async (data: string) => {
  const apiKey = 'YOUR_VIRUSTOTAL_API_KEY';
  const url = 'https://www.virustotal.com/vtapi/v2/url/scan';
  const params = {
    apikey: apiKey,
    url: data,
  };

  try {
    const response = await axios.post(url, null, { params });
    return response.data.scan_id;
  } catch (error) {
    console.error('Error scanning with VirusTotal:', error);
    throw error;
  }
};

// Function to get VirusTotal scan results
const getVirusTotalResults = async (scanId: string) => {
  const apiKey = 'YOUR_VIRUSTOTAL_API_KEY';
  const url = 'https://www.virustotal.com/vtapi/v2/url/report';
  const params = {
    apikey: apiKey,
    resource: scanId,
  };

  try {
    const response = await axios.get(url, { params });
    return response.data.positives;
  } catch (error) {
    console.error('Error getting scan result:', error);
    throw error;
  }
};

// Define the props for QRScannerScreen
interface QRScannerScreenProps {
  clearScanData: () => void;
}

//-----------------Main------------------//
const QRScannerScreen: React.FC<QRScannerScreenProps> = ({ clearScanData }) => {

  const navigation = useNavigation(); // call Navigation bar
  const [showSplash, setShowSplash] = useState<boolean>(true); // call splash screen

  // These are for .....
  const qrCodeContext = useContext(QRCodeContext); // From ./tpes.ts

  // this function stores the scanned data for the history page
  const { qrCodes, setQrCodes } = qrCodeContext || { qrCodes: [], setQrCodes: () => {} };

  // Camera permission and scan state
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState<boolean>(false);

  
  const [scannedData, setScannedData] = useState<string>(''); // State for QR scanned Data
  const extractedData = scannedData.split('\n')[1]?.split('Data: ')[1] || ''; // Split


  const [scanResult, setScanResult] = useState<any>(null); // State for VirusTotal scan result
  const [dataType, setDataType] = useState<string>(''); // State for data type
  const [enableTorch, setEnableTorch] = useState<boolean>(false); // State for torch

  useEffect(() => {
    const initializeApp = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      setShowSplash(false);
    };

    initializeApp();
  }, []);

  // If loading this screen , reset the scanning data
  const clearScanDataInternal = () => {
    setScannedData('');
    setScanResult(null);
    setScanned(false);
    setDataType('');
  };

  // The function that takes data from <Cameraview onBarcodeScanned
  const handleQRCodeScanned = async ({ data }: { type: string; data: string }) => {
    setScanned(true); //Flag is QR code already scanned

    const dataType = determineDataType(data);
    setDataType(dataType);

    let newScannedData = `Type: ${dataType}\nData: ${data}`;

    try {
      const scanId = await processWithVirusTotal(data);
      const positive = await getVirusTotalResults(scanId);
      newScannedData += `\nScore: ${positive}`;
      setScanResult({ positive, scanId });
    } catch (error) {
      console.error('Error handling barcode scan:', error);
    }

    setScannedData(newScannedData);
    setQrCodes([...qrCodes, newScannedData]);
  };

  // If the focus is lost focus on this screen , when come reset the scan data
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      clearScanDataInternal();
    });
    return unsubscribe;
  }, [navigation]);

  // This function is for toggling torch
  const toggleTorch = () => {
    setEnableTorch((prev) => !prev);
  };

  // This is hardcoded function for testing
  const handleTestScan = () => {
    handleQRCodeScanned({ type: 'TEST', data: 'TEST123' });
  };



//https://medium.com/@funti009/create-a-mobile-qr-scanner-that-scans-via-camera-and-image-in-the-gallery-react-native-expo-ee7098a265d7
// Refactored to use Camera.scanFromURLAsync instead
 // Function to handle QR code scanning from the image picker


 const handleImagePicker = async () => {
  clearScanDataInternal();
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: false, // Disabling the crop functionality
    quality: 1,
  });


  //if (result && result.assets[0].uri) { // KIV this....
  if (result && result.assets && result.assets.length > 0 && result.assets[0].uri) { // this is to unsure the uri is not empty 
    try {
      const scannedResult = await scanFromURLAsync(result.assets[0].uri);
      if (!scannedResult.data) { // This will check if no QR was scanned
        // Not sure why by passing the scannedResults.data is not working , only works when I use scannedResults[0].data.....  KIV >.<
        const dataNeeded = scannedResult[0].data;  
        handleQRCodeScanned({ type: 'QR_CODE', data: dataNeeded });
      } else {
        setScannedData("No QR Code Found");
        setTimeout(() => setScannedData(""), 4000);
      }
    } catch (error) {
      console.error('Error scanning QR code from image:', error);
      Alert.alert('Failed to scan QR code from image.');
    }
  }
};



  // For Splash, for some reason need to be near the end of the function...
  // or else permission for camera is not asked
  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <ActivityIndicator size="large" color="#ff69b4" />
      </View>
    );
  }

  // While asking for permission the page behind will render this only
  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }

  // this will thrown on the screen and nothing else will load if no permission
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  //---------------The UI part-----------------//
  return (
    <View style={styles.container}>
      {/* Banner section */}
      <View style={styles.banner}>
        <Text style={styles.headerText}>SafeQR v0.70</Text>
      </View>
      {/* Welcome Text */}
      <Text style={styles.welcomeText}>Welcome to SafeQR code Scanner</Text>

      {/* The cutout for the camera */}
      <View style={styles.cameraContainer}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleQRCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr', 'pdf417'] }}
          style={styles.camera}
          enableTorch={enableTorch}
        />

        {/* the torch icon floating above the CameraView */}
        <TouchableOpacity onPress={toggleTorch} style={styles.flashButton}>
          <Ionicons name="flashlight" size={24} color="#fff" />
          {enableTorch}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleTestScan} style={styles.testButton}>
          <Ionicons name="bug" size={24} color="#fff" />
          

        {/* the image icon for opening album/gallery */}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleImagePicker} style={styles.galleryButton}>
  <Ionicons name="image" size={24} color="#fff" />
</TouchableOpacity>

      </View>

      {/* The CONTENT , the popup for the scanned data */}
      {scannedData !== '' && (
        <View style={styles.dataBox}>
          <Text style={styles.dataUrl}>{extractedData}</Text>
          <View style={styles.divider} />
          <Text style={styles.timestampText}>{new Date().toLocaleString()}</Text>
          <Text style={styles.resultText}>Result: {scanResult && scanResult.positive > 0 ? 'DANGEROUS' : 'SAFE'}</Text>
          <View style={styles.divider} />
          <Text style={styles.typeText}>Type: {dataType}</Text>
          <Text style={styles.checksText}>Checks</Text>
          <Text style={styles.checksText}>Secure Connection: ✘</Text>
          <Text style={styles.checksText}>Virus Total Check: ✘</Text>
          <Text style={styles.checksText}>Redirects: 2</Text>
          <View style={styles.iconContainer}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="share-social" size={24} color="#2196F3" />
              <Text style={styles.iconText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="open" size={24} color="#2196F3" />
              <Text style={styles.iconText}>Open</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

//--------------------The CSS----------------//
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f0fc',
    padding: 20,
  },
  banner: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff69b4',
  },
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f0fc',
  },
  cameraContainer: {
    height: '60%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    overflow: 'hidden',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  flashButton: {
    position: 'absolute',
    bottom: 20,
    left: 100, // Adjust this value to move it more or less to the left
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 25, // Half of width and height to make it a circle
  },
  dataBox: {
    position: 'absolute',
    top: '10%',
    left: '5%',
    right: '5%',
    padding: 20,
    backgroundColor: '#ffe6f0',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    zIndex: 1, // Ensure it appears above other elements
  },
  dataUrl: {
    fontSize: 16,
    color: '#000',
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  timestampText: {
    fontSize: 12,
    color: '#000',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 16,
    color: '#ff0000',
    marginBottom: 10,
  },
  typeText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 10,
  },
  checksText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 5,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  iconButton: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  iconText: {
    color: '#2196F3',
    marginTop: 5,
  },
  welcomeText: {
    textAlign: 'center',
    fontSize: 20,
    marginVertical: 10,
    color: 'black',
  },
  testButton: {
    position: 'absolute',
    bottom: 1,
    alignSelf: 'stretch',
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 5,
    // Ensure the button appears above other elements
  },
  galleryButton: {
    position: 'absolute',
    bottom: 20,
    right: 100, // Adjust this value to move it more or less to the right
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 25, // Half of width and height to make it a circle
  },
  
});

export default QRScannerScreen;
