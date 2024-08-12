import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, ActivityIndicator, ScrollView, Dimensions, Linking, Clipboard } from 'react-native';
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
  const result = data.result || 'Unknown';
  const ssid = details.ssid || 'Undefined';
  const encryption = details.encryption || 'NO';
  const hidden = details.hidden ? 'Hidden' : 'Visible';



// Function to get security text and icon based on the URL description
const getSecurityStatus = () => {
  if (data.info?.description === "Secure Uniform Resource Locator") {
    return {
      text: 'Secure Connection',
      icon: <Ionicons name="shield-checkmark" size={screenWidth * 0.045} color="#44c167" />
    };
  } else {
    return {
      text: 'Not Secure',
      icon: <SimpleLineIcons name="shield" size={screenWidth * 0.045} color="#ff0000" />
    };
  }
};
const { text: securityText, icon: securityIcon } = getSecurityStatus();




 // Function to get result text and color based on the security status 
const getResultStatus = () => {
  if (result === 'UNSAFE') {
    return { text: 'DANGEROUS', color: '#ff0000' }; // Red
  } else if (result === 'SAFE') {
    return { text: 'SAFE', color: '#44c167' }; // Green
  } else if (result === 'WARNING') {
    return { text: 'WARNING', color: '#ffa500' }; // Orange
  } else if (result === '') {
    return { text: 'UNKNOWN', color: '#000000' }; // Black for unknown
  } else {
    return { text: 'UNKNOWN', color: '#000000' }; // Default to Black for unknown
  }
};
const { text: resultText, color: resultColor } = getResultStatus();




// Function to determine security header status
const getSecurityHeaderStatus = (headers) => {
  const filteredHeaders = headers.filter(
    (header) => header !== "Not an HTTPS connection" && header !== "No HSTS Header detected"
  );

  if (filteredHeaders.length > 0) {
    return { text: 'Security Headers', color: '#44c167', hasHeaders: true }; // Green with headers
  } else {
    return { text: 'No Security Headers', color: '#ffa500', hasHeaders: false }; // Orange without headers
  }
};

