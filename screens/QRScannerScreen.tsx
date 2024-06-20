import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Image, BackHandler } from 'react-native';
import { Camera, CameraView, scanFromURLAsync } from 'expo-camera';
import { QRCodeContext } from '../types';
import axios from 'axios'; // For URL calls
import { Ionicons } from '@expo/vector-icons'; // For icons
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import QRCode from 'react-native-qrcode-svg';
import ScannedDataBox from '../components/ScannedDataBox';


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
  const apiKey = '3566a17933bb36dd97cb35e84d0446e5ab8ad623e6de968d34b655c79485251e';
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
  const apiKey = '3566a17933bb36dd97cb35e84d0446e5ab8ad623e6de968d34b655c79485251e';
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

  // The function  takes data from Cameraview.onBarcodeScanned
  const handleQRCodeScanned = async ({ data }: { type: string; data: string }) => {
    setScanned(true); //Flag is QR code already scanned

    const dataType = determineDataType(data);
    setDataType(dataType);

    let newScannedData = `Type: ${dataType}\nData: ${data}`;

    let scanResult = {
      secureConnection: false,
      virusTotalCheck: false,
      redirects: 0
    };

    try {
      const scanId = await processWithVirusTotal(data);
      const positive = await getVirusTotalResults(scanId);
      newScannedData += `\nScore: ${positive}`;
      scanResult = {
        secureConnection: true, // Assume secure connection if we get here
        virusTotalCheck: positive === 0, // Safe if no positive results
        redirects: 2 // Arbitrary value, replace with real data if available
      };
    } catch (error) {
      console.error('Error handling barcode scan:', error);
    }

    const qrCode = {
      data: newScannedData,
      bookmarked: false,
      scanResult
    };

    setScannedData(newScannedData);
    setQrCodes([...qrCodes, qrCode]);
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

  // https://medium.com/@funti009/create-a-mobile-qr-scanner-that-scans-via-camera-and-image-in-the-gallery-react-native-expo-ee7098a265d7
  // Refactored to use Camera.scanFromURLAsync instead
  // Function to handle QR code scanning from the image picker
  const handleImagePicker = async () => {
    clearScanDataInternal();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // Don't ask user to crop images
      quality: 1,
    });

    // if (result && result.assets[0].uri) { // KIV this....
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

  // Add back button handler to clear scanned data
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      clearScanDataInternal();
      return true;
    });

    return () => backHandler.remove();
  }, []);

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
        <Text style={styles.headerText}>SafeQR v0.89</Text>
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
        </TouchableOpacity>

        {/* the image icon for opening album/gallery */}
        <TouchableOpacity onPress={handleImagePicker} style={styles.galleryButton}>
          <Ionicons name="image" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {/* The CONTENT , the popup for the scanned data */}
      {/* This is called from ../components/ScannedDataBox*/}
      {scannedData !== '' && (
        <View style={styles.scannedDataBox}>
          <ScannedDataBox data={scannedData} scanResult={scanResult} dataType={dataType} clearScanData={clearScanDataInternal} />
        </View>
      )}
    </View>
  );
};

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
    left: 100,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 25,
  },
  testButton: {
    position: 'absolute',
    bottom: 1,
    alignSelf: 'stretch',
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 5,
  },
  galleryButton: {
    position: 'absolute',
    bottom: 20,
    right: 100,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 25,
  },
  scannedDataBox: {
    position: 'absolute',
    top: '10%',
    height: '100%',
    left: '5%',
    right: '5%',

    zIndex: 2,
  },
  welcomeText: {
    textAlign: 'center',
    fontSize: 20,
    marginVertical: 10,
    color: 'black',
  },
});

export default QRScannerScreen;
