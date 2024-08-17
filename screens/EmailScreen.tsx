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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedQrCodeId, setSelectedQrCodeId] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [emptyMessage, setEmptyMessage] = useState('');
  const [bannerOpacity] = useState(new Animated.Value(0));


  useEffect(() => {
    fetchUserEmail();
  }, []);

  const fetchUserEmail = async () => {
    try {
      const userInfo = await getUserInfo();
      if (userInfo && userInfo.email) {
        setUserEmail(userInfo.email);

        if (userInfo.email.endsWith('@gmail.com')) {
          startInboxScanning();
        } else {
          setEmptyMessage('Please login using a Gmail account to view Emails');
          setLoading(false);
        }
      } else {
        setEmptyMessage('Please login using a Gmail account to view Emails');
        setLoading(false);
      }
    } catch (error) {
      setEmptyMessage('Please login using a Gmail account to view Emails');
      setLoading(false);
    }
  };

  const startInboxScanning = async () => {
    setRescanLoading(true);
    showBanner(); // Show the scanning banner
  
    try {
      const { tokens } = await fetchAuthSession();
      const idToken = tokens.idToken.toString();
  
      const parts = idToken.split('.');
      const payload = parts[1];
      const decodedPayload = Buffer.from(payload, 'base64').toString('utf8');
      const parsedPayload = JSON.parse(decodedPayload);
  
      const googleAccessToken = parsedPayload["custom:access_token"];
      const googleRefreshToken = parsedPayload["custom:refresh_token"];
  
      if (googleAccessToken && googleRefreshToken) {
        await getEmails(googleAccessToken, googleRefreshToken);
        setRescanLoading(false);
      } else {
        setError('Google access token or refresh token missing.');
        setRescanLoading(false);
      }
    } catch (error) {
      setError('Error rescanning inbox.');
      setRescanLoading(false);
    }
  };
  

  const startPollingForScannedEmails = useCallback(() => {
    const pollingInterval = setInterval(async () => {
      try {
        const scannedEmails = await getScannedEmails();
        if (scannedEmails && scannedEmails.messages && scannedEmails.messages.length > 0) {
          setEmailData((prevEmailData) => {
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
        } else {
          setEmptyMessage('No Emails with QR Code');
        }
        setLoading(false);
      } catch (error) {
        setEmptyMessage('No Emails with QR Code');
        setLoading(false);
      }
    }, 10000);
    
    return () => clearInterval(pollingInterval);
  }, [selectedMessage]);

  const handleSelectMessage = (message) => {
    setSelectedMessage(selectedMessage === message ? null : message);
  };

  const refreshScannedEmails = async () => {
    try {
      const scannedEmails = await getScannedEmails();
      setEmailData(scannedEmails);
    } catch (error) {
      setError('Error refreshing emails.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      const stopPolling = startPollingForScannedEmails();
      return () => {
        stopPolling();
      };
    }, [startPollingForScannedEmails])
  );

  const handleUrlClick = (id) => {
    setSelectedQrCodeId(id);
    setIsModalVisible(true);
  };

  const handleDeleteEmail = async (messageId: string) => {
    try {
      await deleteEmail(messageId);
      setEmailData((prevEmailData) => {
        const updatedMessages = prevEmailData.messages.filter((message) => message.messageId !== messageId);
        if (updatedMessages.length === 0) {
          setEmptyMessage('No Emails with QR Code');
        }
        return {
          ...prevEmailData,
          messages: updatedMessages,
        };
      });
    } catch (error) {
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
      setMessageToDelete(null);
    }
  };

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
  

  return (
    <View style={styles.container}>
      {/* Header with Email and Refresh Button */}
      <View style={styles.headerContainer}>
        <Text style={styles.emailHeader}>Email: {userEmail}</Text>
        <TouchableOpacity onPress={refreshScannedEmails} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#ff69b4" />
        </TouchableOpacity>
      </View>

      {/* Loading and Empty Message */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff69b4" />
          <Text style={{ color: '#ff69b4' }}>Fetching emails...</Text>
        </View>
      )}

      {!loading && emptyMessage && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{emptyMessage}</Text>
        </View>
      )}

      {/* Email Data */}
      {emailData && (
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
      )}


      {/* Banner when scanning inbox */}
      <Animated.View style={[styles.banner, { opacity: bannerOpacity }]} pointerEvents="none">
        <Text style={styles.bannerText}>Scanning emails in the background. This may take a while...</Text>
      </Animated.View>


      {/* Modal for ScannedDataBox */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <ScannedDataBox qrCodeId={selectedQrCodeId} clearScanData={() => setIsModalVisible(false)} />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal to prompt for deleting */}
      <Modal
        transparent={true}
        visible={isDeleteModalVisible}
        animationType="fade"
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
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
  banner: {
    position: 'absolute',
    top: screenHeight * 0.50, 
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    marginHorizontal: '5%',
    borderRadius: screenWidth * 0.025,
    backgroundColor: 'white',
    padding: screenWidth * 0.025,
    elevation: 5,
  },
  modalTitle: {
    fontSize: screenWidth * 0.05,
    fontWeight: 'bold',
    marginBottom: screenHeight * 0.01,
  },
  modalText: {
    color: '#ff69b4',
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
});

export default EmailScreen;
