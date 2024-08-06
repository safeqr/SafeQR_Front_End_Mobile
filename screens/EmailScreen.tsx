import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { getEmails, getScannedEmails } from '../api/qrCodeAPI';

const EmailScreen: React.FC = () => {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [emailData, setEmailData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rescanLoading, setRescanLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    startPollingForScannedEmails();
  }, []);

  // Function to initiate the email fetching process
  const initiateEmailFetch = async () => {
    setRescanLoading(true);
    try {
      // Call to start email fetching process
      const response = await getEmails(
        'ya29.a0AcM612zTwLojArYvmKxAKiUKL1eBIs04ZBN2dp53BShPcPAhZigjmivq-mQmT6BgF5G1ernMKb2LCHmRgX3vlSaBj2hD8JDi7kvpexduM-_x8aG7QorKfyB2z6yJzFrwVes2Y9tHhb9vWUAqbPdiL4wqNqeE5HxZNhoaCgYKAS0SARISFQHGX2MikJkWByj0FaiKBj3jU7svGg0170',
        '1//0g-hOrh4_72p3CgYIARAAGBASNwF-L9IrYVyuPL7WPbsm_ePtzFugduBLmdSr3UpQx7GMSt17KcS2Y_Z3v4N5wZiWua88RFjJ3Zk'
      );
      setRescanLoading(false);
    } catch (error) {
      console.error('Error initiating email fetch:', error);
      setError('Error rescanning inbox.');
      setRescanLoading(false);
    }
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
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={initiateEmailFetch} style={styles.button}>
              <Text style={styles.buttonText}>Rescan Inbox</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  // ... (rest of your styles)
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f0fc',
    padding: 10,
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#ff69b4',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  rescanIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  emailListContainer: {
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff69b4',
    marginBottom: 10,
    textAlign: 'center',
  },
  messageContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  subject: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  date: {
    fontSize: 14,
    color: '#555',
  },
  qrCodeContainer: {
    marginBottom: 10, // Add more space between the QR codes
  },
  qrCodeLink: {
    fontSize: 14,
    color: '#0000ff',
    textDecorationLine: 'underline',
    marginVertical: 5, // Add vertical margin for spacing
  },
  qrCodeHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff69b4',
    marginBottom: 5,
    marginTop: 10, // Add margin at the top for spacing from the previous element
  }
});

export default EmailScreen;
