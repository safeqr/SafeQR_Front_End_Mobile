import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, ActivityIndicator, ScrollView, Dimensions, Clipboard, Platform, Animated  } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons, MaterialCommunityIcons, SimpleLineIcons } from '@expo/vector-icons';
import { getQRCodeDetails } from '../api/qrCodeAPI';
import SecureWebView from '../components/SecureWebView';
import { startActivityAsync, ActivityAction } from 'expo-intent-launcher';
import * as Linking from 'expo-linking';


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
  const [error, setError] = useState<string | null>(null); // State to store error message
  const [bannerOpacity] = useState(new Animated.Value(0)); // State for banner opacity





  useEffect(() => {
    const fetchQRDetails = async () => {
      try {
        const details = await getQRCodeDetails(qrCodeId);
        setQrDetails(details.qrcode);
        console.log('details for scannedDataBOX:', details);
      } catch (error) {
        console.error('Error fetching QR details:', error);
        showBanner(); // Show the error banner
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

  // Function to show the error banner
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



  const data = qrDetails.data || {};
  const details = qrDetails.details || {};
  const type = data.info?.type || 'Undefined';
  const description = data.info?.description || 'Undefined';

  const contents = data.contents || 'Undefined';
  const result = data.result || 'Unknown';
  const ssid = details.ssid || 'Undefined';
  const encryption = details.encryption || 'NO';
  const hidden = details.hidden ? 'Hidden' : 'Visible';

  const isShorteningService = details.shorteningService === 'Yes';


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
      return { text: 'UNSAFE', color: '#ff0000' }; // Red
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

  const getRedirectStatus = (redirectCount: number) => {
    if (redirectCount === 0) {
      return { text: 'No Redirects', color: '#44c167', hasRedirects: false }; // Green with no redirects
    } else {
      return { text: 'Redirects', color: '#ff0000', hasRedirects: true }; // Red with redirects
    }
  };
  const redirectStatus = getRedirectStatus(details.redirect || 0);



  // Truncate content string to specified length
  const truncateContent = (content: string, length: number) => {
    if (content.length > length) {
      return `${content.substring(0, length)}...`;
    }
    return content;
  };


  // Function to get encryption status and icon
  const getEncryptionStatus = (encryption) => {
    if (encryption === 'NO') {
      return {
        text: 'No Encryption',
        icon: <Ionicons name="shield" size={screenWidth * 0.045} color="#ff0000" /> // Red
      };
    } else if (encryption === 'WEP') {
      return {
        text: 'WEP Encryption',
        icon: <Ionicons name="shield" size={screenWidth * 0.045} color="#ffa500" /> // Orange
      };
    } else if (encryption === 'WPA' || encryption === 'WPA2') {
      return {
        text: 'WPA Encryption',
        icon: <Ionicons name="shield-checkmark" size={screenWidth * 0.045} color="#44c167" /> // Green
      };
    } else {
      return {
        text: 'Unknown Encryption',
        icon: <Ionicons name="shield" size={screenWidth * 0.045} color="#000000" /> // Black for unknown
      };
    }
  };

  const { text: encryptionText, icon: encryptionIcon } = getEncryptionStatus(encryption);


  // Function to open the Wi-Fi configuration in the OS
  const handleOpenUrl = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Error opening URL:', err));
  };

  // Function to copy text content to clipboard
  const handleCopyToClipboard = () => {
    Clipboard.setString(contents);
  };

  const constructSMSUrl = (contents) => {
    // Split the contents and extract the phone number and message
    const [phone, ...messageParts] = contents.split(':').slice(1);
    const message = messageParts.join(':');

    // Log the extracted phone number and message
    console.log('Phone:', phone);
    console.log('Message:', message);

    // Construct the SMS URL based on the platform
    if (Platform.OS === 'android') {
      return `sms:${phone}?body=${message}`;
    } else if (Platform.OS === 'ios') {
      return `sms:${phone};body=${message}`;
    } else {
      return `sms:${phone}`; // Fallback if platform is unknown
    }
  };




  const sslStrippingStatus = {
    hasSSLStripping: details.sslStripping?.some(status => status === true) ?? false,
    text: details.sslStripping?.some(status => status === true)
      ? "SSL Stripping Detected"
      : "No SSL Stripping",
    color: details.sslStripping?.some(status => status === true) ? "#FF0000" : "#44c167", // Green for No SSL Stripping
  };

  // Log to check what's happening
  console.log('SSL Stripping Details:', details.sslStripping);
  console.log('SSL Stripping Status:', sslStrippingStatus);

  const hasExecutableStatus = {
    hasExecutable: details.hasExecutable ?? false,
    text: details.hasExecutable ? "Executable Detected" : "No Executable",
    color: details.hasExecutable ? "#FF0000" : "#44c167", // Green for No Executable
  };

  // Log to check what's happening
  console.log('Executable Details:', details.hasExecutable);
  console.log('Executable Status:', hasExecutableStatus);

  const trackingStatus = {
    hasTracking: details.tracking ?? false,
    text: details.tracking ? "Tracking Detected" : "No Tracking",
    color: details.tracking ? "#FF0000" : "#44c167", // Green for No Tracking
  };

  // Log to check what's happening
  console.log('Tracking Details:', details.tracking);
  console.log('Tracking Status:', trackingStatus);
  const redirectCount = details.redirect ?? 0; // Default to 0 if undefined




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
          <Text style={styles.typeText}>Description: {description}</Text>
           {/* Conditionally display the shortening service message */}
    {isShorteningService && (
      <Text style={styles.shorteningServiceText}>This is a shortening service</Text>
    )}
    
        </View>
      </View>

      {/* The Main Result in appropriate color */}
      <Text style={[styles.resultText, { color: resultColor }]}>
        Result: {resultText}
      </Text>


      {/* URL Type */}
      {type === 'URL' && (
        <>
          <View style={styles.mainContent}>
            {/* Left Container */}
            <View style={styles.leftContainer}>
              <View style={styles.displayCheck}>
                {securityIcon}
                <Text style={styles.DetailsInfo}>{securityText}</Text>
              </View>

              <View style={styles.displayCheck}>
                <MaterialCommunityIcons name="shield-off" size={screenWidth * 0.045} color={securityHeaderStatus.color} />
                <Text style={styles.DetailsInfo}>{securityHeaderStatus.text}</Text>
              </View>

              {/* Redirects Button */}
              {redirectCount > 0 ? (
                <TouchableOpacity style={styles.DetailsInfoButton} onPress={() => setIsRedirectModalVisible(true)}>
                  <Ionicons name="shield" size={screenWidth * 0.045} color={redirectStatus.color} />
                  <Text style={styles.DetailsInfo}>{`Redirects: ${redirectCount}`}</Text>
                  <Ionicons name="chevron-forward" size={screenWidth * 0.045} color="#ff69b4" style={styles.chevronIcon} />
                </TouchableOpacity>
              ) : (
                <View style={styles.displayCheck}>
                  <Ionicons name="shield-checkmark" size={screenWidth * 0.045} color={redirectStatus.color} />
                  <Text style={styles.DetailsInfo}>{`Redirects: ${redirectCount}`}</Text>
                </View>
              )}
            </View>

            {/* Vertical Divider */}
            <View style={styles.verticalDivider} />

            {/* Right Container */}
            <View style={styles.rightContainer}>
              <View style={styles.displayCheck}>
                <Ionicons name="shield-checkmark" size={screenWidth * 0.045} color={sslStrippingStatus.color} />
                <Text style={styles.DetailsInfo}>{sslStrippingStatus.text}</Text>
              </View>

              <View style={styles.displayCheck}>
                <Ionicons name="shield-checkmark" size={screenWidth * 0.045} color={hasExecutableStatus.color} />
                <Text style={styles.DetailsInfo}>{hasExecutableStatus.text}</Text>
              </View>

              <View style={styles.displayCheck}>
                <Ionicons name="shield-checkmark" size={screenWidth * 0.045} color={trackingStatus.color} />
                <Text style={styles.DetailsInfo}>{trackingStatus.text}</Text>
              </View>
            </View>
          </View>

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

        {/* Redirect Chain Pop UP */}
<Modal
  visible={isRedirectModalVisible}
  transparent={true}
  animationType="fade"
  onRequestClose={() => setIsRedirectModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Redirect Chain</Text>
      <ScrollView style={styles.modalScrollContent}>
        {details.redirectChain?.map((redirect: string, index: number) => (
          <ScrollView 
            key={index} 
            horizontal={true} 
            style={styles.horizontalScrollView}
            contentContainerStyle={styles.horizontalContentContainer}>
            <Text style={styles.modalText}>{redirect}</Text>
          </ScrollView>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.closeModalButton} onPress={() => setIsRedirectModalVisible(false)}>
        <Text style={styles.closeModalButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

        </>
      )}






      {/* WIFI Type */}

      {type === 'WIFI' && (
        <>
          {/* SSID */}
          <View style={styles.displayCheck}>
            <Text style={styles.DetailsInfo}>SSID: {ssid}</Text>
          </View>

          {/* Encryption */}
          <View style={styles.displayCheck}>
            {encryptionIcon}
            <Text style={styles.DetailsInfo}>{encryptionText}</Text>
          </View>

          {/* Visibility */}
          <View style={styles.displayCheck}>
            <Ionicons name={hidden === 'Hidden' ? "eye-off-outline" : "eye-outline"} size={screenWidth * 0.045} color={hidden === 'Hidden' ? "#ff0000" : "#44c167"} />
            <Text style={styles.DetailsInfo}>Visibility: {hidden === 'Hidden' ? 'Hidden' : 'Visible'}</Text>
          </View>

          {/* Divider */}
          <View style={styles.dividerHorizontal} />

          {/* Connect to Wi-Fi Button */}
          <TouchableOpacity
            style={[styles.connectButton, { backgroundColor: resultColor }]}
            onPress={() => {
              startActivityAsync(ActivityAction.WIFI_SETTINGS)
                .catch(err => console.error('Error opening Wi-Fi settings:', err));
            }}
          >
            <Text style={styles.connectButtonText}>Connect to Wi-Fi</Text>
          </TouchableOpacity>
        </>
      )}





      {type === 'PHONE' && (
        <TouchableOpacity style={styles.iconButton} onPress={() => Linking.openURL(contents)}>
          <View style={styles.dividerHorizontal} />
          <Ionicons name="call-outline" size={screenWidth * 0.045} color="#2196F3" />
          {/* Divider */}

          <Text style={styles.iconText}>Call Number</Text>
        </TouchableOpacity>
      )}

      {type === 'SMS' && (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            const smsUrl = constructSMSUrl(contents);
            Linking.openURL(smsUrl).catch(err => console.error('Error sending SMS:', err));
          }}
        >
          {/* Divider */}
          <View style={styles.dividerHorizontal} />
          <Ionicons name="chatbubble-outline" size={screenWidth * 0.045} color="#2196F3" />

          <Text style={styles.iconText}>Send SMS</Text>
        </TouchableOpacity>
      )}

      {type === 'EMAIL' && (
        <TouchableOpacity style={styles.iconButton} onPress={() => Linking.openURL(contents)}>
          {/* Divider */}
          <View style={styles.dividerHorizontal} />
          <Ionicons name="mail-outline" size={screenWidth * 0.045} color="#2196F3" />

          <Text style={styles.iconText}>Send Email</Text>
        </TouchableOpacity>
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
  // Row styles
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Scan icon styles
  scan_icon: {
    width: screenWidth * 0.09,
    height: screenWidth * 0.09,
    marginRight: screenWidth * 0.015,
  },

  // Payload text styles
  payload: {
    fontSize: screenWidth * 0.0375,
    color: '#000',
    flex: 1,
  },

  // Data box styles
  dataBox: {
    padding: screenWidth * 0.0375,
    backgroundColor: '#ffe6f0',
    borderRadius: screenWidth * 0.01875,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: screenHeight * 0.001875 },
    shadowOpacity: 0.15,
    shadowRadius: screenWidth * 0.01875,
    elevation: screenWidth * 0.016,
    zIndex: 1,
  },

  // QR section styles
  qrSection: {
    flex: 1,
    alignItems: 'center',
  },

  // Vertical divider styles
  dividerVertical: {
    width: screenWidth * 0.001875,
    height: '100%',
    backgroundColor: '#ddd',
    marginHorizontal: screenWidth * 0.025,
  },

  // Details section styles
  detailsSection: {
    flex: 2,
  },

  // Timestamp text styles
  timestampText: {
    fontSize: screenWidth * 0.03,
    color: '#000',
    marginBottom: screenWidth * 0.01875,
  },

  // Result text styles
  resultText: {
    fontSize: screenWidth * 0.045,
    marginBottom: screenWidth * 0.01875,
    textAlign: 'center',
  },

  // Type text styles
  typeText: {
    fontSize: screenWidth * 0.03,
    color: '#000',
    marginBottom: screenWidth * 0.01875,
  },

  // Details Info Button styles
  DetailsInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Ensure equal spacing between icon and text
    paddingVertical: screenWidth * 0.01875,
    paddingHorizontal: screenWidth * 0.028125,
    backgroundColor: '#ffe6f0',
    borderRadius: screenWidth * 0.01875,
    marginTop: screenWidth * 0.01875,
    borderWidth: 1,
    borderColor: '#ff69b4',
    width: '100%', // Make it take full width
  },
  // Display check styles
  // Aligning the boxes
  displayCheck: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Align items evenly
    paddingVertical: screenWidth * 0.01875,
    paddingHorizontal: screenWidth * 0.028125,
    backgroundColor: '#ffe6f0',
    borderRadius: screenWidth * 0.01875,
    marginVertical: screenWidth * 0.01875,
    width: '100%', // Make it take full width
  },
  // Details info text styles
  DetailsInfo: {
    fontSize: screenWidth * 0.026,
    color: '#000',
    marginLeft: screenWidth * 0.01875,
    textAlign: 'left', // Center text horizontally
    flex: 1, // Ensure the text takes up the remaining space
  },

  // Close button styles
  closeButton: {
    position: 'absolute',
    top: screenWidth * 0.01875,
    right: screenWidth * 0.01875,
    zIndex: 2,
  },

  // Modal container styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  // Modal content styles
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: screenWidth * 0.01875,
    padding: screenWidth * 0.0375,
    alignItems: 'center',
  },

  // Modal title styles
  modalTitle: {
    fontSize: screenWidth * 0.045,
    fontWeight: 'bold',
    marginBottom: screenWidth * 0.01875,
  },

  // Modal text styles
  modalText: {
    fontSize: screenWidth * 0.03,
    marginBottom: screenWidth * 0.009375,
    textAlign: 'left',
    width: '100%',
  },

  // Modal scroll content styles
  modalScrollContent: {
    maxHeight: 200,
  },

  horizontalScrollView: {
    marginVertical: 5, // Adjust vertical margin as needed
  },

  horizontalContentContainer: {
    flexGrow: 1, // Ensure the content container expands to fit its children
  },


  // Close modal button styles
  closeModalButton: {
    marginTop: screenWidth * 0.0375,
    paddingVertical: screenWidth * 0.01875,
    paddingHorizontal: screenWidth * 0.0375,
    backgroundColor: '#ff69b4',
    borderRadius: screenWidth * 0.009375,
  },

  // Close modal button text styles
  closeModalButtonText: {
    fontSize: screenWidth * 0.03,
    color: '#fff',
  },

  // Loading container styles
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Web view container styles
  webViewContainer: {
    width: '100%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: screenWidth * 0.01875,
    overflow: 'hidden',
  },

  // Shadow box styles
  shadowBox: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: screenHeight * 0.001875 },
    shadowOpacity: 0.15,
    shadowRadius: screenWidth * 0.01875,
    elevation: screenWidth * 0.0135,
  },

  // Connect button styles
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: screenWidth * 0.0375,
    paddingHorizontal: screenWidth * 0.0375,
    backgroundColor: '#44c167', // Green background for the button
    borderRadius: screenWidth * 0.01875,
    marginTop: screenWidth * 0.025,
  },

  // Connect button text styles
  connectButtonText: {
    color: '#fff',
    marginLeft: screenWidth * 0.01875,
    fontSize: screenWidth * 0.0375,
  },

  // Main content styles
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: screenWidth * 0.0525,
  },

  // Left container styles
  leftContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },

  // Right container styles
  rightContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  shorteningServiceText: {
    fontSize: screenWidth * 0.03, // Adjust size as needed
    color: '#ff6347', // Example color (Tomato)
    marginTop: screenWidth * 0.02, // Adjust spacing as needed
  },

  // Vertical divider styles
  verticalDivider: {
    width: 1,
    backgroundColor: '#ddd',
    height: '100%',
    marginHorizontal: screenWidth * 0.025,
  },

  // Icon container styles
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: screenWidth * 0.01875,
  },

  // Icon button styles
  iconButton: {
    flexDirection: 'column',
    alignItems: 'center',
    marginHorizontal: screenWidth * 0.05, // Add margin between buttons
  },

  // Icon text styles
  iconText: {
    color: '#2196F3',
    marginTop: screenWidth * 0.01,
    textAlign: 'center',
    fontSize: screenWidth * 0.03,
  },

  // Horizontal divider styles
  dividerHorizontal: {
    width: '100%',
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: screenWidth * 0.025,
  },

  // Chevron icon styles
  chevronIcon: {
    marginLeft: 'auto',
  },
});
export default ScannedDataBox;