import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { QRCodeContext } from '../types';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Define the props for QRScannerScreen
interface QRScannerScreenProps {
  clearScanData: () => void;
}

const QRScannerScreen: React.FC<QRScannerScreenProps> = ({ clearScanData }) => {
  const navigation = useNavigation();
  const qrCodeContext = useContext(QRCodeContext);
  const { qrCodes, setQrCodes } = qrCodeContext || { qrCodes: [], setQrCodes: () => {} };
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState<boolean>(false);
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [scannedData, setScannedData] = useState<string>('');
  const [scanResult, setScanResult] = useState<any>(null); // State for VirusTotal scan result
  const [dataType, setDataType] = useState<string>(''); // State for data type

  useEffect(() => {
    const initializeApp = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      setShowSplash(false);
    };

    initializeApp();
  }, []);

  const handleQRCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    setScanned(true);

    // Parse the URI to determine its type
    let dataType;
    if (/^(http|https):\/\//.test(data)) {
      dataType = 'URL';
    } else if (/^[0-9]+$/.test(data)) {
      dataType = 'Number';
    } else if (/^mailto:/.test(data)) {
      dataType = 'Email';
    } else if (/^tel:/.test(data)) {
      dataType = 'Phone Number';
    } else if (/^smsto:/.test(data)) {
      dataType = 'SMS';
    } else {
      dataType = 'Text';
    }

    setDataType(dataType); // Set the data type in state

    let newScannedData = `Type: ${dataType}\nData: ${data}`;

    try {
      const scanId = await scanWithVirusTotal(data);
      const positive = await getScanResult(scanId);
      newScannedData += `\nScore: ${positive}`;
      setScanResult({ positive, scanId });
    } catch (error) {
      console.error('Error handling barcode scan:', error);
    }

    setScannedData(newScannedData);
    setQrCodes([...qrCodes, newScannedData]);
  };

  const scanWithVirusTotal = async (data: any) => {
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

  const getScanResult = async (scanId: string) => {
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

  const clearScanDataInternal = () => {
    setScannedData('');
    setScanResult(null);
    setScanned(false);
    setDataType('');
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      clearScanDataInternal();
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

  const extractedData = scannedData.split('\n')[1]?.split('Data: ')[1] || '';

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.headerText}>SafeQR v0.55</Text>
      </View>
      <Text style={styles.welcomeText}>Welcome to SafeQR code Scanner</Text>
      <View style={styles.cameraContainer}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleQRCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr', 'pdf417'] }}
          style={styles.camera}
        />
      </View>
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
});

export default QRScannerScreen;
