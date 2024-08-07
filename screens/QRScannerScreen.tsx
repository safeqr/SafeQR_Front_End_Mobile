import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Modal, Image, Dimensions } from 'react-native';
import { Camera, CameraView, scanFromURLAsync } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import ScannedDataBox from '../components/ScannedDataBox';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { scanQRCode, getUserInfo } from '../api/qrCodeAPI';
import SettingsScreen from './SettingsScreen';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const QRScannerScreen: React.FC<{ clearScanData: () => void }> = ({ clearScanData }) => {
  const navigation = useNavigation(); // Navigation hook
  const dispatch = useDispatch<AppDispatch>(); // Use dispatch for Redux actions

  // State variables
  const [showSplash, setShowSplash] = useState<boolean>(true); // State for splash screen visibility
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState<boolean>(false);
  const [qrCodeId, setQRCodeId] = useState<string | null>(null); // State for QR code ID
  const [enableTorch, setEnableTorch] = useState<boolean>(false); // State for torch
  const [cameraVisible, setCameraVisible] = useState<boolean>(true); // State to control camera visibility
  const [isScannedDataBoxVisible, setIsScannedDataBoxVisible] = useState<boolean>(false); // State for ScannedDataBox modal visibility
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState<boolean>(false); // State for modal visibility

  // Request Camera Permission and initialize the app
  useEffect(() => {
    const initializeApp = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      setShowSplash(false);
      console.log("Camera permissions initialized");

      // Fetch and log user information
      fetchUserInformation();
    };

    initializeApp();
  }, []);

  // Focus effect to enable camera and clear data on focus
  useFocusEffect(
    useCallback(() => {
      setCameraVisible(true);
      clearScanDataInternal();
      console.log("Screen focused, scan data cleared and camera enabled");

      return () => {
        setCameraVisible(false);
        console.log("Screen unfocused, camera disabled");
      };
    }, [navigation])
  );

  // Clear Scan Data
  const clearScanDataInternal = () => {
    setScanned(false);
    setQRCodeId(null);
    console.log("Scan data cleared");
  };

  // Handle scanning of payload (QR code data) and get the QR-ID
  const handlePayload = async (payload: string) => {
    setScanned(true);
    console.info("Decoded QR Code, Payload is: ", payload);

    try {
      const response = await scanQRCode(payload);
      const qrCodeId = response.qrcode.data.id;
      // Store the QR code ID for later use
      setQRCodeId(qrCodeId);
      setIsScannedDataBoxVisible(true); // Show ScannedDataBox modal

      // Optionally, show a message or perform another action
      console.log("QR code scanned successfully, ID:", qrCodeId);
    } catch (error) {
      console.error("Error scanning QR code:", error);
    }
  };

  // Fetch and log user information
  const fetchUserInformation = async () => {
    try {
      const userInfo = await getUserInfo();
      console.log('User Info:', userInfo);
    } catch (error) {
      console.error('Error fetching user information:', error);
    }
  };

  // Toggle torch (flashlight) on/off
  const toggleTorch = () => {
    setEnableTorch((prev) => !prev);
    console.log("Torch toggled:", enableTorch ? "off" : "on");
  };

  // Read QR from image
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
          console.log('QR code data from image:', scannedResult[0].data);
        } else {
          console.log("No QR code found in the selected image");
        }
      } catch (error) {
        console.error('Error scanning QR code from image:', error);
      }
    }
  };

  // Conditional rendering based on state
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
      <Text style={styles.titleText}>Welcome to</Text>
      <Image source={require('../assets/SafeQR_Logo 1.png')} style={styles.logo} />
      <Text style={styles.welcomeText}>Please point the camera at the QR Code</Text>

      <View style={styles.cameraContainer}>
        {cameraVisible && (
          <CameraView
            onBarcodeScanned={scanned ? undefined : ({ data }) => handlePayload(data)}
            barcodeScannerSettings={{ barcodeTypes: ['qr', 'pdf417'] }}
            style={styles.camera}
            enableTorch={enableTorch}
          />
        )}

        <TouchableOpacity onPress={toggleTorch} style={styles.flashButton}>
          <Ionicons name="flashlight" size={screenWidth * 0.06} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={readQRFromImage} style={styles.galleryButton}>
          <Ionicons name="image" size={screenWidth * 0.06} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Scanned Data Box */}
      {isScannedDataBoxVisible && (
        <View style={styles.scannedDataBoxPopup}>
          <ScannedDataBox
            qrCodeId={qrCodeId}
            clearScanData={() => setIsScannedDataBoxVisible(false)}
          />
        </View>
      )}

      {/* Settings Icon */}
      <TouchableOpacity onPress={() => setIsSettingsModalVisible(true)} style={styles.settingsButton}>
        <Ionicons name="settings" size={screenWidth * 0.06} color="#000" />
      </TouchableOpacity>

      {/* Settings Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isSettingsModalVisible}
        onRequestClose={() => setIsSettingsModalVisible(false)}
        style={styles.settingsModal}
      >
        <View style={styles.settingsModalContainer}>
          <View style={styles.settingsModalContent}>
            <SettingsScreen />
            <TouchableOpacity onPress={() => setIsSettingsModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f0fc',
    padding: 20,
  },
  titleText: {
    textAlign: 'center',
    fontSize: 20,
    marginTop: screenHeight * 0.05,
    color: 'black',
  },
  logo: {
    alignSelf: 'center',
    width: screenWidth * 0.5,
    height: screenWidth * 0.2,
    resizeMode: 'contain',
    marginVertical: 10,
  },
  welcomeText: {
    textAlign: 'center',
    fontSize: 20,
    marginVertical: 10,
    color: 'black',
  },
  cameraContainer: {
    height: '60%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    overflow: 'hidden',
  },
  settingsButton: {
    position: 'absolute',
    top: screenHeight * 0.05,
    right: 20,
  },
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f0fc',
    height: '100%',
    width: '100%',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  flashButton: {
    position: 'absolute',
    bottom: screenHeight * 0.025,
    left: screenWidth * 0.2,
    width: screenWidth * 0.125,
    height: screenWidth * 0.125,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: screenWidth * 0.0625,
  },
  galleryButton: {
    position: 'absolute',
    bottom: screenHeight * 0.025,
    right: screenWidth * 0.2,
    width: screenWidth * 0.125,
    height: screenWidth * 0.125,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: screenWidth * 0.0625,
  },
  scannedDataBoxPopup: {
    position: 'absolute',
    top: '10%',
    left: '5%',
    right: '5%',
    zIndex: 2,
    backgroundColor: 'white',
    borderRadius: screenWidth * 0.025,
    padding: screenWidth * 0.025,
    elevation: 5,
  },

  settingsModal: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  settingsModalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  settingsModalContent: {
    width: '100%',
    height: '80%',
    backgroundColor: 'white',
    padding: screenWidth * 0.05,
    borderTopLeftRadius: screenWidth * 0.025,
    borderTopRightRadius: screenWidth * 0.025,
    alignItems: 'center',
  },
  closeButton: {
    marginTop: screenHeight * 0.01,
    padding: screenWidth * 0.025,
    backgroundColor: '#ff69b4',
    borderRadius: screenWidth * 0.0125,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default QRScannerScreen;
