import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Modal, Animated } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, useCodeScanner } from 'react-native-vision-camera';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import RNQRGenerator from 'rn-qr-generator';
import ScannedDataBox from '../components/ScannedDataBox';
import { scanQRCode, getQRTips } from '../api/qrCodeAPI';
import SettingsScreen from './SettingsScreen';
import NetInfo from '@react-native-community/netinfo';
import { useFocusEffect } from '@react-navigation/native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const QRScannerScreen: React.FC<{ clearScanData: () => void }> = ({ clearScanData }) => {
  // State management
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState<boolean>(false);
  const [enableTorch, setEnableTorch] = useState<boolean>(false);
  const [scanned, setScanned] = useState<boolean>(false);
  const [qrCodeId, setQRCodeId] = useState<string | null>(null);
  const [isScannedDataBoxVisible, setIsScannedDataBoxVisible] = useState<boolean>(false);
  const [bannerOpacity] = useState(new Animated.Value(0));
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [qrTip, setQrTip] = useState<string>('Always scan QR codes from trusted sources');
  const [scannedDataBoxY] = useState(new Animated.Value(screenHeight)); // Start off-screen

  // Camera permissions and device management
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');

  const fetchTips = async () => {
    try {
      const response = await getQRTips();
      setQrTip(response.tips); // Set the qrTip state to the value of the tips property
    } catch (error) {
      console.error('Error fetching QR tips:', error);
    }
  };

  // Only run when the screen is focusd
  useFocusEffect(
    React.useCallback(() => {
      requestPermission(); // Request camera permission when screen is focused

      // Initial fetch for QR tips
      fetchTips();

      // Set interval for fetching QR tips every 6 seconds
      const intervalId = setInterval(fetchTips, 6000);

      // Subscribe to network state updates
      const unsubscribe = NetInfo.addEventListener(state => {
        setIsConnected(state.isConnected);
        if (!state.isConnected) {
          showBanner(); // Show banner if the device goes offline
        }
      });

      return () => {
        clearInterval(intervalId); // Clear interval when screen is unfocused
        unsubscribe(); // Unsubscribe from network state updates
      };
    }, [])
  );

  const showScannedDataBox = () => {
    setIsScannedDataBoxVisible(true);
    Animated.timing(scannedDataBoxY, {
      toValue: 0, // Slide the modal to the top of the screen
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const hideScannedDataBox = () => {
    Animated.timing(scannedDataBoxY, {
      toValue: screenHeight, // Move it back off-screen
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setIsScannedDataBoxVisible(false);
    });
  };

  const clearSelectedQrCodeData = () => {
    console.log("!!!!!clearSelectedQrCodeData");
    setQRCodeId(null);
    hideScannedDataBox();
    setScanned(false); // Reset the scanned state so the camera can scan again
    clearScanData(); // Call the clearScanData passed from App.tsx
  };

  // Show an offline banner
  const showBanner = () => {
    Animated.timing(bannerOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(bannerOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }, 3000);
    });
  };

  const handlePayload = async (payload: string) => {
    setScanned(true);
    console.info("Decoded QR Code, Payload is: ", payload);

    try {
      const response = await scanQRCode(payload);
      const qrCodeId = response.qrcode.data.id;
      setQRCodeId(qrCodeId);
      showScannedDataBox(); // Show the ScannedDataBox pop-up with animation
    } catch (error) {
      console.error("Error scanning QR code:", error);
    }
  };

  // Use the camera to scan QR codes
  const codeScanner = useCodeScanner({
    codeTypes: ['qr'], // Only scan QR codes
    onCodeScanned: (codes) => {
      if (!scanned && codes[0]?.value) {
        handlePayload(codes[0].value); // Handle the QR code value
      }
    }
  });

  // Read QR code from an image
  const readQRFromImage = async () => {
    console.log("Reading QR code from image");

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (result && result.assets && result.assets.length > 0 && result.assets[0].uri) {
      try {
        const detectionResult = await RNQRGenerator.detect({
          uri: result.assets[0].uri,
        });

        const { values } = detectionResult;

        if (values.length > 0) {
          handlePayload(values[0]); // Handle the first detected QR code value
        } else {
          console.log("No QR code found in the selected image");
        }
      } catch (error) {
        console.error('Error scanning QR code from image:', error);
      }
    }
  };

  // Check for camera permissions
  if (!hasPermission) {
    return <Text>Requesting camera permission...</Text>;
  }

  // Wait for the device to be ready
  if (!device) {
    return <Text>Loading camera...</Text>;
  }
  return (
    <View style={styles.container}>
      {/* Banner for network connectivity */}
      <Animated.View style={[styles.banner, { opacity: bannerOpacity }]}>
        <Text style={styles.bannerText}>No Internet Connection</Text>
      </Animated.View>

      <Text style={styles.titleText}>Welcome to</Text>
      <Image source={require('../assets/SafeQR_Logo 1.png')} style={styles.logo} />
      <Text style={styles.welcomeText}>Please point the camera at the QR Code</Text>

      <View style={styles.cameraContainer}>
        {device && (
          <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={!isSettingsModalVisible && !isScannedDataBoxVisible} // Disable the camera when settings modal or ScannedDataBox is open
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

      {/* QR Code Tips Below Camera Container */}
      <View style={styles.tipsContainer}>
        <View style={styles.iconTextRow}>
          <Ionicons name="bulb" size={24} color="red" />
          <Text style={styles.tipsText}>{qrTip}</Text>
        </View>
      </View>

      {/* Scanned Data Box as a modal with sliding animation */}
<Modal
  transparent={true}
  visible={isScannedDataBoxVisible}
  animationType="none"
  onRequestClose={clearSelectedQrCodeData} // Call clearSelectedQrCodeData when the modal is requested to close
>
  <TouchableOpacity 
    style={styles.modalOverlay} 
    activeOpacity={1} 
    onPress={clearSelectedQrCodeData} // Call clearSelectedQrCodeData on press
  >
    <Animated.View style={[styles.modalContainer, { transform: [{ translateY: scannedDataBoxY }] }]}>
      <ScannedDataBox
        qrCodeId={qrCodeId!}
        clearScanData={clearSelectedQrCodeData} // Close modal and reset the scanned state
      />
    </Animated.View>
  </TouchableOpacity>
</Modal>


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

// Stylesheet
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
    fontSize: 15,
    marginVertical: 10,
    color: 'black',
  },
  cameraContainer: {
    width: '100%',
    height: '45%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    overflow: 'hidden',
    alignSelf: 'center',
    marginTop: '1%',
  },
  settingsButton: {
    position: 'absolute',
    top: screenHeight * 0.05,
    right: 20,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center', // Aligns the modal to the bottom by default
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    marginHorizontal: '5%',
    borderRadius: screenWidth * 0.025,
    backgroundColor: 'white',
    padding: screenWidth * 0.025,
    elevation: 5,
  },
  settingsModal: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  settingsModalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f8f0fc',
  },
  settingsModalContent: {
    flex: 1,
    backgroundColor: '#f8f0fc',
    padding: screenWidth * 0.05,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
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
  banner: {
    position: 'absolute',
    top: screenHeight * 0.4,
    left: screenWidth * 0.1,
    right: screenWidth * 0.1,
    backgroundColor: '#ff69b4',
    paddingVertical: screenHeight * 0.02,
    paddingHorizontal: screenWidth * 0.05,
    borderRadius: screenWidth * 0.05,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  bannerText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: screenWidth * 0.04,
  },
  tipsContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  iconTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipsText: {
    color: '#f41c87',
    fontSize: 16,
    textAlign: 'center',
    marginLeft: 5,
    paddingHorizontal: 10,
  },
});

export default QRScannerScreen;
