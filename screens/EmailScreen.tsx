import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert, Animated, Dimensions, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getEmails, getScannedEmails, getUserInfo, deleteEmail } from '../api/qrCodeAPI';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Buffer } from 'buffer';
import ScannedDataBox from '../components/ScannedDataBox';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const EmailScreen: React.FC = () => {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [emailData, setEmailData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rescanLoading, setRescanLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [bannerOpacity] = useState(new Animated.Value(0));
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedQrCodeId, setSelectedQrCodeId] = useState(null);
  const [errorBannerOpacity] = useState(new Animated.Value(0));
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

  // Start scanning inbox only once when the component mounts
useEffect(() => {
  startInboxScanning(); 
  fetchUserEmail();
}, []);

  // Function to fetch user email
  const fetchUserEmail = async () => {
    try {
      console.log('fetchUserEmail triggered');
      const userInfo = await getUserInfo();
      setUserEmail(userInfo.email);
    } catch (error) {
      console.error('Error fetching user email:', error);
      setUserEmail('Error fetching email');
    }
  };

  // Function to initiate the email fetching process
  const startInboxScanning = async () => {
    setRescanLoading(true);
    showBanner();

    try {
      // Fetch the current authentication session
      const { tokens } = await fetchAuthSession();
      const idToken = tokens.idToken.toString();

      const parts = idToken.split('.');
      const payload = parts[1];
      const decodedPayload = Buffer.from(payload, 'base64').toString('utf8');
      const parsedPayload = JSON.parse(decodedPayload);

      const googleAccessToken = parsedPayload["custom:access_token"];
      const googleRefreshToken = parsedPayload["custom:refresh_token"];

      if (googleAccessToken && googleRefreshToken) {
        // Use the fetched tokens to initiate email fetching
        await getEmails(googleAccessToken, googleRefreshToken);
        setRescanLoading(false);
      } else {
        console.error('Google access token or refresh token not found in the payload');
        setError('Google access token or refresh token missing.');
        setRescanLoading(false);
      }
    } catch (error) {
      console.error('Error initiating email fetch:', error);
      setError('Error rescanning inbox.');
      setRescanLoading(false);
    }
  };

  // Function to show the scan email in background banner
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

  const showErrorBanner = () => {
    Animated.timing(errorBannerOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(errorBannerOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }, 3000);
    });
  };

  // Function to poll for scanned emails
  const startPollingForScannedEmails = useCallback(() => {
    const pollingInterval = setInterval(async () => {
      try {
        const scannedEmails = await getScannedEmails();
        if (scannedEmails) {
          setEmailData((prevEmailData) => {
            // Preserve the selected message if it's still in the new list
            const selectedMessageExists = prevEmailData?.messages.some(
              (message) => message.messageId === selectedMessage?.messageId
            );

            if (selectedMessageExists) {
              return {
                ...scannedEmails,
                messages: scannedEmails.messages.map((message) => ({
                  ...message,
                  isSelected: message.messageId === selectedMessage?.messageId,
                })),
              };
            } else {
              setSelectedMessage(null);
              return scannedEmails;
            }
          });
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching scanned emails:', error);
        setError('Error fetching emails.');
        setLoading(false);
        showErrorBanner();
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollingInterval); // Cleanup the interval
  }, [selectedMessage]);

  const handleSelectMessage = (message) => {
    // Toggle selection of the message without affecting polling or scanning
    setSelectedMessage(selectedMessage === message ? null : message);
  };

  const refreshScannedEmails = async () => {
    try {
      const scannedEmails = await getScannedEmails();
      setEmailData(scannedEmails);
    } catch (error) {
      console.error('Error refreshing scanned emails:', error);
      setError('Error refreshing emails.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Start polling for scanned emails when the screen gains focus
      const stopPolling = startPollingForScannedEmails();
  
      return () => {
        // Stop polling when the screen loses focus
        stopPolling();
      };
    }, [startPollingForScannedEmails])
  );

  const handleUrlClick = (id) => {
    console.log('handleURLClik ID :',)
    setSelectedQrCodeId(id);
    setIsModalVisible(true);
  };

  const handleDeleteEmail = async (messageId: string) => {
    try {
      await deleteEmail(messageId); // Call the API to delete the email
      setEmailData((prevEmailData) => ({
        ...prevEmailData,
        messages: prevEmailData.messages.filter((message) => message.messageId !== messageId),
      }));
      console.log('Email deleted successfully');
    } catch (error) {
      console.error('Error deleting email:', error);
      Alert.alert('Error', 'Failed to delete email. Please try again.');
    }
  };

  const handleDeletePress = (messageId: string) => {
    setMessageToDelete(messageId);
    setIsDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (messageToDelete) {
      await handleDeleteEmail(messageToDelete);
      setIsDeleteModalVisible(false);
      setMessageToDelete(null); // Clear the selected message after deletion
    }
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff69b4" />
          <Text style={{ color: '#ff69b4' }}>Fetching emails...</Text>
        </View>
      )}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={{ color: '#ff69b4' }}>{error}</Text>
        </View>
      )}
      {emailData && (
        <>
          <View style={styles.headerContainer}>
            <Text style={styles.emailHeader}>Email: {userEmail}</Text>
            <TouchableOpacity onPress={refreshScannedEmails} style={styles.refreshButton}>
              <Ionicons name="refresh" size={24} color="#ff69b4" />
            </TouchableOpacity>
          </View>
          {rescanLoading && (
            <View style={styles.rescanIndicator}>
              <Text style={{ color: '#ff69b4' }}>Rescanning inbox...</Text>
            </View>
          )}
          <FlatList
            data={emailData.messages}
            keyExtractor={(item) => item.messageId}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelectMessage(item)} style={styles.messageContainer}>
                <Text style={styles.subject}>{item.subject}</Text>
                <Text style={styles.date}>{item.date}</Text>
                {selectedMessage?.messageId === item.messageId && (
                  <View style={styles.emailListContainer}>
                    <Text style={styles.qrCodeHeader}>Decoded QR Codes:</Text>
                    {item.decodedContentsDetails?.map((details, index) => (
                      <View key={index} style={styles.qrCodeContainer}>
                        <TouchableOpacity onPress={() => handleUrlClick(details.data.id)}>
                          <Text style={styles.qrCodeLink}>{details.data.contents}</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                    <View style={styles.dividerHorizontal} />
                    <TouchableOpacity onPress={() => handleDeletePress(item.messageId)} style={styles.deleteButtonContainer}>
                      <Text style={styles.deleteButtonText}>Delete this entry</Text>
                      <Ionicons name="trash-bin" size={24} color="#ff69b4" />
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        </>
      )}

      <Animated.View style={[styles.banner, { opacity: bannerOpacity }]} pointerEvents="none">
        <Text style={styles.bannerText}>Scanning emails in the background. This may take a while...</Text>
      </Animated.View>

      <Animated.View style={[styles.errorBanner, { opacity: errorBannerOpacity }]} pointerEvents="none">
        <Text style={styles.bannerText}>Error fetching scanned emails</Text>
      </Animated.View>

      {/* Modal for ScannedDataBox */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        {/* The greyspace outside, made clickable to close the modal */}
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPressOut={() => setIsModalVisible(false)}
        >
          {/* Ensure ScannedDataBox does not render another modal */}
          <ScannedDataBox qrCodeId={selectedQrCodeId} clearScanData={() => setIsModalVisible(false)} />
        </TouchableOpacity>
      </Modal>

      {/* Modal to prompt for deleting */}
      <Modal
        transparent={true}
        visible={isDeleteModalVisible}
        animationType="fade"
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Are you sure?</Text>
            <Text style={styles.modalText}>This will only delete the entry on the app and not the actual email.</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButton} 
                onPress={confirmDelete}
              >
                <Text style={styles.modalButtonText}>Yes, Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalButton} 
                onPress={() => setIsDeleteModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: '#ff69b4' }]}>No, Keep It</Text>
              </TouchableOpacity>
            </View>
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
    paddingHorizontal: screenWidth * 0.025,
    paddingTop: screenHeight * 0.05,
    paddingBottom: screenHeight * 0.1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: screenHeight * 0.02,
  },
  emailHeader: {
    fontSize: screenWidth * 0.045,
    fontWeight: 'bold',
    color: '#ff69b4',
  },
  dividerHorizontal: {
    width: '100%',
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: screenWidth * 0.025,
  },
  emailListContainer: {
    flex: 1,
  },
  refreshButton: {
    padding: screenWidth * 0.025,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ff69b4',
    fontSize: screenWidth * 0.04,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ff69b4',
    fontSize: screenWidth * 0.04,
  },
  rescanIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: screenHeight * 0.015,
  },
  rescanText: {
    color: '#ff69b4',
    fontSize: screenWidth * 0.04,
  },
  messageContainer: {
    backgroundColor: '#fff',
    padding: screenWidth * 0.025,
    borderRadius: screenWidth * 0.025,
    marginBottom: screenHeight * 0.015,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: screenHeight * 0.002 },
    shadowRadius: screenWidth * 0.025,
    elevation: 2,
  },
  subject: {
    fontSize: screenWidth * 0.04,
    fontWeight: 'bold',
    color: '#000',
  },
  date: {
    fontSize: screenWidth * 0.035,
    color: '#555',
  },
  qrCodeContainer: {
    marginBottom: screenHeight * 0.015,
  },
  qrCodeLink: {
    fontSize: screenWidth * 0.035,
    color: '#0000ff',
    textDecorationLine: 'underline',
    marginVertical: screenHeight * 0.005,
  },
  qrCodeHeader: {
    fontSize: screenWidth * 0.04,
    fontWeight: 'bold',
    color: '#ff69b4',
    marginBottom: screenHeight * 0.01,
    marginTop: screenHeight * 0.015,
  },
  banner: {
    position: 'absolute',
    top: screenHeight * 0.4, // Adjusts the banner to appear in the middle of the screen
    left: screenWidth * 0.1,  // Adjust these values to center the banner as needed
    right: screenWidth * 0.1,
    backgroundColor: '#ff69b4',
    paddingVertical: screenHeight * 0.02, // Adjust the height of the banner
    paddingHorizontal: screenWidth * 0.05,
    borderRadius: screenWidth * 0.05,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10, // Ensure it appears above other elements
  },
  errorBanner: {
    position: 'absolute',
    top: screenHeight * 0.4, // Adjusts the banner to appear in the middle of the screen
    left: screenWidth * 0.1,  // Adjust these values to center the banner as needed
    right: screenWidth * 0.1,
    backgroundColor: '#ff69b4',
    paddingVertical: screenHeight * 0.02, // Adjust the height of the banner
    paddingHorizontal: screenWidth * 0.05,
    borderRadius: screenWidth * 0.05,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10, // Ensure it appears above other elements
  },
  bannerText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: screenWidth * 0.04,
  },
  innerModalContainer: {
    backgroundColor: '#ffe6f0', // pink box color
    padding: screenWidth * 0.05,
    borderRadius: screenWidth * 0.03,
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: screenWidth * 0.02,
    right: screenWidth * 0.02,
    zIndex: 1, // Ensure it is above other content
  },
  deleteButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: screenWidth * 0.02,
  },
  deleteButtonText: {
    marginRight: screenWidth * 0.02,
    color: '#ff69b4',
    fontSize: screenWidth * 0.035,
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
    borderRadius: screenWidth * 0.025,
    padding: screenWidth * 0.05,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: screenWidth * 0.05,
    fontWeight: 'bold',
    marginBottom: screenHeight * 0.01,
  },
  modalText: {
    fontSize: screenWidth * 0.04,
    marginBottom: screenHeight * 0.02,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    alignItems: 'center',
    padding: screenWidth * 0.025,
  },
  modalButtonText: {
    fontSize: screenWidth * 0.04,
    color: '#000',
  },
});

export default EmailScreen;
