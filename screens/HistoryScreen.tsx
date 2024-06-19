import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { QRCodeContext } from '../types';
import ScannedDataBox from '../components/ScannedDataBox';

const HistoryScreen: React.FC = () => {
  const qrCodeContext = useContext(QRCodeContext);

  const { qrCodes, setCurrentScannedData } = qrCodeContext || { qrCodes: [], setCurrentScannedData: () => {} };

  const [selectedData, setSelectedData] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any>(null); // KI for testing
  const [dataType, setDataType] = useState<string>(''); // KIV

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>History Screen</Text>
      {selectedData && (
        <ScannedDataBox data={selectedData} scanResult={scanResult} dataType={dataType} />
      )}
      <FlatList
        data={qrCodes}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSelectedData(item)}>
            <View style={styles.dataBox}>
              <Text style={styles.dataText}>{item}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.flatListContent} 
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
  flatListContent: {
    paddingBottom: 100, // Add padding to the bottom so that it wont kenna hidden by nav bar
  },
});

export default HistoryScreen;
