import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getEmails, getScannedEmails, getUserInfo } from '../api/qrCodeAPI';

import { useAuthenticator } from '@aws-amplify/ui-react-native';
import useFetchUserAttributes from '../hooks/useFetchUserAttributes';
import { fetchAuthSession, getCurrentUser, signInWithRedirect } from 'aws-amplify/auth';


const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const EmailScreen: React.FC = () => {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [emailData, setEmailData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rescanLoading, setRescanLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [bannerOpacity] = useState(new Animated.Value(0));
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  

  useEffect(() => {
    startPollingForScannedEmails();
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
  const initiateEmailFetch = async () => {
    setRescanLoading(true);
    showBanner();
    try {
      // Call to start email fetching process
      const response = await getEmails(
        'Google Access Token',
        'Refresh Token'
      );
      setRescanLoading(false);
    } catch (error) {
      console.error('Error initiating email fetch:', error);
      setError('Error rescanning inbox.');
      setRescanLoading(false);
    }
  };

  // Function to show the banner
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

  // Function to poll for scanned emails
  const startPollingForScannedEmails = () => {
    const pollingInterval = setInterval(async () => {
      try {
        const scannedEmails = await getScannedEmails();
        if (scannedEmails) {
          setEmailData(scannedEmails);
          clearInterval(pollingInterval);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching scanned emails:', error);
        setError('Error fetching emails.');
        clearInterval(pollingInterval);
        setLoading(false);
      }
    }, 3000); // Poll every 3 seconds
  };

  const handleSelectMessage = (message) => {
    setSelectedMessage(selectedMessage === message ? null : message);
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
            <TouchableOpacity onPress={initiateEmailFetch} style={styles.refreshButton}>
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
                {selectedMessage === item && (
                  <View style={styles.emailListContainer}>
                    {item.qrCodeByContentId && (
                      <View>
                        <Text style={styles.qrCodeHeader}>QR Codes by Content ID:</Text>
                        {item.qrCodeByContentId.map((qrCode, index) => (
                          <View key={index} style={styles.qrCodeContainer}>
                            {qrCode.decodedContent.map((url, i) => (
                              <TouchableOpacity key={i} onPress={() => Alert.alert("Testing")}>
                                <Text style={styles.qrCodeLink}>{url}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        ))}
                      </View>
                    )}
                    {item.qrCodeByURL && (
                      <View>
                        <Text style={styles.qrCodeHeader}>Decoded QR Codes:</Text>
                        {item.qrCodeByURL.map((qrCode, index) => (
                          <View key={index} style={styles.qrCodeContainer}>
                            {qrCode.decodedContent.map((url, i) => (
                              <TouchableOpacity key={i} onPress={() => Alert.alert("Testing")}>
                                <Text style={styles.qrCodeLink}>{url}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        </>
      )}
      <Animated.View style={[styles.banner, { opacity: bannerOpacity }]}>
        <Text style={styles.bannerText}>Scanning emails in the background. This may take a while...</Text>
      </Animated.View>
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
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ff69b4',
    paddingVertical: 20, // Increase this value for more height
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  bannerText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default EmailScreen;
