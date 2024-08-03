import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
//import * as Sharing from 'expo-sharing';
//import * as Clipboard from 'expo-clipboard'; // >.<
import { getQRCodeDetails } from '../api/qrCodeAPI';
import SecureWebView from '../components/SecureWebView'; // Import the SecureWebView component

// Define Props for ScannedDataBox component
interface ScannedDataBoxProps {
  qrCodeId: string;
  clearScanData: () => void;
}

const ScannedDataBox: React.FC<ScannedDataBoxProps> = ({ qrCodeId, clearScanData }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [qrDetails, setQrDetails] = useState<any>(null);
  const [isWebViewVisible, setIsWebViewVisible] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState('');

  useEffect(() => {
    const fetchQRDetails = async () => {
      try {
        const details = await getQRCodeDetails(qrCodeId);
        setQrDetails(details.qrcode);
        console.log('details for scannedDataBOX:', details);
      } catch (error) {
        console.error('Error fetching QR details:', error);
      }
    };

    if (qrCodeId) {
      fetchQRDetails();
    }
  }, [qrCodeId]);

  if (!qrDetails) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff69b4" />
      </View>
    );
  }

  // Clipboard Button KIV...cause it broke everything......
/*   const copyToClipboard = async () => {
    try {
      const contents = qrDetails.data?.contents || 'Undefined';
      await Clipboard.setStringAsync(contents);
      Alert.alert('Copied to Clipboard', 'The QR code content has been copied to your clipboard.');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };
   */

  // Handle cases where data might be undefined
  const data = qrDetails.data || {};
  const details = qrDetails.details || {};
  const type = data.info?.type || 'Undefined';
  const contents = data.contents || 'Undefined';
  const secureConnection = details.hstsHeader?.includes('HSTS Header') ? '✔️' : '✘';
  const redirects = details.redirect || 0;
  const securityHeaders = details.hstsHeader || ['No Headers'];
  const redirectChain = details.redirectChain || ['No Redirects'];

  // Determine the result text based on scan result
  const getResultText = () => {
    if (secureConnection === '✘' || redirects > 0) {
      return 'DANGEROUS';
    } else if (secureConnection === '✔️' && redirects === 0) {
      return 'SAFE';
    } else {
      return 'WARNING';
    }
  };

  // Determine the result color based on result text
  const getResultColor = () => {
    const result = getResultText();
    if (result === 'DANGEROUS') {
      return '#ff0000'; // Red
    } else if (result === 'WARNING') {
      return '#ffa500'; // Orange
    } else if (result === 'SAFE') {
      return '#44c167'; // Green
    } else {
      return '#000000'; // Black for unknown
    }
  };

  // Open the WebView for the URL
  const openWebView = (url: string) => {
    setWebViewUrl(url);
    setIsWebViewVisible(true);
  };

  return (
    <View style={styles.dataBox}>
      {/* Close button */}
      <TouchableOpacity style={styles.closeButton} onPress={clearScanData}>
        <Ionicons name="close-circle-outline" size={18} color="#ff69b4" />
      </TouchableOpacity>

      {/* Display scanned data */}
      <View style={styles.row}>
        <Image source={require('../assets/ScanIcon3.png')} style={styles.scan_icon} />
        <Text style={styles.payload}>{contents}</Text>
      </View>
      <View style={styles.divider} />
      <Text style={styles.timestampText}>{data.createdAt ? new Date(data.createdAt).toLocaleString() : 'Invalid Date'}</Text>
      <View style={styles.qrContainer}>
        <QRCode value={contents || 'No Data'} size={75} backgroundColor="transparent" />
        <Text style={[styles.resultText, { color: getResultColor() }]}>
          Result: {getResultText()}
        </Text>
      </View>
      <View style={styles.divider} />

      {/* Display data type */}
      <Text style={styles.typeText}>Type: {type}</Text>
      <Text style={styles.blankLine}>{'\n'}</Text>

      {/* Display scan checks */}
      {type === 'URL' && (
        <>
          <Text style={styles.checksText}>Checks</Text>
          <Text style={styles.checksText}>Secure Connection: {secureConnection}</Text>
          <Text style={styles.checksText}>Redirects: {redirects}</Text>
          <TouchableOpacity style={styles.showAllButton} onPress={() => Alert.alert('Redirect Chain', redirectChain.join('\n'))}>
            <Text style={styles.showAllButtonText}>Show all redirects</Text>
          </TouchableOpacity>
        </>
      )}

      {type === 'SMS' && (
        <>
          <Text style={styles.checksText}>Recipient Phone Number: {details.phone || 'Undefined'}</Text>
          <Text style={styles.checksText}>Message Content: {details.message || 'Undefined'}</Text>
        </>
      )}

      {type === 'TEXT' && (
        <>
          <Text style={styles.checksText}>Content: {contents}</Text>
        </>
      )}

      {/* Action buttons */}
      <View style={styles.iconContainer}>
    <TouchableOpacity style={styles.iconButton} /*onPress={copyToClipboard}*/>
      <Ionicons name="copy-outline" size={18} color="#2196F3" />
      <Text style={styles.iconText}>Copy</Text>
        </TouchableOpacity>
        {type === 'URL' && (
          <TouchableOpacity style={styles.iconButton} onPress={() => openWebView(contents)}>
            <Ionicons name="open" size={18} color="#2196F3" />
            <Text style={styles.iconText}>Open</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.divider} />

      {/* More information button */}
      <Text style={styles.moreInfoText}>More Information</Text>
      <TouchableOpacity style={styles.moreInfoButton} onPress={() => setIsModalVisible(true)}>
        <Ionicons name="shield-checkmark" size={18} color="#ff69b4" />
        <Text style={styles.moreInfoButtonText}>Security Headers</Text>
        <Ionicons name="chevron-forward" size={18} color="#ff69b4" />
      </TouchableOpacity>

      {/* Modal for security headers */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Security Headers</Text>
            {securityHeaders.map((header, index) => (
              <Text key={index} style={styles.modalText}>{header}</Text>
            ))}
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setIsModalVisible(false)}>
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* SecureWebView Modal */}
      <Modal
        visible={isWebViewVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsWebViewVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.webViewContainer}>
            <SecureWebView url={webViewUrl} />
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setIsWebViewVisible(false)}>
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scan_icon: {
    width: 37.5,
    height: 37.5,
    marginRight: 6,
  },
  payload: {
    fontSize: 15,
    color: '#000',
    flex: 1,  // Allow text to use available space
  },
  dataBox: {
    padding: 15,
    backgroundColor: '#ffe6f0',
    borderRadius: 7.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.15,
    shadowRadius: 3.75,
    elevation: 2.25,
    zIndex: 1,
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 7.5,
  },
  blankLine: {
    height: 15,
  },
  divider: {
    height: 0.75,
    backgroundColor: '#ddd',
    marginVertical: 7.5,
    alignSelf: 'stretch',
  },
  timestampText: {
    fontSize: 9,
    color: '#000',
    marginBottom: 7.5,
  },
  resultText: {
    fontSize: 12,
    marginBottom: 7.5,
    textAlign: 'center',
  },
  typeText: {
    fontSize: 12,
    color: '#000',
    marginBottom: 7.5,
  },
  checksText: {
    fontSize: 12,
    color: '#000',
    marginBottom: 3.75,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 7.5,
  },
  iconButton: {
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
  },
  iconText: {
    color: '#2196F3',
    marginTop: 3.75,
    textAlign: 'center',
    fontSize: 12,
  },
  moreInfoText: {
    fontSize: 13.5,
    fontWeight: 'bold',
    color: '#000',
    marginVertical: 7.5,
  },
  moreInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7.5,
    paddingHorizontal: 11.25,
    backgroundColor: '#ffe6f0',
    borderRadius: 7.5,
    marginTop: 7.5,
  },
  moreInfoButtonText: {
    flex: 1,
    fontSize: 12,
    color: '#000',
    marginLeft: 7.5,
  },
  closeButton: {
    position: 'absolute',
    top: 7.5,
    right: 7.5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 7.5,
    padding: 15,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 7.5,
  },
  modalText: {
    fontSize: 12,
    marginBottom: 3.75,
    textAlign: 'left',
    width: '100%',
  },
  closeModalButton: {
    marginTop: 15,
    paddingVertical: 7.5,
    paddingHorizontal: 15,
    backgroundColor: '#ff69b4',
    borderRadius: 3.75,
  },
  closeModalButtonText: {
    fontSize: 12,
    color: '#fff',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  showAllButton: {
    backgroundColor: '#2196F3',
    borderRadius: 7.5,
    padding: 5,
    marginTop: 5,
  },
  showAllButtonText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  webViewContainer: {
    width: '100%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 7.5,
    overflow: 'hidden'
  }
});

export default ScannedDataBox;