import React, { useContext } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { QRCodeContext } from '../types';

const HistoryScreen: React.FC = () => {
  const qrCodeContext = useContext(QRCodeContext);

  // Safely access qrCodes and handle the case when the context is null
  const qrCodes = qrCodeContext ? qrCodeContext.qrCodes : [];
  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>History Screen</Text>
      <FlatList
        data={qrCodes}
        renderItem={({ item }) => (
          <View style={styles.dataBox}>
            <Text style={styles.dataText}>{item}</Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f0fc',
    padding: 20,
  },
  welcomeText: {
    textAlign: 'center',
    fontSize: 20,
    marginVertical: 10,
    color: 'black',
  },
  dataBox: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dataText: {
    fontSize: 16,
    color: '#000',
  },
});

export default HistoryScreen;
