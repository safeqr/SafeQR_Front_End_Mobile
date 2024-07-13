import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Image } from 'react-native';
import { Camera, CameraView, scanFromURLAsync } from 'expo-camera';
import { QRCodeContext } from '../types';
import axios from 'axios'; // For URL calls
import { Ionicons } from '@expo/vector-icons'; // For icons
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import ScannedDataBox from '../components/ScannedDataBox';
import { useDispatch } from 'react-redux';
import { addQRCode } from '../actions/qrCodeActions'; // Assuming you have actions defined for Redux
import { detectQRCodeType, verifyURL, checkRedirects } from '../api/qrCodeAPI'; // Import utility functions

// Main Function
const QRScannerScreen: React.FC<{ clearScanData: () => void }> = ({ clearScanData }) => {
  const navigation = useNavigation(); // call Navigation bar
  const dispatch = useDispatch(); // Use dispatch for Redux actions

  const [showSplash, setShowSplash] = useState<boolean>(true); // call splash screen
  const qrCodeContext = useContext(QRCodeContext); // From ./types.ts
  const { qrCodes, setQrCodes } = qrCodeContext || { qrCodes: [], setQrCodes: () => {} };

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState<boolean>(false);
  const [scannedData, setScannedData] = useState<string>(''); // State for QR scanned Data
  const [dataType, setDataType] = useState<string>(''); // State for data type
  const [enableTorch, setEnableTorch] = useState<boolean>(false); // State for torch

  // Add state variables for scan results
  const [secureConnection, setSecureConnection] = useState<boolean | null>(null);
  const [virusTotalCheck, setVirusTotalCheck] = useState<boolean | null>(null);
  const [redirects, setRedirects] = useState<number | null>(null);

  // Request Camera Permission and initialize the app
  useEffect(() => {
    const initializeApp = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      setShowSplash(false);
      console.log("Camera permissions initialized");
    };

    initializeApp();
  }, []);

  // Clear Scan Data
  const clearScanDataInternal = () => {
    setScannedData('');
    setScanned(false);
    setDataType('');
    console.log("Scan data cleared");
  };

  // Handle QR Code Payload
  const handlePayload = async (payload: string) => {
    setScanned(true);
    console.log("Scanning Completed. Payload is:", payload);

    const type = await detectQRCodeType(payload);
    const secureConnectionResult = await verifyURL(payload);
    const redirectResult = await checkRedirects(payload);

    setSecureConnection(secureConnectionResult.isSecure);
    setVirusTotalCheck(!secureConnectionResult.isMalicious); // Assuming you have virusTotalCheck logic integrated here
    setRedirects(redirectResult.redirects);

    const qrCode = {
      data: payload,
      type,
      scanResult: {
        secureConnection: secureConnectionResult.isSecure,
        virusTotalCheck: !secureConnectionResult.isMalicious,
        redirects: redirectResult.redirects
      },
      bookmarked: false // by default
    };

    setScannedData(payload);
    console.log("Payload received:", payload);
    console.log("Type received from server:", type);
    setDataType(type);
    dispatch(addQRCode(qrCode)); // Dispatch action to save QR code data
    console.log("QR code data added to history");
  };

  // Send QR Code Data to Backend Server
  const sendToAPIServer = async (payload: string): Promise<string> => {
    console.log('Sending QR code data to backend:', payload);

    try {
      const response = await axios.post('https://localhost:8443/v1/api/qrcodetypes/detect', {
        data: payload,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Response from backend:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error detecting QR code type:', error);
      return 'UNKNOWN';
    }
  };

  // Toggle Torch (Flashlight)
  const toggleTorch = () => {
    setEnableTorch((prev) => !prev);
    console.log("Torch toggled:", enableTorch ? "off" : "on");
  };

  // Handle Test Scan
  const handleTestScan = () => {
    handlePayload('TEST123');
    console.log("Test scan executed");
  };

  // Read QR Code from Image
  const readQRFromImage = async () => {
    clearScanDataInternal();
    console.log("Reading QR code from image");

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // Don't ask user to crop images
      quality: 1,
    });

    if (result && result.assets && result.assets.length > 0 && result.assets[0].uri) { // Ensure the uri is not empty 
      try {
        const scannedResult = await scanFromURLAsync(result.assets[0].uri);
        if (scannedResult && scannedResult[0] && scannedResult[0].data) {
          handlePayload(scannedResult[0].data);
          // Not sure why scannedResult.data is undefined but access as array work, KIV
          console.log('QR code data from image:', scannedResult[0].data);
        } else {
          setScannedData("No QR Code Found");
          setTimeout(() => setScannedData(""), 4000);
          console.log("No QR code found in the selected image");
        }
      } catch (error) {
        console.error('Error scanning QR code from image:', error);
        Alert.alert('Failed to scan QR code from image.');
      }
    }
  };

  // Clear scan data when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      clearScanDataInternal();
      console.log("Screen focused, scan data cleared");
    });
    return unsubscribe;
  }, [navigation]);

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
        <Text style={styles.headerText}>SafeQR v0.89</Text>
      </View>
      <Text style={styles.welcomeText}>Welcome to SafeQR code Scanner</Text>

      <View style={styles.cameraContainer}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : ({ data }) => handlePayload(data)}
          barcodeScannerSettings={{ barcodeTypes: ['qr', 'pdf417'] }}
          style={styles.camera}
          enableTorch={enableTorch}
        />

        <TouchableOpacity onPress={toggleTorch} style={styles.flashButton}>
          <Ionicons name="flashlight" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleTestScan} style={styles.testButton}>
          <Ionicons name="bug" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={readQRFromImage} style={styles.galleryButton}>
          <Ionicons name="image" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {scannedData !== '' && (
        <View style={styles.scannedDataBox}>
          <ScannedDataBox
            data={scannedData}
            dataType={dataType}
            clearScanData={clearScanDataInternal}
            scanResult={{
              secureConnection,
              virusTotalCheck,
              redirects
            }}
          />
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
