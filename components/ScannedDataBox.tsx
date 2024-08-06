import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons, MaterialCommunityIcons, SimpleLineIcons } from '@expo/vector-icons';
import { getQRCodeDetails } from '../api/qrCodeAPI';
import SecureWebView from '../components/SecureWebView';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ScannedDataBoxProps {
  qrCodeId: string;
  clearScanData: () => void;
}

const ScannedDataBox: React.FC<ScannedDataBoxProps> = ({ qrCodeId, clearScanData }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRedirectModalVisible, setIsRedirectModalVisible] = useState(false);
  const [isContentModalVisible, setIsContentModalVisible] = useState(false);
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

  const data = qrDetails.data || {};
  const details = qrDetails.details || {};
  const type = data.info?.type || 'Undefined';
  const contents = data.contents || 'Undefined';
  const secureConnection = details.hstsHeader?.some((header: string) => header.includes('HSTS Header'));
  const redirects = details.redirect || 0;
  const securityHeaders = details.hstsHeader || ['No Headers'];
  const redirectChain = details.redirectChain || ['No Redirects'];

  const getResultText = () => {
    if (!secureConnection || redirects > 0) {
      return 'DANGEROUS';
    } else if (secureConnection && redirects === 0) {
      return 'SAFE';
    } else {
      return 'WARNING';
    }
  };

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

  const getRedirectIcon = () => {
    if (redirects === 0) {
      return <Ionicons name="shield-checkmark" size={screenWidth * 0.045} color="#44c167" />;
    } else if (redirects <= 2) {
      return <Ionicons name="shield" size={screenWidth * 0.045} color="#ffa500" />;
    } else {
      return <MaterialCommunityIcons name="shield-alert" size={screenWidth * 0.045} color="#ff0000" />;
    }
  };

  const openWebView = (url: string) => {
    setWebViewUrl(url);
    setIsWebViewVisible(true);
  };

  const truncateContent = (content: string, length: number) => {
    if (content.length > length) {
      return `${content.substring(0, length)}...`;
    }
    return content;
  };

  return (
    <View style={styles.dataBox}>
      <TouchableOpacity style={styles.closeButton} onPress={clearScanData}>
        <Ionicons name="close-circle-outline" size={screenWidth * 0.05} color="#ff69b4" />
      </TouchableOpacity>

      <View style={[styles.row, styles.shadowBox]}>
        <Image source={require('../assets/ScanIcon3.png')} style={styles.scan_icon} />
        <Text style={styles.payload} onPress={() => setIsContentModalVisible(true)}>
          {truncateContent(contents, 30)} {/* Truncated content further */}
        </Text>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.qrSection}>
          <QRCode value={contents || 'No Data'} size={screenWidth * 0.2} backgroundColor="transparent" />
        </View>
        <View style={styles.dividerVertical} />
        <View style={styles.detailsSection}>
          <Text style={styles.timestampText}>{data.createdAt ? new Date(data.createdAt).toLocaleString() : 'Invalid Date'}</Text>
          <Text style={styles.typeText}>Description: {type}</Text>
          <Text>{'\n'}</Text>
        </View>
      </View>

     
      <Text style={[styles.resultText, { color: getResultColor() }]}>
        Result: {getResultText()}
      </Text>

      {type === 'URL' && (
        <>
          <View style={styles.displayCheck}>
            {secureConnection ? (
              <>
                <Ionicons name="shield-checkmark" size={screenWidth * 0.045} color="#44c167" />
                <Text style={styles.moreInfoButtonText}>Secure Connection</Text>
              </>
            ) : (
              <>
                <SimpleLineIcons name="shield" size={screenWidth * 0.045} color="#ff0000" />
                <Text style={styles.moreInfoButtonText}>Not Secure</Text>
              </>
            )}
          </View>
          <TouchableOpacity style={styles.moreInfoButton} onPress={() => setIsRedirectModalVisible(true)}>
            {getRedirectIcon()}
            <Text style={styles.moreInfoButtonText}>Redirects</Text>
            <Ionicons name="chevron-forward" size={screenWidth * 0.045} color="#ff69b4" />
          </TouchableOpacity>
        </>
      )}

      {type === 'SMS' && (
        <>
          <Text style={styles.moreInfoButtonText}>Recipient Phone Number: {details.phone || 'Undefined'}</Text>
          <Text style={styles.moreInfoButtonText}>Message Content: {details.message || 'Undefined'}</Text>
        </>
      )}

      {type === 'TEXT' && (
        <TouchableOpacity style={[styles.contentBox, styles.shadowBox]} onPress={() => setIsContentModalVisible(true)}>
          <Text style={styles.moreInfoButtonText}>
            Content: {truncateContent(contents, 30)} {/* Truncated content further */}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.moreInfoButton} onPress={() => setIsModalVisible(true)}>
        <Ionicons name="shield-checkmark" size={screenWidth * 0.045} color="#ff69b4" />
        <Text style={styles.moreInfoButtonText}>Security Headers</Text>
        <Ionicons name="chevron-forward" size={screenWidth * 0.045} color="#ff69b4" />
      </TouchableOpacity>

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

      <Modal
        visible={isRedirectModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsRedirectModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Redirect Chain</Text>
            {redirectChain.map((redirect, index) => (
              <Text key={index} style={styles.modalText}>{redirect}</Text>
            ))}
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setIsRedirectModalVisible(false)}>
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isContentModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsContentModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Full Content</Text>
            <ScrollView style={styles.modalScrollContent}>
              <Text style={styles.modalText}>{contents}</Text>
            </ScrollView>
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setIsContentModalVisible(false)}>
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    
      <View style={styles.iconContainer}>
        {type === 'URL' && (
          <TouchableOpacity style={styles.iconButton} onPress={() => openWebView(contents)}>
            <Ionicons name="open" size={screenWidth * 0.045} color="#2196F3" />
            <Text style={styles.iconText}>Open</Text>
          </TouchableOpacity>
        )}
      </View>

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
    width: screenWidth * 0.09,
    height: screenWidth * 0.09,
    marginRight: screenWidth * 0.015,
  },
  payload: {
    fontSize: screenWidth * 0.0375,
    color: '#000',
    flex: 1,
  },
  dataBox: {
    padding: screenWidth * 0.0375,
    backgroundColor: '#ffe6f0',
    borderRadius: screenWidth * 0.01875,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: screenHeight * 0.001875 },
    shadowOpacity: 0.15,
    shadowRadius: screenWidth * 0.01875,
    elevation: screenWidth * 0.0135,
    zIndex: 1,
  },
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: screenWidth * 0.0125,
  },
  qrSection: {
    flex: 1,
    alignItems: 'center',
  },
  dividerVertical: {
    width: screenWidth * 0.001875,
    height: '100%',
    backgroundColor: '#ddd',
    marginHorizontal: screenWidth * 0.025,
  },
  detailsSection: {
    flex: 2,
  },
  
  
  timestampText: {
    fontSize: screenWidth * 0.0275,
    color: '#000',
    marginBottom: screenWidth * 0.01875,
  },
  resultText: {
    fontSize: screenWidth * 0.045,
    marginBottom: screenWidth * 0.01875,
    textAlign: 'center',
  },
  typeText: {
    fontSize: screenWidth * 0.03,
    color: '#000',
    marginBottom: screenWidth * 0.01875,
  },
  moreInfoButtonText: {
    fontSize: screenWidth * 0.03,
    color: '#000',
    marginLeft: screenWidth * 0.01875,
  },
  checksText: {
    fontSize: screenWidth * 0.03,
    color: '#000',
    marginBottom: screenWidth * 0.009375,
    marginLeft: screenWidth * 0.01875,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: screenWidth * 0.01875,
  },
  iconButton: {
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
  },
  iconText: {
    color: '#2196F3',
    marginTop: screenWidth * 0.009375,
    textAlign: 'center',
    fontSize: screenWidth * 0.03,
  },
  moreInfoText: {
    fontSize: screenWidth * 0.03375,
    fontWeight: 'bold',
    color: '#000',
    marginVertical: screenWidth * 0.01875,
  },
  moreInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: screenWidth * 0.01875,
    paddingHorizontal: screenWidth * 0.028125,
    backgroundColor: '#ffe6f0',
    borderRadius: screenWidth * 0.01875,
    marginTop: screenWidth * 0.01875,
    borderWidth: 1,
    borderColor: '#ff69b4',
  },
  displayCheck: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: screenWidth * 0.01875,
    paddingHorizontal: screenWidth * 0.028125,
    backgroundColor: '#ffe6f0',
    borderRadius: screenWidth * 0.01875,
    marginTop: screenWidth * 0.01875,
  },
  contentBox: {
    marginTop: screenWidth * 0.01875,
    padding: screenWidth * 0.025,
    backgroundColor: '#fff',
    borderRadius: screenWidth * 0.01875,
    borderWidth: 1,
    borderColor: '#ff69b4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: screenHeight * 0.001875 },
    shadowOpacity: 0.15,
    shadowRadius: screenWidth * 0.01875,
    elevation: screenWidth * 0.0135,
  },
  closeButton: {
    position: 'absolute',
    top: screenWidth * 0.01875,
    right: screenWidth * 0.01875,
    zIndex: 2,
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
    borderRadius: screenWidth * 0.01875,
    padding: screenWidth * 0.0375,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: screenWidth * 0.045,
    fontWeight: 'bold',
    marginBottom: screenWidth * 0.01875,
  },
  modalText: {
    fontSize: screenWidth * 0.03,
    marginBottom: screenWidth * 0.009375,
    textAlign: 'left',
    width: '100%',
  },
  modalScrollContent: {
    maxHeight: 200,
  },
  closeModalButton: {
    marginTop: screenWidth * 0.0375,
    paddingVertical: screenWidth * 0.01875,
    paddingHorizontal: screenWidth * 0.0375,
    backgroundColor: '#ff69b4',
    borderRadius: screenWidth * 0.009375,
  },
  closeModalButtonText: {
    fontSize: screenWidth * 0.03,
    color: '#fff',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  webViewContainer: {
    width: '100%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: screenWidth * 0.01875,
    overflow: 'hidden',
  },
  shadowBox: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: screenHeight * 0.001875 },
    shadowOpacity: 0.15,
    shadowRadius: screenWidth * 0.01875,
    elevation: screenWidth * 0.0135,
  },
});

export default ScannedDataBox;
