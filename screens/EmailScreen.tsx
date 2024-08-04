
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { getEmails } from '../api/qrCodeAPI';

const EmailScreen: React.FC = () => {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [emailData, setEmailData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const emails = await getEmails('access Token here!!!'); // Replace with actual token retrieval
        setEmailData(emails);
      } catch (error) {
        setError('Error fetching emails.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
  }, []);

  const handleSelectMessage = (message) => {
    setSelectedMessage(selectedMessage === message ? null : message);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff69b4" />
        <Text >Fetching emails...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {emailData && (
        <>
          <Text style={styles.header}>{emailData.emailAddress}</Text>
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
    <Text style={styles.qrCodeHeader}>QR Codes by URL:</Text>
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
  loadingText: {
    fontSize: 18,
    color: '#ff69b4',
    marginBottom: 10,
    textAlign: 'center',
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
