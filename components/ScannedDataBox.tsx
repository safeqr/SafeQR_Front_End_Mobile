import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';

interface ScannedDataBoxProps {
  data: string;
  scanResult: any;
  dataType: string;
}

const ScannedDataBox: React.FC<ScannedDataBoxProps> = ({ data, scanResult, dataType }) => {
  const extractedData = data.split('\n')[1]?.split('Data: ')[1] || '';
  let resultText = 'SAFE';
  let resultColor = styles.safeResult;

  if (scanResult) {
    if (!scanResult.secureConnection || !scanResult.virusTotalCheck) {
      resultText = 'DANGEROUS';
      resultColor = styles.dangerousResult;
    } else if (scanResult.secureConnection && scanResult.virusTotalCheck) {
      resultText = 'SAFE';
      resultColor = styles.safeResult;
    } else {
      resultText = 'WARNING';
      resultColor = styles.warningResult;
    }
  } else {
    resultText = 'WARNING';
    resultColor = styles.warningResult;
  }

  return (
    <View style={styles.dataBox}>
      <View style={styles.row}>
        <Image source={require('../assets/ScanIcon3.png')} style={styles.scan_icon} />
        <Text style={styles.payload}>{extractedData}</Text>
      </View>
      <View style={styles.divider} />
      <Text style={styles.timestampText}>{new Date().toLocaleString()}</Text>
      <View style={styles.qrContainer}>
        <QRCode value={extractedData} size={100} backgroundColor="transparent" />
        <Text style={[styles.resultText, resultColor]}>
          Result: {resultText}
        </Text>
      </View>
      <View style={styles.divider} />
      <Text style={styles.typeText}>Type: {dataType}</Text>
      <Text style={styles.blankLine}>{'\n'}</Text>
      <Text style={styles.checksText}>Checks</Text>
      <Text style={styles.checksText}>Secure Connection: {scanResult?.secureConnection ? '✔️' : '✘'}</Text>
      <Text style={styles.checksText}>Virus Total Check: {scanResult?.virusTotalCheck ? '✔️' : '✘'}</Text>
      <Text style={styles.checksText}>Redirects: {scanResult?.redirects ?? 'N/A'}</Text>
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
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scan_icon: {
    width: 50,
    height: 50,
    marginRight: 8,
  },
  payload: {
    fontSize: 20,
    color: '#000',
    marginBottom: 1,
  },
  dataBox: {
    padding: 20,
    backgroundColor: '#ffe6f0',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    zIndex: 1,
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  blankLine: {
    height: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
    alignSelf: 'stretch',
  },
  timestampText: {
    fontSize: 12,
    color: '#000',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  safeResult: {
    color: 'green',
  },
  warningResult: {
    color: 'orange',
  },
  dangerousResult: {
    color: 'red',
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
});

export default ScannedDataBox;
