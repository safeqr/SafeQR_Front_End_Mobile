import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { QRCodeContext, QRCode } from '../types'; // Import QRCode type
import ScannedDataBox from '../components/ScannedDataBox';
import { Ionicons } from '@expo/vector-icons';

const HistoryScreen: React.FC = () => {
  const qrCodeContext = useContext(QRCodeContext);

  const qrCodes = qrCodeContext?.qrCodes || [];
  const setQrCodes = qrCodeContext?.setQrCodes || (() => {});

  const [selectedData, setSelectedData] = useState<string | null>(null);
  const [selectedScanResult, setSelectedScanResult] = useState<any | null>(null);
  const [showBookmarks, setShowBookmarks] = useState<boolean>(false);

  const toggleBookmark = (index: number) => {
    setQrCodes((prev: QRCode[]) => {
      const originalIndex = prev.length - 1 - index; // Compute the original index
      const newQrCodes = [...prev];
      newQrCodes[originalIndex].bookmarked = !newQrCodes[originalIndex].bookmarked;
      return newQrCodes;
    });
  };

  const deleteQRCode = (index: number) => {
    setQrCodes((prev: QRCode[]) => {
      const originalIndex = prev.length - 1 - index; // Compute the original index
      return prev.filter((_, i) => i !== originalIndex);
    });
  };

  const filteredQrCodes = (showBookmarks ? qrCodes.filter(qr => qr.bookmarked) : qrCodes.slice().reverse());

  const handleItemPress = (item: any) => {
    setSelectedData(item.data);
    setSelectedScanResult(item.scanResult);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => setShowBookmarks(false)}>
          <Text style={!showBookmarks ? styles.headerTextActive : styles.headerTextInactive}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowBookmarks(true)}>
          <Text style={showBookmarks ? styles.headerTextActive : styles.headerTextInactive}>Bookmarks</Text>
        </TouchableOpacity>
      </View>
      {selectedData && (
        <ScannedDataBox data={selectedData} scanResult={selectedScanResult} dataType="URL" />
      )}
      <FlatList
        data={filteredQrCodes}
        renderItem={({ item, index }) => {
          console.log('item:', item); // Log the item data for debugging
          const itemData = item.data ? item.data.split('\n')[1]?.split('Data: ')[1] : 'Invalid data';
          return (
            <View style={styles.itemContainer}>
              <View style={styles.itemLeft}>
                <Ionicons name="qr-code-outline" size={24} color="#ff69b4" style={styles.qrIcon} />
                <TouchableOpacity onPress={() => handleItemPress(item)}>
                  <Text style={styles.dataText}>{itemData}</Text>
                </TouchableOpacity>
                <Text style={styles.dateText}>{new Date().toLocaleDateString('en-GB', {
                  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })}</Text>
              </View>
              <View style={styles.itemRight}>
                <TouchableOpacity onPress={() => toggleBookmark(index)}>
                  <Ionicons name={item.bookmarked ? "bookmark" : "bookmark-outline"} size={24} color={item.bookmarked ? "#2196F3" : "#ff69b4"} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteQRCode(index)}>
                  <Ionicons name="close-circle-outline" size={24} color="#ff69b4" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  headerTextActive: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff69b4',
  },
  headerTextInactive: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ccc',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffe6f0',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  itemLeft: {
    flexDirection: 'column',
  },
  itemRight: {
    flexDirection: 'row',
  },
  dataText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 12,
    color: '#000',
  },
  qrIcon: {
    marginBottom: 5,
  },
  flatListContent: {
    paddingBottom: 100,
  },
});

export default HistoryScreen;
