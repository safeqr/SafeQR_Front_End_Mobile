import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { CameraView , Camera  } from 'expo-camera';
import { QRCodeContext } from '../types';
import axios from 'axios';



// QR Scanner screen component
const QRScannerScreen: React.FC = () => {
  const qrCodeContext = useContext(QRCodeContext);
  const { qrCodes, setQrCodes } = qrCodeContext || { qrCodes: [], setQrCodes: () => {} };
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState<boolean>(false);
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [scannedData, setScannedData] = useState<string>('');

   // Request camera permissions when the component mounts
  useEffect(() => {
    const initializeApp = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      setShowSplash(false);
    };

    initializeApp();
  }, []);


  // Handle the QR code scanned event
  const handleQRCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    setScanned(true);

    let dataType;
    if (/^(http|https):\/\//.test(data)) {
      dataType = 'URL';
    } else if (/^[0-9]+$/.test(data)) {
      dataType = 'Numbers';
    } else {
      dataType = 'Text';
    }

    let newScannedData = `Type: ${dataType}\nData: ${data}`;

    try {
      const scanId = await scanWithVirusTotal(data);
      const positive = await getScanResult(scanId);
      newScannedData += `\nScore: ${positive}`;
    } catch (error) {
      console.error('Error handling barcode scan:', error);
    }

    setScannedData(newScannedData);
    setQrCodes([...qrCodes, newScannedData]);
  };

   // Send the scanned data to VirusTotal for scanning
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

  // Get the scan result from VirusTotal using the scan ID
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
        <Text style={styles.headerText}>SafeQR v0.25</Text>
      </View>
      <Text style={styles.welcomeText}>Welcome to SafeQR code Scanner</Text>
      <View style={styles.cameraContainer}>

        {/* Render the CameraView component for QR scanning */}
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleQRCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr', 'pdf417'] }}
          style={styles.camera}
        />
      </View>
      {scannedData !== '' && (
        <View style={styles.dataBox}>
          <Text style={styles.dataText}>{scannedData}</Text>
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
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dataText: {
    fontSize: 16,
    color: '#000',
  },
  welcomeText: {
    textAlign: 'center',
    fontSize: 20,
    marginVertical: 10,
    color: 'black',
  },
});

export default QRScannerScreen;
