import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Modal } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, useCodeScanner } from 'react-native-vision-camera';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ScannedDataBox from '../components/ScannedDataBox';
import { scanQRCode } from '../api/qrCodeAPI';
import SettingsScreen from './SettingsScreen';
import {scanFromURLAsync } from 'expo-camera';


const { width: screenWidth, height: screenHeight } = Dimensions.get('window');




const QRScannerScreen: React.FC = () => {
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState<boolean>(false);
  const [enableTorch, setEnableTorch] = useState<boolean>(false);
  const [scanned, setScanned] = useState<boolean>(false);
  const [qrCodeId, setQRCodeId] = useState<string | null>(null); // State for QR code ID
  const [isScannedDataBoxVisible, setIsScannedDataBoxVisible] = useState<boolean>(false); // State for ScannedDataBox visibility

  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');

  useEffect(() => {
    requestPermission();
  }, []);

  const handlePayload = async (payload: string) => {
    setScanned(true);
    console.info("Decoded QR Code, Payload is: ", payload);

    try {
      const response = await scanQRCode(payload);
      const qrCodeId = response.qrcode.data.id;
      // Store the QR code ID for later use
      setQRCodeId(qrCodeId);
      setIsScannedDataBoxVisible(true); // Show ScannedDataBox pop-up
      console.log("QR code scanned successfully, ID:", qrCodeId);
    } catch (error) {
      console.error("Error scanning QR code:", error);
    }
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'], // Only scan QR codes
    onCodeScanned: (codes) => {
      if (!scanned && codes[0]?.value) {
        handlePayload(codes[0].value); // Extract and handle the value only if it exists
      }
    }
  });

  const readQRFromImage = async () => {
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

  if (!hasPermission) {
    return <Text>Requesting camera permission...</Text>;
  }

  if (!device) {
    return <Text>Loading camera...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Welcome to</Text>
      <Image source={require('../assets/SafeQR_Logo 1.png')} style={styles.logo} />
      <Text style={styles.welcomeText}>Please point the camera at the QR Code</Text>

      <View style={styles.cameraContainer}>
        {device && (
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={true}
            torch={enableTorch ? 'on' : 'off'}
            codeScanner={codeScanner}
          />
        )}

        {/* Torch Button */}
        <TouchableOpacity
          onPress={() => device.hasFlash && setEnableTorch((prev) => !prev)}
          style={styles.flashButton}
          disabled={!device.hasFlash}
        >
          <Ionicons
            name={device.hasFlash ? 'flashlight' : 'flashlight-outline'}
            size={screenWidth * 0.06}
            color={device.hasFlash ? "#fff" : "#888"}
          />
        </TouchableOpacity>

        {/* Gallery Button */}
        <TouchableOpacity onPress={readQRFromImage} style={styles.galleryButton}>
          <Ionicons name="image" size={screenWidth * 0.06} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Scanned Data Box as a pop-up */}
      {isScannedDataBoxVisible && (
        <View style={styles.scannedDataBoxPopup}>
          <ScannedDataBox
            qrCodeId={qrCodeId!}
            clearScanData={() => {
              setScanned(false);
              setIsScannedDataBoxVisible(false);
            }}
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
    height: '50%',
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
    top: '20%', 
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