const securityHeaderStatus = getSecurityHeaderStatus(details.hstsHeader || []);




  // Truncate content string to specified length
  const truncateContent = (content: string, length: number) => {
    if (content.length > length) {
      return `${content.substring(0, length)}...`;
    }
    return content;
  };

  // Function to open the Wi-Fi configuration in the OS
  const handleOpenUrl = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Error opening URL:', err));
  };

  // Function to copy text content to clipboard
  const handleCopyToClipboard = () => {
    Clipboard.setString(contents);
  };

  // Function to send SMS
  const handleSendSMS = () => {
    const smsUrl = `sms:${contents}`;
    Linking.openURL(smsUrl).catch(err => console.error('Error sending SMS:', err));
  };

  // Function to make a phone call
  const handleMakeCall = () => {
    const telUrl = `tel:${contents}`;
    Linking.openURL(telUrl).catch(err => console.error('Error making call:', err));
  };

  return (
    <View style={styles.dataBox}>
      <TouchableOpacity style={styles.closeButton} onPress={clearScanData}>
        <Ionicons name="close-circle-outline" size={screenWidth * 0.05} color="#ff69b4" />
      </TouchableOpacity>

      {/* The Top Scan Icon with payload, truncated */}
      <View style={[styles.row, styles.shadowBox]}>
        <Image source={require('../assets/ScanIcon3.png')} style={styles.scan_icon} />
        <Text style={styles.payload} onPress={() => setIsContentModalVisible(true)}>
          {truncateContent(contents, 30)}
        </Text>
      </View>

      <View style={styles.mainContent}>
        {/* Display QR Code , timestamp and Description */}
        <View style={styles.qrSection}>
          <QRCode value={contents || 'No Data'} size={screenWidth * 0.2} backgroundColor="transparent" />
        </View>
        <View style={styles.dividerVertical} />
        <View style={styles.detailsSection}>
          <Text style={styles.timestampText}>{data.createdAt ? new Date(data.createdAt).toLocaleString() : 'Invalid Date'}</Text>
          <Text style={styles.typeText}>Description: {type}</Text>
        </View>
      </View>

      {/* The Main Result in appropriate color */}
      <Text style={[styles.resultText, { color: resultColor }]}>
  Result: {resultText}
</Text>


      {/* URL Type */}
{type === 'URL' && (
  <>
    <View style={styles.displayCheck}>
  {securityIcon}
  <Text style={styles.moreInfoButtonText}>{securityText}</Text>
</View>

    {/* Security Headers Button */}
    {securityHeaderStatus.hasHeaders ? (
      <TouchableOpacity style={styles.moreInfoButton} onPress={() => setIsModalVisible(true)}>
        <Ionicons name="shield-checkmark" size={screenWidth * 0.045} color={securityHeaderStatus.color} />
        <Text style={styles.moreInfoButtonText}>{securityHeaderStatus.text}</Text>
        <Ionicons name="chevron-forward" size={screenWidth * 0.045} color="#ff69b4" style={styles.chevronIcon} />
      </TouchableOpacity>
    ) : (
      <View style={styles.displayCheck}>
        <MaterialCommunityIcons name="shield-off" size={screenWidth * 0.045} color={securityHeaderStatus.color} />
        <Text style={styles.moreInfoButtonText}>{securityHeaderStatus.text}</Text>
      </View>
    )}

    {/* Redirects Button */}
    <TouchableOpacity style={styles.moreInfoButton} onPress={() => setIsRedirectModalVisible(true)}>
      <Ionicons name="shield" size={screenWidth * 0.045} color={details.redirectChain?.length > 1 ? "#ff0000" : "#44c167"} />
      <Text style={styles.moreInfoButtonText}>Redirects</Text>
      <Ionicons name="chevron-forward" size={screenWidth * 0.045} color="#ff69b4" style={styles.chevronIcon} />
    </TouchableOpacity>

{/* Divider */}
<View style={styles.dividerHorizontal} />

{/* Action Buttons */}
<View style={styles.iconContainer}>
  <TouchableOpacity style={styles.iconButton} onPress={handleCopyToClipboard}>
    <Ionicons name="clipboard-outline" size={screenWidth * 0.05} color="#2196F3" />
    <Text style={styles.iconText}>Copy Link</Text>
  </TouchableOpacity>
  
  <TouchableOpacity style={styles.iconButton} onPress={() => handleOpenUrl(contents)}>
    <Ionicons name="open-outline" size={screenWidth * 0.05} color="#2196F3" />
    <Text style={styles.iconText}>Open Link</Text>
  </TouchableOpacity>
  
  <TouchableOpacity style={styles.iconButton} onPress={() => {
        setWebViewUrl(contents);
        setIsWebViewVisible(true);
      }}>
    <MaterialCommunityIcons name="file-lock-outline" size={screenWidth * 0.05} color="#2196F3" />
    <Text style={styles.iconText}>SecureWebView</Text>
  </TouchableOpacity>
</View>

  </>
)}



      {/* WIFI Type */}
      {type === 'WIFI' && (
        <>
          <Text style={styles.moreInfoButton}>SSID: {ssid}</Text>
          <Text style={styles.moreInfoButton}>Encryption: {encryption}</Text>
          <Text style={styles.moreInfoButton}>Visibility: {hidden === 'Hidden' ? '✔️' : '❌'}</Text>
        </>
      )}

      {/* TEXT Type */}
      {type === 'TEXT' && (
        <View style={styles.iconContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={handleCopyToClipboard}>
            <Ionicons name="clipboard-outline" size={screenWidth * 0.045} color="#2196F3" />
            <Text style={styles.iconText}>Copy</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* SMS Type */}
      {type === 'SMS' && (
        <View style={styles.iconContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={handleSendSMS}>
            <Ionicons name="chatbubble-outline" size={screenWidth * 0.045} color="#2196F3" />
            <Text style={styles.iconText}>Send SMS</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* TEL Type */}
      {type === 'TEL' && (
        <View style={styles.iconContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={handleMakeCall}>
            <Ionicons name="call-outline" size={screenWidth * 0.045} color="#2196F3" />
            <Text style={styles.iconText}>Call</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Full Content Modal */}
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




{/*POP UP Security Header and Redirect button*/}
     {/* Security Headers Modal */}
<Modal
  visible={isModalVisible}
  transparent={true}
  animationType="fade"
  onRequestClose={() => setIsModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Security Headers</Text>
      <ScrollView style={styles.modalScrollContent}>
        {details.hstsHeader?.map((header: string, index: number) => (
          <Text key={index} style={styles.modalText}>{header}</Text>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.closeModalButton} onPress={() => setIsModalVisible(false)}>
        <Text style={styles.closeModalButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

      {/* Redirect Chain Modal */}
      <Modal
        visible={isRedirectModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsRedirectModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Redirect Chain</Text>
            {details.redirectChain?.map((redirect: string, index: number) => (
              <Text key={index} style={styles.modalText}>{redirect}</Text>
            ))}
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setIsRedirectModalVisible(false)}>
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* WebView Modal */}
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
    padding: screenWidth * 0.0525,
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
    fontSize: screenWidth * 0.03,
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
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: screenWidth * 0.01875,
  },
  iconButton: {
    flexDirection: 'column',
    alignItems: 'center',
    marginHorizontal: screenWidth * 0.05, // Add margin between buttons
  },
  iconText: {
    color: '#2196F3',
    marginTop: screenWidth * 0.01,
    textAlign: 'center',
    fontSize: screenWidth * 0.03,
  },
  
  dividerHorizontal: {
    width: '100%',
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: screenWidth * 0.025,
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
  chevronIcon: {
    marginLeft: 'auto',
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
